<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CopyTable from './components/CopyTable.vue'
import Feasibility from './components/Feasibility.vue'
import { useGitRepo } from './composables/useGitRepo'

const {
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
  commit: commitRepo,
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
} = useGitRepo()

const tab = ref<'copy' | 'file' | 'feasibility'>('copy')
const confirmReset = ref('')

const branchOnly = computed(() => branches.value.filter((name) => !name.startsWith('origin/')))

function openSourceFile(path: string) {
  void openFile(path)
  tab.value = 'file'
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <div class="logo">
        <span class="logo-mark">i18n</span>
        <span class="logo-text">Git Demo</span>
      </div>
      <span class="badge">Vite + Vue · isomorphic-git</span>
      <span v-if="hasRepo" class="badge ok">{{ branch }} @ {{ head.slice(0, 7) }}</span>
      <span v-if="previewRef" class="badge warn">只读预览 {{ previewRef.slice(0, 7) }}</span>
    </div>
    <div class="topbar-right">
      <button class="btn xs" :class="{ primary: tab !== 'feasibility' }" @click="tab = 'copy'">工作台</button>
      <button class="btn xs" :class="{ primary: tab === 'feasibility' }" @click="tab = 'feasibility'">可行性</button>
      <button class="btn xs" :disabled="loading || !hasRepo" @click="pull()">Pull</button>
      <button class="btn xs" :disabled="loading || !hasRepo" @click="push()">Push</button>
    </div>
  </header>

  <div v-if="error" class="banner error" style="margin: 10px 16px 0">{{ error }}</div>
  <div v-else-if="message" class="banner ok" style="margin: 10px 16px 0">
    {{ loading ? progress || '处理中…' : message }}
  </div>

  <Feasibility v-if="tab === 'feasibility'" />

  <main v-else-if="!hasRepo" class="page landing">
    <h1>用浏览器 Git 引擎管文案版本</h1>
    <p class="muted">
      在网页里 clone / 读写 / commit / 分支 / merge / 回滚。数据存在本机 IndexedDB，用来验证 i18n CMS 的「文案 + 版本」能否交给 Git。
    </p>

    <div class="card-grid">
      <div class="card stack">
        <h2>1. 初始化本地文案仓库</h2>
        <p class="muted sm">离线可用。自动创建 locales 三语种 JSON、groups.json，并切到 draft 分支。</p>
        <label class="sm muted">作者</label>
        <div class="row">
          <input v-model="settings.authorName" class="input" placeholder="name" @change="persistSettings" />
          <input v-model="settings.authorEmail" class="input" placeholder="email" @change="persistSettings" />
        </div>
        <button class="btn primary" :disabled="loading" @click="initSeed()">初始化演示仓库</button>
      </div>

      <div class="card stack">
        <h2>2. Clone 远程 Git 仓库</h2>
        <p class="muted sm">
          浏览器不能直连 Git 服务器，默认走 <code>cors.isomorphic-git.org</code>。私有库需要 Token。大仓库会很慢。
        </p>
        <input v-model="settings.cloneUrl" class="input" placeholder="https://github.com/org/repo" />
        <input v-model="settings.corsProxy" class="input" placeholder="CORS proxy" />
        <input v-model="settings.token" class="input" type="password" placeholder="可选：GitHub/GitLab Token（push/私有库）" />
        <button class="btn" :disabled="loading || !settings.cloneUrl.trim()" @click="cloneRepo()">Clone</button>
      </div>
    </div>
  </main>

  <main v-else class="workspace">
    <aside class="col">
      <div class="section">
        <div class="col-head">
          <h3>分支</h3>
          <span class="muted sm">{{ branchOnly.length }}</span>
        </div>
        <div
          v-for="name in branchOnly"
          :key="name"
          class="branch-item"
          :class="{ active: name === branch }"
          @click="checkout(name)"
        >
          <span>{{ name }}</span>
          <span v-if="name === branch" class="muted sm">当前</span>
        </div>
        <div class="row" style="margin-top: 8px">
          <input v-model="settings.newBranch" class="input" placeholder="新分支名" />
          <button class="btn xs" :disabled="loading" @click="createBranch()">创建</button>
        </div>
      </div>

      <div class="section">
        <div class="col-head"><h3>标签（锁定版本）</h3></div>
        <div v-if="tags.length === 0" class="muted sm">还没有 tag</div>
        <div v-for="tag in tags" :key="tag" class="branch-item" @click="previewCommit(tag)">
          {{ tag }}
        </div>
      </div>

      <div class="section">
        <div class="col-head">
          <h3>文件</h3>
          <span class="muted sm">{{ dirtyFiles.length }} 改动</span>
        </div>
        <div
          v-for="path in files"
          :key="path"
          class="file-item"
          :class="{ active: path === currentFile }"
          @click="openSourceFile(path)"
        >
          <span class="file-name" :title="path">{{ path }}</span>
          <span v-if="statusMap[path] && statusMap[path] !== 'unmodified'" class="status" :class="statusMap[path]">
            {{ statusMap[path] }}
          </span>
        </div>
      </div>

      <div class="section">
        <h3>远程</h3>
        <p v-if="remotes.length === 0" class="muted sm">本地仓库，没有 origin</p>
        <p v-for="remote in remotes" :key="remote.remote" class="sm">
          <b>{{ remote.remote }}</b>
          <span class="muted"> {{ remote.url }}</span>
        </p>
        <div class="row" style="margin-top: 8px">
          <button class="btn xs" :disabled="loading" @click="fetchRemote()">Fetch</button>
          <button class="btn xs danger" :disabled="loading" @click="wipe()">清空本地仓库</button>
        </div>
      </div>
    </aside>

    <section class="col">
      <div class="col-head">
        <div>
          <h2>{{ tab === 'file' ? currentFile || '文件' : '文案工作区' }}</h2>
          <p class="muted sm">
            当前分支 {{ branch }} · 未提交 {{ dirtyFiles.length }} 个文件
            <span v-if="dirtyLocales"> · 表格有未落盘修改</span>
          </p>
        </div>
        <div class="tabs">
          <button class="tab" :class="{ active: tab === 'copy' }" @click="tab = 'copy'">文案表</button>
          <button class="tab" :class="{ active: tab === 'file' }" @click="tab = 'file'">源文件</button>
        </div>
      </div>

      <div v-if="previewRef" class="banner info row">
        <span>正在只读查看历史版本，编辑不会写进当前草稿。</span>
        <button class="btn xs" @click="exitPreview()">回到工作区</button>
      </div>

      <CopyTable
        v-if="tab === 'copy'"
        :keys="allCopyKeys"
        :locales="locales"
        :readonly="!!previewRef"
        @change="setLocaleValue"
        @add-key="addCopyKey"
        @remove-key="removeCopyKey"
      />

      <div v-else class="stack">
        <textarea v-model="fileContent" class="textarea" :readonly="!!previewRef" spellcheck="false" />
        <div class="row">
          <button class="btn primary" :disabled="loading || !!previewRef" @click="saveCurrentFile()">写入工作区</button>
          <span class="muted sm">只改 IndexedDB 工作区，不等于 commit。</span>
        </div>
      </div>
    </section>

    <aside class="col">
      <div class="section">
        <h3>保存 / 打版本</h3>
        <div class="stack">
          <button
            v-if="tab === 'copy'"
            class="btn"
            :disabled="loading || !dirtyLocales || !!previewRef"
            @click="saveLocales()"
          >
            保存文案到工作区
          </button>
          <input v-model="settings.commitMessage" class="input" placeholder="版本说明，如 lock v1.0.0 文案" />
          <button class="btn primary" :disabled="loading || !!previewRef" @click="commitRepo()">Commit（打版本）</button>
          <div class="row">
            <input v-model="settings.tagName" class="input" placeholder="tag，如 v1.0.0" />
            <button class="btn xs" :disabled="loading || !settings.tagName.trim()" @click="lockVersion()">锁定</button>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>合并</h3>
        <div class="row">
          <select v-model="settings.mergeFrom" class="select">
            <option value="">选择来源分支</option>
            <option v-for="name in branchOnly.filter((item) => item !== branch)" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
          <button class="btn xs" :disabled="loading || !settings.mergeFrom" @click="mergeFrom()">Merge</button>
        </div>
      </div>

      <div class="section">
        <h3>Diff</h3>
        <div class="stack">
          <input v-model="settings.diffFrom" class="input" placeholder="from：commit / 分支 / tag" />
          <input v-model="settings.diffTo" class="input" placeholder="to：默认 HEAD" />
          <button class="btn xs" :disabled="loading" @click="diffRefs()">对比</button>
          <div v-if="lastDiff.length" class="sm">
            <div v-for="item in lastDiff" :key="item.filepath" class="row">
              <span
                class="status"
                :class="{ added: item.change === 'add', deleted: item.change === 'delete', modified: item.change === 'modify' }"
              >
                {{ item.change }}
              </span>
              <span class="file-name">{{ item.filepath }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="col-head"><h3>版本历史</h3></div>
        <div
          v-for="item in commits"
          :key="item.oid"
          class="commit-item"
          :class="{ active: previewRef === item.oid }"
        >
          <div style="min-width: 0" @click="previewCommit(item.oid)">
            <div style="font-weight: 700">{{ item.message }}</div>
            <div class="muted sm">{{ item.short }} · {{ item.author }} · {{ item.date }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>回滚</h3>
        <p class="muted sm">写入草稿：恢复文件但留在当前分支。硬重置：当前分支 HEAD 直接指向该 commit。</p>
        <div class="row" style="margin-top: 8px">
          <button class="btn xs" :disabled="loading || !previewRef" @click="restoreFrom(previewRef)">回滚写入工作区</button>
          <button class="btn xs danger" :disabled="loading || !previewRef" @click="confirmReset = previewRef">硬重置分支</button>
        </div>
        <div v-if="confirmReset" class="banner error stack" style="margin-top: 8px">
          <span>确认把 {{ branch }} 硬重置到 {{ confirmReset.slice(0, 7) }}？之后的 commit 在该分支不可见。</span>
          <div class="row">
            <button class="btn xs danger" @click="resetHard(confirmReset); confirmReset = ''">确认</button>
            <button class="btn xs" @click="confirmReset = ''">取消</button>
          </div>
        </div>
      </div>
    </aside>
  </main>
</template>
