const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

class CloudflareService {
  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    this.baseUrl = 'https://api.cloudflare.com/client/v4';
  }

  /**
   * Upload built files to Cloudflare Pages
   */
  async deploy(projectName, buildDir) {
    if (!this.apiToken || !this.accountId) {
      throw new Error('Cloudflare credentials missing (CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID)');
    }

    try {
      // 1. Ensure project exists or create it
      await this.ensureProject(projectName);

      // 2. Deployment via Wrangler is often easier than direct API for large sets of files
      // But we'll try to implement the API flow or shell out to wrangler
      console.log(`Deploying ${projectName} from ${buildDir} to Cloudflare Pages...`);
      
      // For this implementation, we'll assume Wrangler is installed and configured
      // Or we use the Pages API /deployments
      // Direct API deployment for Pages involves creating a bundle. 
      // A simpler prototype uses wrangler:
      const { execSync } = require('child_process');
      const command = `npx wrangler pages deploy ${buildDir} --project-name ${projectName} --branch main`;
      
      const output = execSync(command, {
        env: {
          ...process.env,
          CLOUDFLARE_API_TOKEN: this.apiToken,
          CLOUDFLARE_ACCOUNT_ID: this.accountId
        }
      }).toString();

      // Extract URL from output (regex)
      const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.pages\.dev/);
      const url = urlMatch ? urlMatch[0] : `https://${projectName}.pages.dev`;

      return {
        url,
        logs: output.split('\n'),
      };
    } catch (error) {
      console.error('Cloudflare deployment failed:', error);
      throw error;
    }
  }

  async ensureProject(projectName) {
    try {
      await axios.get(`${this.baseUrl}/accounts/${this.accountId}/pages/projects/${projectName}`, {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Create project
        await axios.post(`${this.baseUrl}/accounts/${this.accountId}/pages/projects`, {
          name: projectName,
          production_branch: 'main',
        }, {
          headers: { Authorization: `Bearer ${this.apiToken}` },
        });
      } else {
        throw error;
      }
    }
  }
}

module.exports = new CloudflareService();
