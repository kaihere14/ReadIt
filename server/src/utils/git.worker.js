import IORedis from "ioredis";
import { Queue } from "bullmq";
import { Worker } from "bullmq";
import User from "../schema/user.schema.js";
import ActiveRepo from "../schema/activeRepo.js";
import { decrypt } from "../controllers/oauthcontroller.js";
import { generateReadme } from "../services/groq.service.js";
import {
  getCommit,
  getRepoTree,
  getFileContent,
  commitFile,
  formatRepoTree,
  getFileLanguage,
  shouldIncludeFile,
  truncateContent,
} from "../services/github.service.js";
import {
  buildReadmeContext,
  optimizeContext,
  validateContext,
} from "./prompt.builder.js";

export const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  username: "default",
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error(
        "Redis connection failed after 3 retries. Stopping reconnection attempts."
      );
      return null; // Stop retrying
    }
    const delay = Math.min(times * 1000, 3000);
    console.log(`Retrying Redis connection in ${delay}ms (attempt ${times})`);
    return delay;
  },
  connectTimeout: 10000,
  lazyConnect: true, // Don't connect immediately
});

connection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

connection.on("connect", () => {
  console.log("Redis connected successfully");
});

// Attempt to connect
connection.connect().catch((err) => {
  console.error("Failed to connect to Redis:", err.message);
  console.log(
    "Redis is optional. Server will continue without queue functionality."
  );
});

export const readmeQueue = new Queue("readme-generation", {
  connection,
});

new Worker(
  "readme-generation",
  async (job) => {
    console.log("Processing job:", job.data);
    await aihandler(job.data);
  },
  {
    connection,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  }
);

/**
 * AI Handler - Processes README generation jobs
 * @param {Object} data - Job data from webhook
 */
const aihandler = async (data) => {
  const {
    userId,
    repoId,
    repoName,
    repoFullName,
    repoOwner,
    defaultBranch,
    commitSha,
  } = data;

  console.log(
    `[AI Handler] Starting README generation for ${repoFullName} at commit ${commitSha}`
  );

  try {
    // Step 1: Fetch user's GitHub token
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      throw new Error("GitHub access token not found for user");
    }

    const accessToken = decrypt(user.githubAccessToken);

    // Step 2: Get active repo record
    const activeRepo = await ActiveRepo.findOne({
      userId,
      repoId,
      active: true,
    });
    if (!activeRepo) {
      throw new Error("Active repository not found");
    }

    // Step 3: Fetch commit details
    console.log(`[AI Handler] Fetching commit details for ${commitSha}`);
    const commitData = await getCommit(
      accessToken,
      repoOwner,
      repoName,
      commitSha
    );

    // Step 4: Fetch repository structure
    console.log(`[AI Handler] Fetching repository structure`);
    let repoStructure = "";
    try {
      const treeData = await getRepoTree(
        accessToken,
        repoOwner,
        repoName,
        defaultBranch
      );
      repoStructure = formatRepoTree(treeData.tree, 3);
    } catch (error) {
      console.warn(`[AI Handler] Could not fetch repo tree: ${error.message}`);
      repoStructure = "Repository structure not available";
    }

    // Step 5: Fetch existing README
    console.log(`[AI Handler] Checking for existing README`);
    const readmeFileName = process.env.README_FILE_NAME || "README.md";
    let existingReadme = null;
    let existingReadmeSha = null;

    try {
      const readmeData = await getFileContent(
        accessToken,
        repoOwner,
        repoName,
        readmeFileName,
        defaultBranch
      );

      if (readmeData) {
        existingReadme = readmeData.content;
        existingReadmeSha = readmeData.sha;
        console.log(
          `[AI Handler] Found existing README (${readmeData.size} bytes)`
        );
      }
    } catch (error) {
      console.log(
        `[AI Handler] No existing README found or error fetching: ${error.message}`
      );
    }

    // Step 6: Fetch changed files content (only relevant files)
    console.log(`[AI Handler] Fetching changed files content`);
    const changedFilesContent = [];
    const relevantFiles = commitData.files.filter(
      (file) =>
        shouldIncludeFile(file.filename) &&
        (file.status === "added" || file.status === "modified")
    );

    // Limit to first 10 files to avoid context overflow
    const filesToFetch = relevantFiles.slice(0, 10);

    for (const file of filesToFetch) {
      try {
        const fileData = await getFileContent(
          accessToken,
          repoOwner,
          repoName,
          file.filename,
          defaultBranch
        );

        if (fileData) {
          changedFilesContent.push({
            path: file.filename,
            content: truncateContent(fileData.content, 100),
            language: getFileLanguage(file.filename),
            status: file.status,
          });
        }
      } catch (error) {
        console.warn(
          `[AI Handler] Could not fetch file ${file.filename}: ${error.message}`
        );
      }
    }

    console.log(
      `[AI Handler] Fetched ${changedFilesContent.length} changed files`
    );

    // Step 7: Build context for Groq API
    console.log(`[AI Handler] Building context for README generation`);
    let context = buildReadmeContext({
      repoName,
      repoOwner,
      repoStructure,
      existingReadme,
      commitData,
      changedFilesContent,
    });

    // Validate and optimize context
    const validation = validateContext(context);
    console.log(`[AI Handler] Context validation:`, validation);

    if (!validation.valid) {
      throw new Error(`Invalid context: ${validation.errors.join(", ")}`);
    }

    if (validation.warnings.length > 0) {
      console.warn(`[AI Handler] Context warnings:`, validation.warnings);
    }

    // Optimize if needed
    if (validation.estimatedTokens > 8000) {
      console.log(
        `[AI Handler] Optimizing context (${validation.estimatedTokens} tokens)`
      );
      context = optimizeContext(context, 8000);
    }

    // Step 8: Generate README using Groq API
    console.log(`[AI Handler] Calling Groq API to generate README`);
    const generatedReadme = await generateReadme(context);

    if (!generatedReadme || generatedReadme.trim().length === 0) {
      throw new Error("Groq API returned empty README");
    }

    console.log(
      `[AI Handler] Generated README (${generatedReadme.length} characters)`
    );

    // Step 9: Commit README back to repository
    console.log(`[AI Handler] Committing README to repository`);
    const commitMessage = "chore: auto-update README [skip ci]";

    const commitResult = await commitFile(
      accessToken,
      repoOwner,
      repoName,
      readmeFileName,
      generatedReadme,
      commitMessage,
      defaultBranch,
      existingReadmeSha
    );

    console.log(
      `[AI Handler] README committed successfully:`,
      commitResult.commit.sha
    );

    // Step 10: Update active repo metadata
    activeRepo.lastReadmeGeneratedAt = new Date();
    activeRepo.readmeGenerationCount =
      (activeRepo.readmeGenerationCount || 0) + 1;
    activeRepo.lastReadmeSha = commitResult.commit.sha;
    await activeRepo.save();

    console.log(
      `[AI Handler] ✓ README generation completed for ${repoFullName}`
    );

    return {
      success: true,
      commitSha: commitResult.commit.sha,
      readmeLength: generatedReadme.length,
    };
  } catch (error) {
    console.error(
      `[AI Handler] ✗ Error generating README for ${repoFullName}:`,
      error.message
    );
    console.error(error.stack);

    // Log error but don't throw - let BullMQ handle retries
    throw error;
  }
};
