import git, { Errors } from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
import { DEFAULT_CORS_PROXY, REPO_DIR } from './constants'
import {
  getFs,
  getPfs,
  hasRepo,
  mkdirp,
  pathExists,
  rmrf,
  toAbs,
  toRel,
  wipeFilesystem,
} from './fs'
import { SEED_FILES } from './seed'
import type {
  CloneProgress,
  CommitInfo,
  DiffEntry,
  FileEntry,
  FileStatus,
  GitAuthor,
  MergeOutcome,
} from './types'

export type RemoteAuth = {
  corsProxy: string
  token: string
  onProgress?: (progress: CloneProgress) => void
}

const TEXT_EXTS = new Set([
  'json',
  'md',
  'txt',
  'yml',
  'yaml',
  'ts',
  'js',
  'vue',
  'css',
  'html',
  'csv',
  'xml',
  'properties',
])

function baseArgs() {
  return { fs: getFs(), dir: REPO_DIR }
}

function authArgs(auth?: Partial<RemoteAuth>) {
  const corsProxy = auth?.corsProxy || DEFAULT_CORS_PROXY
  const token = auth?.token?.trim() ?? ''
  return {
    http,
    corsProxy,
    onProgress: auth?.onProgress,
    onAuth: token
      ? () => ({ username: token, password: token })
      : undefined,
  }
}

function toCommitInfo(commit: { oid: string; commit: { message: string; author: { name: string; email: string; timestamp: number } } }): CommitInfo {
  const date = new Date(commit.commit.author.timestamp * 1000)
  return {
    oid: commit.oid,
    short: commit.oid.slice(0, 7),
    message: commit.commit.message.trim().split('\n')[0] ?? '',
    author: commit.commit.author.name,
    email: commit.commit.author.email,
    date: date.toLocaleString(),
  }
}

function statusFromRow(head: number, workdir: number, stage: number): FileStatus {
  if (head === 1 && workdir === 1 && stage === 1) return 'unmodified'
  if (head === 0 && workdir === 2 && stage === 0) return 'untracked'
  if (head === 0) return 'added'
  if (workdir === 0) return 'deleted'
  if (workdir === 2) return 'modified'
  return 'mixed'
}

async function walkFiles(dirpath: string): Promise<string[]> {
  if (!(await pathExists(dirpath))) return []
  const names = await getPfs().readdir(dirpath)
  const files: string[] = []
  for (const name of names) {
    if (name === '.git') continue
    const full = `${dirpath}/${name}`
    const stat = await getPfs().stat(full)
    if (stat.isDirectory()) files.push(...(await walkFiles(full)))
    else files.push(toRel(full))
  }
  return files.sort((a, b) => a.localeCompare(b))
}

export async function writeTextFile(filepath: string, content: string): Promise<void> {
  const abs = toAbs(filepath)
  await mkdirp(abs.split('/').slice(0, -1).join('/') || '/')
  await getPfs().writeFile(abs, content, 'utf8')
}

export async function readTextFile(filepath: string): Promise<string> {
  return getPfs().readFile(toAbs(filepath), 'utf8')
}

export async function stageAll(): Promise<number> {
  const matrix = await git.statusMatrix({ ...baseArgs() })
  let count = 0
  for (const [filepath, head, workdir] of matrix) {
    if (head === 1 && workdir === 0) {
      await git.remove({ ...baseArgs(), filepath })
      count += 1
    } else if (workdir === 2 || (head === 0 && workdir !== 0)) {
      await git.add({ ...baseArgs(), filepath })
      count += 1
    }
  }
  return count
}

export const gitEngine = {
  hasRepo,

  async initSeed(author: GitAuthor): Promise<string> {
    if (await hasRepo()) await rmrf(REPO_DIR)
    await mkdirp(REPO_DIR)
    await git.init({ ...baseArgs(), defaultBranch: 'main' })
    for (const [filepath, content] of Object.entries(SEED_FILES)) {
      await writeTextFile(filepath, content)
    }
    await stageAll()
    const oid = await git.commit({
      ...baseArgs(),
      message: 'chore: seed i18n copywriting workspace',
      author,
    })
    await git.branch({ ...baseArgs(), ref: 'draft', checkout: true })
    return oid
  },

  async clone(url: string, auth: Partial<RemoteAuth> = {}): Promise<void> {
    if (await hasRepo()) await rmrf(REPO_DIR)
    await mkdirp(REPO_DIR)
    await git.clone({
      ...baseArgs(),
      ...authArgs(auth),
      url: url.trim(),
      singleBranch: false,
      depth: 30,
      noTags: false,
    })
  },

  async pull(author: GitAuthor, auth: Partial<RemoteAuth> = {}): Promise<void> {
    await git.pull({
      ...baseArgs(),
      ...authArgs(auth),
      author,
      singleBranch: false,
    })
  },

  async fetch(auth: Partial<RemoteAuth> = {}): Promise<void> {
    await git.fetch({
      ...baseArgs(),
      ...authArgs(auth),
      singleBranch: false,
      tags: true,
    })
  },

  async push(auth: Partial<RemoteAuth> = {}): Promise<void> {
    await git.push({
      ...baseArgs(),
      ...authArgs(auth),
    })
  },

  async currentBranch(): Promise<string | undefined> {
    const name = await git.currentBranch({ ...baseArgs(), fullname: false })
    return name || undefined
  },

  async listBranches(): Promise<string[]> {
    const local = await git.listBranches({ ...baseArgs() })
    let remote: string[] = []
    try {
      remote = await git.listBranches({ ...baseArgs(), remote: 'origin' })
    } catch {
      remote = []
    }
    return [...new Set([...local, ...remote.map((name) => `origin/${name}`)])]
  },

  async listTags(): Promise<string[]> {
    return git.listTags({ ...baseArgs() })
  },

  async resolveHead(): Promise<string> {
    return git.resolveRef({ ...baseArgs(), ref: 'HEAD' })
  },

  async listRemotes(): Promise<{ remote: string; url: string }[]> {
    try {
      return await git.listRemotes({ ...baseArgs() })
    } catch {
      return []
    }
  },

  async log(depth = 80): Promise<CommitInfo[]> {
    const commits = await git.log({ ...baseArgs(), depth })
    return commits.map(toCommitInfo)
  },

  async listFiles(): Promise<string[]> {
    return walkFiles(REPO_DIR)
  },

  async status(): Promise<FileEntry[]> {
    const matrix = await git.statusMatrix({ ...baseArgs() })
    return matrix.map(([filepath, head, workdir, stage]) => ({
      path: filepath,
      status: statusFromRow(head, workdir, stage),
    }))
  },

  async readFile(filepath: string): Promise<string> {
    return readTextFile(filepath)
  },

  async readFileAt(ref: string, filepath: string): Promise<string> {
    const { blob } = await git.readBlob({
      ...baseArgs(),
      oid: ref,
      filepath,
    })
    return new TextDecoder().decode(blob)
  },

  async writeFile(filepath: string, content: string): Promise<void> {
    await writeTextFile(filepath, content)
  },

  async deleteFile(filepath: string): Promise<void> {
    const abs = toAbs(filepath)
    if (await pathExists(abs)) await getPfs().unlink(abs)
  },

  isProbablyText(filepath: string): boolean {
    const ext = filepath.split('.').pop()?.toLowerCase() ?? ''
    return TEXT_EXTS.has(ext)
  },

  async commit(message: string, author: GitAuthor): Promise<string> {
    const staged = await stageAll()
    if (staged === 0) {
      throw new Error('没有可提交的变更')
    }
    return git.commit({
      ...baseArgs(),
      message: message.trim() || 'update copywriting',
      author,
    })
  },

  async checkout(ref: string): Promise<void> {
    await git.checkout({
      ...baseArgs(),
      ref,
      force: true,
    })
  },

  async createBranch(name: string, checkout = true): Promise<void> {
    await git.branch({
      ...baseArgs(),
      ref: name.trim(),
      checkout,
    })
  },

  async merge(theirs: string, author: GitAuthor): Promise<MergeOutcome> {
    const ours = await gitEngine.currentBranch()
    if (!ours) throw new Error('当前处于游离 HEAD，无法合并')
    try {
      return await git.merge({
        ...baseArgs(),
        ours,
        theirs,
        author,
        abortOnConflict: true,
      })
    } catch (error) {
      if (error instanceof Errors.MergeConflictError) {
        const files = (error.data as { filepaths?: string[] } | undefined)?.filepaths
        throw new Error(`合并冲突：${files?.join(', ') || error.message}`)
      }
      throw error
    }
  },

  async restoreFrom(ref: string): Promise<string[]> {
    const targetFiles = await git.listFiles({ ...baseArgs(), ref })
    const currentFiles = await git.listFiles({ ...baseArgs() })
    const restored: string[] = []

    for (const filepath of currentFiles) {
      if (!targetFiles.includes(filepath)) {
        await gitEngine.deleteFile(filepath)
        restored.push(filepath)
      }
    }

    for (const filepath of targetFiles) {
      const content = await gitEngine.readFileAt(ref, filepath)
      await writeTextFile(filepath, content)
      restored.push(filepath)
    }
    return [...new Set(restored)]
  },

  async resetHard(ref: string): Promise<void> {
    const branch = await gitEngine.currentBranch()
    const oid = await git.resolveRef({ ...baseArgs(), ref })
    if (branch) {
      await git.writeRef({
        ...baseArgs(),
        ref: `refs/heads/${branch}`,
        value: oid,
        force: true,
      })
      await git.checkout({ ...baseArgs(), ref: branch, force: true })
      return
    }
    await git.checkout({ ...baseArgs(), ref: oid, force: true })
  },

  async lockVersion(tag: string, oid?: string): Promise<void> {
    await git.tag({
      ...baseArgs(),
      ref: tag.trim(),
      ...(oid ? { object: oid } : {}),
    })
  },

  async diff(a: string, b: string): Promise<DiffEntry[]> {
    const entries = await git.walk({
      ...baseArgs(),
      trees: [git.TREE({ ref: a }), git.TREE({ ref: b })],
      map: async (filepath, [left, right]) => {
        if (filepath === '.') return
        const leftType = await left?.type()
        const rightType = await right?.type()
        if (leftType === 'tree' || rightType === 'tree') return
        const leftOid = await left?.oid()
        const rightOid = await right?.oid()
        if (leftOid === rightOid) return
        let change: DiffEntry['change'] = 'modify'
        if (!left) change = 'add'
        else if (!right) change = 'delete'
        return { filepath, change } satisfies DiffEntry
      },
    })
    const flat = (Array.isArray(entries) ? entries.flat(8) : []) as unknown[]
    return flat.filter((item): item is DiffEntry => {
      return !!item && typeof item === 'object' && 'filepath' in item && 'change' in item
    })
  },

  async wipe(): Promise<void> {
    await wipeFilesystem()
  },
}

export function formatError(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
