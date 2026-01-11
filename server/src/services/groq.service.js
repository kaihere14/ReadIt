import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Generate README content using Groq API
 * @param {Object} context - Context object containing repository information
 * @param {string} context.repoName - Repository name
 * @param {string} context.repoOwner - Repository owner
 * @param {string} context.repoStructure - Repository file structure
 * @param {string} context.existingReadme - Existing README content (if any)
 * @param {string} context.commitDiff - Recent commit changes
 * @param {Array} context.changedFiles - Array of changed files with content
 * @param {Array} context.fullCodebase - Array of all source files for full analysis (used when README is missing or shallow)
 * @returns {Promise<string>} Generated README content
 */
export async function generateReadme(context) {
  // Fallback API keys
  const apiKeys = [
    process.env.GROQ_API_KEY1,process.env.GROQ_API_KEY2,process.env.GROQ_API_KEY3
  ];

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(context);

  let lastError = null;

  // Try each API key in sequence
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];

    try {
      console.log(`Attempting request with API key ${i + 1}/${apiKeys.length}`);

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 32768,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 60000, // 60 second timeout
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error("Invalid response from Groq API");
      }

      console.log(`Successfully generated README with API key ${i + 1}`);
      return response.data.choices[0].message.content;
    } catch (error) {
      lastError = error;

      if (error.response) {
        // Groq API error
        console.error(`Groq API Error with key ${i + 1}:`, {
          status: error.response.status,
          data: error.response.data,
        });

        // If it's a rate limit or auth error, try next key
        if (error.response.status === 429 || error.response.status === 401) {
          console.log(
            `Key ${i + 1} failed (${error.response.status}), trying next key...`
          );
          continue;
        }

        // For other API errors, throw immediately
        throw new Error(
          `Groq API error: ${error.response.status} - ${
            error.response.data?.error?.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        // Network error - try next key
        console.error(`Network error with key ${i + 1}:`, error.message);
        console.log("Trying next key...");
        continue;
      } else {
        // Other errors - throw immediately
        console.error("Error generating README:", error.message);
        throw error;
      }
    }
  }

  // All keys failed
  console.error("All API keys exhausted");
  if (lastError?.response) {
    throw new Error(
      `All API keys failed. Last error: ${lastError.response.status} - ${
        lastError.response.data?.error?.message || "Unknown error"
      }`
    );
  } else if (lastError?.request) {
    throw new Error("Network error: Unable to reach Groq API with any key");
  } else {
    throw new Error("Failed to generate README with all available API keys");
  }
}

/**
 * Build system prompt for Groq API
 * @returns {string} System prompt
 */
function buildSystemPrompt() {
  return `You are an elite technical documentation architect with deep expertise in creating world-class README files that serve as the definitive guide for software projects.

Your mission is to generate comprehensive, professional-grade README.md files that developers will love.

## ANALYSIS MODE DETERMINATION:

First, assess the situation:
1. **FULL CODEBASE ANALYSIS** (Required when):
   - No README exists
   - Existing README is minimal (< 500 words or missing key sections)
   - README lacks technical depth (no code examples, no architecture info)
   - Major structural changes detected in commits

2. **INCREMENTAL UPDATE** (Appropriate when):
   - Existing README is comprehensive (has all major sections with depth)
   - Changes are localized to specific features
   - README accurately reflects current architecture

## COMPREHENSIVE README STRUCTURE:

Generate READMEs with ALL of the following sections (adapt depth based on project complexity):

### 1. Header & Badges
- Project logo/banner (if applicable)
- Descriptive tagline
- Status badges (build, coverage, version, license)
- Quick links (demo, docs, issues)

### 2. Overview
- Clear 2-3 sentence description of what the project does
- Key value proposition - why use this?
- Target audience
- Current status/version

### 3. Features
- Comprehensive feature list with descriptions
- Highlight unique/standout capabilities
- Group related features logically
- Include feature status (stable, beta, experimental)

### 4. Tech Stack
- Languages and frameworks used
- Key dependencies with purposes
- Database/storage solutions
- External services/APIs

### 5. Architecture (for non-trivial projects)
- High-level system design
- Directory structure explanation
- Key components and their relationships
- Data flow overview

### 6. Getting Started
#### Prerequisites
- Required software with minimum versions
- System requirements
- Account/API key requirements

#### Installation
- Step-by-step installation guide
- Multiple installation methods if applicable (npm, Docker, source)
- Verification steps

#### Configuration
- Environment variables with descriptions
- Configuration file options
- Example .env file content

### 7. Usage
- Basic usage examples with code
- Common use cases
- API reference (if applicable)
- CLI commands (if applicable)
- Screenshots/GIFs for visual projects

### 8. Development
- Setting up development environment
- Running tests
- Code style guidelines
- Debugging tips

### 9. Deployment
- Production deployment steps
- Docker/container instructions
- Cloud platform guides (if relevant)
- Performance considerations

### 10. API Documentation (if applicable)
- Endpoints with request/response examples
- Authentication methods
- Rate limits
- Error codes

### 11. Contributing
- How to contribute
- Development workflow
- Pull request process
- Code review guidelines

### 12. Troubleshooting
- Common issues and solutions
- FAQ section
- Where to get help

### 13. Roadmap (if known)
- Planned features
- Known limitations

### 14. License & Credits
- License type with link
- Contributors
- Acknowledgments
- Third-party attributions

## QUALITY STANDARDS:

1. **Technical Accuracy**: Every code example must be correct and runnable
2. **Completeness**: Don't skip sections - adapt depth to project size
3. **Clarity**: A developer should be able to get started in under 5 minutes
4. **Maintainability**: Write in a way that's easy to update
5. **Professionalism**: Consistent formatting, proper grammar, no typos
6. **Code Examples**: Include real, working examples from the codebase
7. **Copy-Paste Ready**: All commands should work when copy-pasted

## PRESERVATION RULES (when updating):

- NEVER remove existing badges, acknowledgments, or license info
- Preserve custom sections unique to the project
- Maintain the project's voice and tone
- Keep contributor lists intact
- Update version numbers and dates appropriately

Output ONLY the complete README in Markdown format. No explanations, no preamble.`;
}

/**
 * Analyze README depth and determine update strategy
 * @param {string} existingReadme - Existing README content
 * @returns {Object} Analysis result with strategy ('full', 'enhance', 'incremental')
 */
export function analyzeReadmeDepth(existingReadme) {
  if (!existingReadme) {
    return {
      strategy: "full",
      reason: "No README exists",
      needsFullCodebase: true,
    };
  }

  const wordCount = existingReadme.split(/\s+/).length;
  const hasCodeBlocks = (existingReadme.match(/```/g) || []).length >= 2;
  const hasMultipleSections =
    (existingReadme.match(/^#{1,3}\s/gm) || []).length >= 5;
  const hasInstallation = /install|setup|getting started/i.test(existingReadme);
  const hasUsage = /usage|example|how to use/i.test(existingReadme);
  const hasArchitecture = /architecture|structure|design|component/i.test(
    existingReadme
  );
  const hasAPI = /api|endpoint|route/i.test(existingReadme);

  const depthScore = [
    wordCount > 500,
    hasCodeBlocks,
    hasMultipleSections,
    hasInstallation,
    hasUsage,
    hasArchitecture,
    hasAPI,
  ].filter(Boolean).length;

  if (depthScore >= 5) {
    return {
      strategy: "incremental",
      reason: "README is comprehensive",
      depthScore,
      needsFullCodebase: false,
    };
  } else if (depthScore >= 3) {
    return {
      strategy: "enhance",
      reason: "README exists but needs more depth",
      depthScore,
      needsFullCodebase: true,
    };
  } else {
    return {
      strategy: "full",
      reason: "README is minimal and needs complete rewrite",
      depthScore,
      needsFullCodebase: true,
    };
  }
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
    fullCodebase, // New: full codebase content for deep analysis
  } = context;

  // Analyze existing README depth
  const analysis = analyzeReadmeDepth(existingReadme);

  let prompt = "";

  // Add analysis context for the AI
  prompt += `## ANALYSIS RESULT\n`;
  prompt += `**Strategy**: ${analysis.strategy.toUpperCase()}\n`;
  prompt += `**Reason**: ${analysis.reason}\n`;
  if (analysis.depthScore !== undefined) {
    prompt += `**Depth Score**: ${analysis.depthScore}/7\n`;
  }
  prompt += `\n---\n\n`;

  // Determine task based on strategy
  if (analysis.strategy === "full") {
    prompt += `## TASK: FULL README GENERATION\n\n`;
    prompt += `Create a comprehensive, production-ready README.md from scratch using the FULL codebase context provided below.\n\n`;
    prompt += `**Repository**: ${repoOwner}/${repoName}\n\n`;
  } else if (analysis.strategy === "enhance") {
    prompt += `## TASK: README ENHANCEMENT\n\n`;
    prompt += `The existing README lacks depth. Significantly expand it using the full codebase context while preserving existing content.\n\n`;
    prompt += `**Repository**: ${repoOwner}/${repoName}\n\n`;
  } else {
    prompt += `## TASK: INCREMENTAL UPDATE\n\n`;
    prompt += `The README is comprehensive. Only update sections affected by the recent commits. Preserve everything else.\n\n`;
    prompt += `**Repository**: ${repoOwner}/${repoName}\n\n`;
  }

  // Repository structure (always include)
  if (repoStructure) {
    prompt += `## REPOSITORY STRUCTURE\n\`\`\`\n${repoStructure}\n\`\`\`\n\n`;
  }

  // For full or enhance strategies, include full codebase
  if (analysis.strategy === "full" || analysis.strategy === "enhance") {
    if (fullCodebase && fullCodebase.length > 0) {
      prompt += `## FULL CODEBASE ANALYSIS\n\n`;
      prompt += `The following are the key source files for understanding this project:\n\n`;

      fullCodebase.forEach((file) => {
        const lang = getLanguageFromPath(file.path);
        prompt += `### File: \`${file.path}\`\n`;
        if (file.description) {
          prompt += `*${file.description}*\n`;
        }
        prompt += `\`\`\`${lang}\n${file.content}\n\`\`\`\n\n`;
      });
    }

    // Also include changed files for additional context
    if (changedFiles && changedFiles.length > 0) {
      prompt += `## RECENTLY CHANGED FILES\n\n`;
      changedFiles.forEach((file) => {
        const lang = file.language || getLanguageFromPath(file.path);
        prompt += `### File: \`${file.path}\`\n`;
        prompt += `\`\`\`${lang}\n${file.content}\n\`\`\`\n\n`;
      });
    }
  } else {
    // Incremental update - only show diffs and changed files
    if (commitDiff) {
      prompt += `## RECENT COMMIT CHANGES\n`;
      prompt += `Analyze these changes to determine what README sections need updating:\n`;
      prompt += `\`\`\`diff\n${commitDiff}\n\`\`\`\n\n`;
    }

    if (changedFiles && changedFiles.length > 0) {
      prompt += `## MODIFIED FILES (Current Content)\n\n`;
      changedFiles.forEach((file) => {
        const lang = file.language || getLanguageFromPath(file.path);
        prompt += `### File: \`${file.path}\`\n`;
        prompt += `\`\`\`${lang}\n${file.content}\n\`\`\`\n\n`;
      });
    }
  }

  // Existing README (always include if exists)
  if (existingReadme) {
    prompt += `## EXISTING README\n`;
    if (analysis.strategy === "incremental") {
      prompt += `*This README is comprehensive. Preserve structure and only update affected sections.*\n\n`;
    } else {
      prompt += `*This README needs significant enhancement. Use it as a base but expand considerably.*\n\n`;
    }
    prompt += `\`\`\`markdown\n${existingReadme}\n\`\`\`\n\n`;
  }

  // Final instructions based on strategy
  prompt += `---\n\n## INSTRUCTIONS\n\n`;

  if (analysis.strategy === "full") {
    prompt += `Generate a **complete, production-ready README** with ALL sections from the system prompt.
- Analyze the entire codebase to understand the project's purpose, architecture, and usage
- Include real code examples extracted from the actual source files
- Document all configuration options found in the code
- Explain the project structure based on the file tree
- Create comprehensive installation and usage guides
- Be thorough - this is the project's primary documentation`;
  } else if (analysis.strategy === "enhance") {
    prompt += `**Significantly enhance** the existing README:
- Keep all existing content that is accurate
- Add missing sections (check against the comprehensive structure in system prompt)
- Expand shallow sections with more detail and code examples
- Add architecture/technical details based on codebase analysis
- Improve code examples with real usage patterns from the source
- Ensure installation and usage guides are complete and accurate`;
  } else {
    prompt += `**Incrementally update** the README:
- ONLY modify sections directly affected by the commit changes
- Keep all unaffected sections EXACTLY as they are
- Update version numbers, feature lists, or API docs if changed
- Add documentation for any new features introduced
- Fix any documentation that the changes have made outdated
- Do NOT restructure or rewrite sections that weren't affected`;
  }

  return prompt;
}

/**
 * Get language identifier from file path
 * @param {string} filePath - File path
 * @returns {string} Language identifier for code blocks
 */
function getLanguageFromPath(filePath) {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const langMap = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    php: "php",
    cs: "csharp",
    cpp: "cpp",
    c: "c",
    h: "c",
    hpp: "cpp",
    md: "markdown",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    html: "html",
    css: "css",
    scss: "scss",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    dockerfile: "dockerfile",
    prisma: "prisma",
  };
  return langMap[ext] || ext || "";
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
