import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

/**
 * Generate README content using Google Gemini API
 * @param {Object} context - Context object containing repository information
 * @param {string} context.repoName - Repository name
 * @param {string} context.repoOwner - Repository owner
 * @param {string} context.repoStructure - Repository file structure
 * @param {string} context.existingReadme - Existing README content (if any)
 * @param {string} context.commitDiff - Recent commit changes
 * @param {Array} context.changedFiles - Array of changed files with content
 * @returns {Promise<string>} Generated README content
 */
export async function generateReadme(context) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables");
    }

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(context);

    // Combine system and user prompts for Gemini
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await axios.post(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: combinedPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 second timeout
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from Gemini API");
    }

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (error.response) {
      // Gemini API error
      console.error("Gemini API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
      throw new Error(
        `Gemini API error: ${error.response.status} - ${
          error.response.data?.error?.message || "Unknown error"
        }`
      );
    } else if (error.request) {
      // Network error
      console.error("Network error calling Gemini API:", error.message);
      throw new Error("Network error: Unable to reach Gemini API");
    } else {
      // Other errors
      console.error("Error generating README:", error.message);
      throw error;
    }
  }
}

/**
 * Build system prompt for Gemini API
 * @returns {string} System prompt
 */
function buildSystemPrompt() {
  return `You are an expert technical documentation writer specializing in creating clear, comprehensive, and well-structured README files for software projects.

Your task is to generate or update README.md files based on repository context and recent changes.

Guidelines:
1. **Structure**: Follow standard README conventions with clear sections (Overview, Features, Installation, Usage, etc.)
2. **Preservation**: When updating an existing README, preserve important sections like custom badges, acknowledgments, license info, and unique project-specific content
3. **Clarity**: Write in clear, concise language suitable for developers of all levels
4. **Completeness**: Include all essential information: what the project does, how to install it, how to use it, and how to contribute
5. **Code Examples**: Include relevant code snippets and examples when appropriate
6. **Markdown**: Use proper Markdown formatting with headers, lists, code blocks, and links
7. **Accuracy**: Base your documentation on the actual code structure and changes provided
8. **Tone**: Professional yet approachable, avoiding unnecessary jargon

When updating an existing README:
- Preserve the overall structure and tone
- Update sections that are affected by recent changes
- Add new sections if new features or components are introduced
- Keep installation instructions, license, and contact information intact unless explicitly outdated

Output only the complete README content in Markdown format, without any preamble or explanation.`;
}

/**
 * Build user prompt with repository context
 * @param {Object} context - Repository context
 * @returns {string} User prompt
 */
function buildUserPrompt(context) {
  const {
    repoName,
    repoOwner,
    repoStructure,
    existingReadme,
    commitDiff,
    changedFiles,
  } = context;

  let prompt = `Generate ${
    existingReadme ? "an updated" : "a new"
  } README.md for the following repository:\n\n`;

  prompt += `**Repository**: ${repoOwner}/${repoName}\n\n`;

  // Repository structure
  if (repoStructure) {
    prompt += `**Repository Structure**:\n\`\`\`\n${repoStructure}\n\`\`\`\n\n`;
  }

  // Existing README
  if (existingReadme) {
    prompt += `**Existing README** (preserve important sections and update as needed):\n\`\`\`markdown\n${existingReadme}\n\`\`\`\n\n`;
  }

  // Commit changes
  if (commitDiff) {
    prompt += `**Recent Changes** (commit diff summary):\n\`\`\`\n${commitDiff}\n\`\`\`\n\n`;
  }

  // Changed files content
  if (changedFiles && changedFiles.length > 0) {
    prompt += `**Modified/Added Files**:\n\n`;
    changedFiles.forEach((file) => {
      prompt += `File: ${file.path}\n\`\`\`${file.language || ""}\n${
        file.content
      }\n\`\`\`\n\n`;
    });
  }

  if (existingReadme) {
    prompt += `Please update the README to reflect these changes while preserving the existing structure and important information.`;
  } else {
    prompt += `Please create a comprehensive README for this repository based on the structure and code provided.`;
  }

  return prompt;
}

/**
 * Estimate token count for context (rough approximation)
 * @param {Object} context - Context object
 * @returns {number} Estimated token count
 */
export function estimateTokenCount(context) {
  const text = JSON.stringify(context);
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

