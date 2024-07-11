import core from '@actions/core';
import github from '@actions/github';
import { Octokit } from '@octokit/core';

/**
 * @param {import('@octokit/core').Octokit} kit
 * @param {string} owner
 * @param {string} repo
 * @param {string} branch
 */
const deleteBranch = async (kit, owner, repo, branch) => {
  if (branch === 'master' || branch === 'main') {
    throw new Error(`Cannot delete the ${branch} branch`);
  }

  if (branch === 'branch-for-ci-testing-in-repo') return;

  const response = await kit.request(
    'DELETE /repos/{owner}/{repo}/git/refs/heads/{branch}',
    {
      owner,
      repo,
      branch
    }
  );

  return response;
};

/**
 * @returns {Promise<void>}
 */
export async function run() {
  const auth = core.getInput('token', { required: true });
  const branch = core.getInput('branch', { required: true });
  const { repo, owner } = github.context.repo;
  const kit = new Octokit({ auth });
  try {
    core.info(`Deleting branch: [${branch}] in [${owner}/${repo}]`);
    await deleteBranch(kit, owner, repo, branch);
    core.info(`Deleted branch: [${branch}] in [${owner}/${repo}]`);
  } catch (error) {
    const {
      response: { data }
    } = error;
    const { status, message } = data;
    core.error(
      `Error: Failed to delete branch: [${branch}] in [${owner}/${repo}]`
    );
    core.error(
      `Error: Failed with status: [${status}] and message: [${message}]`
    );
    core.setFailed(data);
  }
}
