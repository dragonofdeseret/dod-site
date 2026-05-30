const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "PUBLIC_SUPABASE_ANON_KEY": "test", "PUBLIC_SUPABASE_URL": "https://test.supabase.co", "SITE": "https://dragonofdeseret.com", "SSR": true};
function required(name) {
  const value = Object.assign(__vite_import_meta_env__, { GITHUB_REPO: process.env.GITHUB_REPO, _: process.env._, ADMIN_EMAIL: process.env.ADMIN_EMAIL, SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, GITHUB_TOKEN: process.env.GITHUB_TOKEN })[name] ?? process.env[name];
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Set it in .env (local) or Vercel project settings (deploy).`
    );
  }
  return String(value);
}
function optional(name) {
  const value = Object.assign(__vite_import_meta_env__, { GITHUB_REPO: process.env.GITHUB_REPO, _: process.env._, ADMIN_EMAIL: process.env.ADMIN_EMAIL, SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, GITHUB_TOKEN: process.env.GITHUB_TOKEN })[name] ?? process.env[name];
  return value ? String(value) : void 0;
}
const SUPABASE_URL = required("PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = required("PUBLIC_SUPABASE_ANON_KEY");
function getGithubToken() {
  return required("GITHUB_TOKEN");
}
function getGithubRepo() {
  const raw = required("GITHUB_REPO");
  const [owner, repo] = raw.split("/");
  if (!owner || !repo) {
    throw new Error(
      `GITHUB_REPO must be "owner/repo" (got "${raw}")`
    );
  }
  return {
    owner,
    repo,
    branch: optional("GITHUB_BRANCH") ?? "main"
  };
}
function getAdminEmail() {
  return required("ADMIN_EMAIL");
}

export { SUPABASE_ANON_KEY as S, SUPABASE_URL as a, getGithubRepo as b, getGithubToken as c, getAdminEmail as g };
