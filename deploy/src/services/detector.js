const OpenAI = require('openai');
const githubService = require('./github');
require('dotenv').config({ path: '../.env' });

class FrameworkDetector {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Detect framework by analyzing repo files
   */
  async detect(owner, repo) {
    try {
      // 1. Get root directory files
      const files = await githubService.getRepoContent(owner, repo);
      const fileNames = files.map(f => f.name);

      // 2. Quick heuristics
      if (fileNames.includes('next.config.js') || fileNames.includes('next.config.mjs')) {
        return {
          framework: 'Next.js',
          buildCommand: 'npm run build',
          outputDir: '.next',
        };
      }

      // 3. AI Analysis for more complex or ambiguous cases
      const packageJson = await githubService.getFileContent(owner, repo, 'package.json');
      
      const prompt = `
        Analyze these files and package.json content to detect the web framework and build configuration.
        Files: ${fileNames.join(', ')}
        Package.json Snippet: ${packageJson ? packageJson.substring(0, 1000) : 'None'}

        Return a JSON object with:
        {
          "framework": "Next.js | React | Vue | Vite | Static",
          "buildCommand": "the command to build the app",
          "outputDir": "the directory containing built files (e.g. out, dist, .next)"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error detecting framework:', error);
      return {
        framework: 'Static',
        buildCommand: 'echo "No build command"',
        outputDir: '.',
      };
    }
  }
}

module.exports = new FrameworkDetector();
