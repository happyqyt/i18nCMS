export const FS_NAME = 'i18n-git-demo'
export const REPO_DIR = '/repo'
export const DEFAULT_CORS_PROXY = 'https://cors.isomorphic-git.org'
export const DEFAULT_AUTHOR = {
  name: 'i18n-editor',
  email: 'i18n@local.dev',
}

export const STORAGE_KEYS = {
  authorName: 'i18n-git-demo.authorName',
  authorEmail: 'i18n-git-demo.authorEmail',
  corsProxy: 'i18n-git-demo.corsProxy',
  token: 'i18n-git-demo.token',
  cloneUrl: 'i18n-git-demo.cloneUrl',
} as const
