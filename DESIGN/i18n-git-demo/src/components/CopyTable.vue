<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LocaleBundle } from '../composables/useGitRepo'

const props = defineProps<{
  keys: string[]
  locales: LocaleBundle[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  change: [lang: string, key: string, value: string]
  addKey: [key: string]
  removeKey: [key: string]
}>()

const filter = ref('')
const newKey = ref('')

const visibleKeys = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return props.keys
  return props.keys.filter((key) => {
    if (key.toLowerCase().includes(q)) return true
    return props.locales.some((locale) => (locale.flat[key] || '').toLowerCase().includes(q))
  })
})

function add() {
  emit('addKey', newKey.value)
  newKey.value = ''
}
</script>

<template>
  <div class="stack">
    <div class="row">
      <input v-model="filter" class="input" placeholder="搜索 Key 或文案" />
      <input
        v-model="newKey"
        class="input"
        placeholder="新增文案 Key，如 home.hero.badge"
        :disabled="readonly"
        @keydown.enter="add"
      />
      <button class="btn xs" :disabled="readonly || !newKey.trim()" @click="add">新增 Key</button>
    </div>
    <div v-if="locales.length === 0" class="muted sm">当前仓库没有 `locales/*.json`，请在左侧打开普通文件编辑。</div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="min-width: 180px">Key</th>
            <th v-for="locale in locales" :key="locale.path" style="min-width: 180px">
              {{ locale.lang }}
              <span class="muted sm">{{ locale.path }}</span>
            </th>
            <th v-if="!readonly" style="width: 70px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in visibleKeys" :key="key">
            <td class="key-cell">{{ key }}</td>
            <td v-for="locale in locales" :key="locale.path + key">
              <input
                :value="locale.flat[key] ?? ''"
                :readonly="readonly"
                :placeholder="readonly ? '' : '空译文'"
                @input="emit('change', locale.lang, key, ($event.target as HTMLInputElement).value)"
              />
            </td>
            <td v-if="!readonly">
              <button class="btn xs danger" @click="emit('removeKey', key)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="muted sm">{{ visibleKeys.length }} / {{ keys.length }} 条文案 · 改动先写入浏览器工作区，再 commit 才成为版本。</p>
  </div>
</template>
