import { computed, reactive, ref } from 'vue'
import { DEFAULT_AUTHOR, DEFAULT_CORS_PROXY, STORAGE_KEYS } from '../git/constants'
import { formatError, gitEngine } from '../git/engine'
import { isLocaleJsonPath, localeFromPath, parseLocaleJson, serializeLocaleJson } from '../git/json'
import type { CommitInfo, DiffEntry, FileEntry, FileStatus } from '../git/types'

function readStore(key: string, fallback: string): string {
  return localStorage.getItem(key) || fallback
}

export type LocaleBundle = {
  path: string
  lang: string
  nested: boolean
  flat: Record<string, string>
}

export function useGitRepo() {
  const loading = ref(false)
  const message = ref('')
  const error = ref('')
  const hasRepo = ref(false)
  const branch = ref('')
  const head = ref('')
  const branches = ref<string[]>([])
  const tags = ref<string[]>([])
  const remotes = ref<{ remote: string; url: string }[]>([])
  const files = ref<string[]>([])
  const fileStatus = ref<FileEntry[]>([])
  const commits = ref<CommitInfo[]>([])
  const currentFile = ref('')
  const fileContent = ref('')
  const previewRef = ref('')
  const locales = ref<LocaleBundle[]>([])
  const dirtyLocales = ref(false)
  const lastDiff = ref<DiffEntry[]>([])
  const progress = ref('')

  const settings = reactive({
    authorName: readStore(STORAGE_KEYS.authorName, DEFAULT_AUTHOR.name),
    authorEmail: readStore(STORAGE_KEYS.authorEmail, DEFAULT_AUTHOR.email),
    corsProxy: readStore(STORAGE_KEYS.corsProxy, DEFAULT_CORS_PROXY),
    token: readStore(STORAGE_KEYS.token, ''),
    cloneUrl: readStore(STORAGE_KEYS.cloneUrl, 'https://github.com/octocat/Hello-World'),
    commitMessage: '',
    newBranch: 'draft',
    mergeFrom: '',
    tagName: '',
    diffFrom: '',
    diffTo: 'HEAD',
  })

  const author = computed(() => ({
    name: settings.authorName.trim() || DEFAULT_AUTHOR.name,
    email: settings.authorEmail.trim() || DEFAULT_AUTHOR.email,
  }))

  const remoteAuth = computed(() => ({
    corsProxy: settings.corsProxy.trim() || DEFAULT_CORS_PROXY,
    token: settings.token.trim(),
    onProgress: (event: { phase: string; loaded: number; total: number }) => {
      progress.value = event.total
        ? `${event.phase} ${event.loaded}/${event.total}`
        : event.phase
    },
  }))

  const dirtyFiles = computed(() =>
    fileStatus.value.filter((item) => item.status !== 'unmodified'),
  )

  const statusMap = computed(() => {
    const map: Record<string, FileStatus> = {}
    for (const item of fileStatus.value) map[item.path] = item.status
    return map
  })

  const allCopyKeys = computed(() => {
    const keys = new Set<string>()
    for (const bundle of locales.value) {
      for (const key of Object.keys(bundle.flat)) keys.add(key)
    }
    return [...keys].sort((a, b) => a.localeCompare(b))
  })

  function persistSettings() {
    localStorage.setItem(STORAGE_KEYS.authorName, settings.authorName)
    localStorage.setItem(STORAGE_KEYS.authorEmail, settings.authorEmail)
    localStorage.setItem(STORAGE_KEYS.corsProxy, settings.corsProxy)
    localStorage.setItem(STORAGE_KEYS.token, settings.token)
    localStorage.setItem(STORAGE_KEYS.cloneUrl, settings.cloneUrl)
  }

  function note(text: string) {
    message.value = text
    error.value = ''
  }

  async function run<T>(label: string, task: () => Promise<T>): Promise<T | undefined> {
    loading.value = true
    error.value = ''
    progress.value = label
    try {
      const result = await task()
      note(label)
      return result
    } catch (err) {
      error.value = formatError(err)
      message.value = ''
      return undefined
    } finally {
      loading.value = false
      progress.value = ''
    }
  }

  async function loadLocales() {
    const localeFiles = files.value.filter(isLocaleJsonPath)
    const next: LocaleBundle[] = []
    for (const path of localeFiles) {
      try {
        const raw = await gitEngine.readFile(path)
        const parsed = parseLocaleJson(raw)
        next.push({
          path,
          lang: localeFromPath(path),
          nested: parsed.nested,
          flat: parsed.flat,
        })
      } catch {
        // skip invalid json
      }
    }
    locales.value = next
    dirtyLocales.value = false
  }

  async function refresh() {
    try {
      hasRepo.value = await gitEngine.hasRepo()
      if (!hasRepo.value) {
        branch.value = ''
        head.value = ''
        branches.value = []
        tags.value = []
        remotes.value = []
        files.value = []
        fileStatus.value = []
        commits.value = []
        locales.value = []
        fileContent.value = ''
        currentFile.value = ''
        previewRef.value = ''
        return
      }
      branch.value = (await gitEngine.currentBranch()) || '(detached)'
      head.value = await gitEngine.resolveHead()
      branches.value = await gitEngine.listBranches()
      tags.value = await gitEngine.listTags()
      remotes.value = await gitEngine.listRemotes()
      files.value = await gitEngine.listFiles()
      fileStatus.value = await gitEngine.status()
      commits.value = await gitEngine.log()
      await loadLocales()
      if (currentFile.value && files.value.includes(currentFile.value)) {
        await openFile(currentFile.value)
      } else if (files.value.length > 0) {
        const preferred =
          files.value.find((path) => path.endsWith('zh-CN.json')) ||
          files.value.find(isLocaleJsonPath) ||
          files.value[0]
        await openFile(preferred)
      }
    } catch (err) {
      error.value = formatError(err)
    }
  }

  async function openFile(filepath: string) {
    currentFile.value = filepath
    if (previewRef.value) {
      fileContent.value = await gitEngine.readFileAt(previewRef.value, filepath)
      return
    }
    fileContent.value = await gitEngine.readFile(filepath)
  }

  async function saveCurrentFile() {
    if (!currentFile.value) return
    await gitEngine.writeFile(currentFile.value, fileContent.value)
    await refresh()
    note(`已写入 ${currentFile.value}（尚未 commit）`)
  }

  function setLocaleValue(lang: string, key: string, value: string) {
    const bundle = locales.value.find((item) => item.lang === lang)
    if (!bundle) return
    bundle.flat[key] = value
    dirtyLocales.value = true
  }

  function addCopyKey(key: string) {
    const trimmed = key.trim()
    if (!trimmed) return
    for (const bundle of locales.value) {
      if (!(trimmed in bundle.flat)) bundle.flat[trimmed] = ''
    }
    dirtyLocales.value = true
  }

  function removeCopyKey(key: string) {
    for (const bundle of locales.value) {
      delete bundle.flat[key]
    }
    dirtyLocales.value = true
  }

  async function saveLocales() {
    await run('保存文案到工作区', async () => {
      for (const bundle of locales.value) {
        await gitEngine.writeFile(bundle.path, serializeLocaleJson(bundle.flat, bundle.nested))
      }
      dirtyLocales.value = false
      await refresh()
    })
  }

  async function initSeed() {
    persistSettings()
    await run('初始化本地文案仓库', async () => {
      await gitEngine.initSeed(author.value)
      previewRef.value = ''
      await refresh()
    })
  }

  async function cloneRepo() {
    persistSettings()
    await run('克隆远程仓库', async () => {
      await gitEngine.clone(settings.cloneUrl, remoteAuth.value)
      previewRef.value = ''
      await refresh()
    })
  }

  async function pull() {
    persistSettings()
    await run('拉取远程更新', async () => {
      await gitEngine.pull(author.value, remoteAuth.value)
      await refresh()
    })
  }

  async function fetchRemote() {
    persistSettings()
    await run('fetch 远程引用', async () => {
      await gitEngine.fetch(remoteAuth.value)
      await refresh()
    })
  }

  async function push() {
    persistSettings()
    await run('推送到远程', async () => {
      await gitEngine.push(remoteAuth.value)
    })
  }

  async function commit() {
    persistSettings()
    await run('提交版本', async () => {
      if (dirtyLocales.value) {
        for (const bundle of locales.value) {
          await gitEngine.writeFile(bundle.path, serializeLocaleJson(bundle.flat, bundle.nested))
        }
        dirtyLocales.value = false
      }
      const oid = await gitEngine.commit(settings.commitMessage, author.value)
      settings.commitMessage = ''
      previewRef.value = ''
      await refresh()
      note(`已提交 ${oid.slice(0, 7)}`)
    })
  }

  async function checkout(ref: string) {
    await run(`切换到 ${ref}`, async () => {
      await gitEngine.checkout(ref)
      previewRef.value = ''
      await refresh()
    })
  }

  async function createBranch() {
    await run(`创建分支 ${settings.newBranch}`, async () => {
      await gitEngine.createBranch(settings.newBranch)
      await refresh()
    })
  }

  async function mergeFrom() {
    persistSettings()
    await run(`合并 ${settings.mergeFrom} → ${branch.value}`, async () => {
      const result = await gitEngine.merge(settings.mergeFrom, author.value)
      await refresh()
      if (result.alreadyMerged) note('已经包含该分支，无需合并')
      else if (result.fastForward) note('快进合并成功')
      else note('已生成 merge commit')
    })
  }

  async function restoreFrom(ref: string) {
    await run(`回滚工作区到 ${ref.slice(0, 7)}`, async () => {
      await gitEngine.restoreFrom(ref)
      previewRef.value = ''
      await refresh()
      note('已把该版本文件写入当前工作区（尚未 commit，对应 CMS「回滚写入草稿」）')
    })
  }

  async function resetHard(ref: string) {
    await run(`硬重置当前分支到 ${ref.slice(0, 7)}`, async () => {
      await gitEngine.resetHard(ref)
      previewRef.value = ''
      await refresh()
    })
  }

  async function lockVersion() {
    await run(`锁定版本 ${settings.tagName}`, async () => {
      await gitEngine.lockVersion(settings.tagName)
      settings.tagName = ''
      await refresh()
    })
  }

  async function diffRefs() {
    await run('计算 Diff', async () => {
      lastDiff.value = await gitEngine.diff(settings.diffFrom || 'HEAD', settings.diffTo || 'HEAD')
    })
  }

  async function previewCommit(oid: string) {
    previewRef.value = oid
    if (currentFile.value) await openFile(currentFile.value)
    note(`只读预览 ${oid.slice(0, 7)}（不移动 HEAD，对应 CMS「切换查看指定版本」）`)
  }

  async function exitPreview() {
    previewRef.value = ''
    if (currentFile.value) await openFile(currentFile.value)
    note('已回到当前工作区')
  }

  async function wipe() {
    await run('清空浏览器内仓库', async () => {
      await gitEngine.wipe()
      await refresh()
    })
  }

  return {
    loading,
    message,
    error,
    progress,
    hasRepo,
    branch,
    head,
    branches,
    tags,
    remotes,
    files,
    fileStatus,
    commits,
    currentFile,
    fileContent,
    previewRef,
    locales,
    dirtyLocales,
    lastDiff,
    settings,
    dirtyFiles,
    statusMap,
    allCopyKeys,
    refresh,
    openFile,
    saveCurrentFile,
    setLocaleValue,
    addCopyKey,
    removeCopyKey,
    saveLocales,
    initSeed,
    cloneRepo,
    pull,
    fetchRemote,
    push,
    commit,
    checkout,
    createBranch,
    mergeFrom,
    restoreFrom,
    resetHard,
    lockVersion,
    diffRefs,
    previewCommit,
    exitPreview,
    wipe,
    persistSettings,
  }
}

export type GitRepoStore = ReturnType<typeof useGitRepo>
