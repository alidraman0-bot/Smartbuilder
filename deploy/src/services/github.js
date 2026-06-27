const { Octokit } = require('octokit');
require('dotenv').config({ path: '../.env' }); // Adjust path as needed

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || '',
    });
  }

  /**
   * Fetch authenticated user's repositories
   */
  async getRepositories() {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      });
      return data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        url: repo.html_url,
        clone_url: repo.clone_url,
        description: repo.description,
        updated_at: repo.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      throw error;
    }
  }

  /**
   * Get repository content structure (recursive)
   */
  async getRepoContent(owner, repo, path = '') {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });
      return data;
    } catch (error) {
      console.error(`Error fetching content for ${owner}/${repo}/${path}:`, error);
      throw error;
    }
  }

  /**
   * Fetch a specific file's content
   */
  async getFileContent(owner, repo, path) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        mediaType: {
          format: 'raw',
        },
      });
      return data;
    } catch (error) {
      console.error(`Error fetching file content for ${path}:`, error);
      return null;
    }
  }
}

module.exports = new GitHubService();
