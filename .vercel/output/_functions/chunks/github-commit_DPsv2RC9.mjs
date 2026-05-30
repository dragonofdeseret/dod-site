import { Octokit } from '@octokit/rest';
import { b as getGithubRepo, c as getGithubToken } from './env_D020CG04.mjs';

let cached = null;
function client() {
  if (!cached) cached = new Octokit({ auth: getGithubToken() });
  return cached;
}
async function commitFile(args) {
  const { owner, repo, branch } = getGithubRepo();
  const gh = client();
  let existingSha;
  try {
    const existing = await gh.repos.getContent({
      owner,
      repo,
      path: args.path,
      ref: branch
    });
    if (!Array.isArray(existing.data) && "sha" in existing.data) {
      existingSha = existing.data.sha;
    }
  } catch (err) {
    const status = err?.status;
    if (status !== 404) throw err;
  }
  const encoded = Buffer.from(args.content, "utf8").toString("base64");
  const result = await gh.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: args.path,
    branch,
    message: args.message,
    content: encoded,
    sha: existingSha
  });
  return {
    commitSha: result.data.commit.sha ?? "",
    contentSha: result.data.content?.sha ?? ""
  };
}
async function deleteFile(args) {
  const { owner, repo, branch } = getGithubRepo();
  const gh = client();
  const existing = await gh.repos.getContent({
    owner,
    repo,
    path: args.path,
    ref: branch
  });
  if (Array.isArray(existing.data) || !("sha" in existing.data)) {
    throw new Error(`Cannot delete: ${args.path} isn't a file`);
  }
  const result = await gh.repos.deleteFile({
    owner,
    repo,
    path: args.path,
    branch,
    message: args.message,
    sha: existing.data.sha
  });
  return { commitSha: result.data.commit.sha ?? "" };
}

export { commitFile as c, deleteFile as d };
