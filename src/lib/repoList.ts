// Repo URLs whose GitHub stars/forks/updatedAt feed the projects grid. The edge
// function (functions/api/project-stats.ts) fetches each one live; the client
// merges the result onto the SSG cards.
//
// Kept in sync with the `repo:` fields in src/data/projects.yml by hand —
// repoList.test.ts reads projects.yml and fails CI if the two drift.
export const REPO_URLS: string[] = [
  'https://github.com/timjstacey/resume-static-site',
  'https://github.com/timjstacey/linkedin-post-generator',
  'https://github.com/timjstacey/youtube-funny-videos',
  'https://github.com/timjstacey/agent-sandbox',
];
