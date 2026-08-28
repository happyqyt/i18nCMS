export type GitAuthor = {
  name: string
  email: string
}

export type FileStatus = 'unmodified' | 'modified' | 'added' | 'deleted' | 'untracked' | 'mixed'

export type FileEntry = {
  path: string
  status: FileStatus
}

export type CommitInfo = {
  oid: string
  short: string
  message: string
  author: string
  email: string
  date: string
}

export type DiffEntry = {
  filepath: string
  change: 'add' | 'delete' | 'modify'
}

export type MergeOutcome = {
  oid?: string
  alreadyMerged?: boolean
  fastForward?: boolean
  mergeCommit?: boolean
}

export type CloneProgress = {
  phase: string
  loaded: number
  total: number
}
