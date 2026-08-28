import LightningFS from '@isomorphic-git/lightning-fs'
import { FS_NAME, REPO_DIR } from './constants'

let fs = new LightningFS(FS_NAME)

export function getFs() {
  return fs
}

export function getPfs() {
  return fs.promises
}

export async function pathExists(filepath: string): Promise<boolean> {
  try {
    await getPfs().stat(filepath)
    return true
  } catch {
    return false
  }
}

export async function mkdirp(dirpath: string): Promise<void> {
  const parts = dirpath.split('/').filter(Boolean)
  let current = ''
  for (const part of parts) {
    current += `/${part}`
    if (await pathExists(current)) continue
    await getPfs().mkdir(current)
  }
}

export async function rmrf(target: string): Promise<void> {
  if (!(await pathExists(target))) return
  const stat = await getPfs().stat(target)
  if (stat.isDirectory()) {
    const names = await getPfs().readdir(target)
    for (const name of names) {
      await rmrf(`${target}/${name}`)
    }
    await getPfs().rmdir(target)
  } else {
    await getPfs().unlink(target)
  }
}

export async function wipeFilesystem(): Promise<void> {
  fs = new LightningFS(FS_NAME, { wipe: true })
  await new Promise((resolve) => setTimeout(resolve, 80))
}

export async function hasRepo(): Promise<boolean> {
  return pathExists(`${REPO_DIR}/.git`)
}

export function toAbs(filepath: string): string {
  if (filepath.startsWith(REPO_DIR)) return filepath
  return `${REPO_DIR}/${filepath.replace(/^\//, '')}`
}

export function toRel(filepath: string): string {
  if (filepath.startsWith(`${REPO_DIR}/`)) return filepath.slice(REPO_DIR.length + 1)
  return filepath.replace(/^\//, '')
}
