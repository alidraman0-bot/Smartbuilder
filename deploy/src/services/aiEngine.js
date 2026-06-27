const OpenAI = require('openai');
require('dotenv').config({ path: '../.env' });

class AIEngine {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze build logs to identify issues and suggest fixes
   */
  async analyzeLogs(logs) {
    try {
      const logsString = Array.isArray(logs) ? logs.join('\n') : logs;
      
      const prompt = `
        You are a senior DevOps engineer. Analyze the following build logs and identify why the deployment failed.
        Provide a concise description of the issue and a suggested fix.
        
        Logs:
        ${logsString.substring(logsString.length - 3000)}

        Return a JSON object:
        {
          "issue": "detailed description of the error",
          "fix": "step-by-step fix (e.g. missing dependency, wrong build command)",
          "autoFix": true | false,
          "fixDetails": {
             "type": "dependency | command | config",
             "command": "suggested command to run"
          }
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing logs with AI:', error);
      return {
        issue: 'Unknown error during log analysis.',
        fix: 'Check the logs manually.',
        autoFix: false,
      };
    }
  }

  /**
   * Suggest optimizations for a repository
   */
  async suggestOptimizations(files) {
    // Future expansion
    return [];
  }
}

module.exports = new AIEngine();
