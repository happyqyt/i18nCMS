<script setup lang="ts">
const items = [
  { cms: '草稿工作区', git: 'working tree，或独立 draft 分支', result: '可行', level: 'ok' },
  { cms: '读取 / 修改文案', git: 'readFile / writeFile（IndexedDB）', result: '可行', level: 'ok' },
  { cms: '打版本快照', git: 'commit', result: '可行', level: 'ok' },
  { cms: '版本列表 / 作者 / 时间', git: 'git log', result: '可行', level: 'ok' },
  { cms: '切换查看指定版本', git: 'readBlob(ref) 只读预览，或 checkout', result: '可行', level: 'ok' },
  { cms: '版本 Diff', git: 'tree walk / diff', result: '可行', level: 'ok' },
  { cms: '回滚写入草稿', git: '把某 commit 的文件写回工作区，不移动 HEAD', result: '可行', level: 'ok' },
  { cms: '锁定且不可解锁', git: 'tag 模拟；但 tag 实际可删、可 force', result: '需约定', level: 'warn' },
  { cms: '删除未锁定版本并跳号', git: '删除中间 commit 等于改写历史', result: '不适合', level: 'no' },
  { cms: 'App 主数据不进版本', git: 'commit 会版本化目录内所有文件', result: '需拆库', level: 'warn' },
  { cms: '分页、模糊搜索、查重', git: 'Git 不是查询引擎，只能全量读入前端', result: '不适合', level: 'no' },
  { cms: '成员 / 超管 / ACL', git: 'Git 只有仓库级权限，没有 CMS 行级权限', result: '需后端', level: 'no' },
  { cms: '多人同时改同一草稿', git: 'push/pull + merge conflict', result: '体验差', level: 'warn' },
  { cms: '导入导出 JSON/Excel', git: '读写文件本身可以；Excel/截图要另做', result: '部分', level: 'warn' },
  { cms: '拉取远程 / 发布', git: 'clone / pull / push（需 CORS 代理和 Token）', result: '可行有限', level: 'warn' },
]
</script>

<template>
  <div class="feasibility">
    <h1>可行性结论</h1>
    <p class="muted">
      本 demo 用 <code>isomorphic-git</code> + <code>LightningFS</code>（IndexedDB）在浏览器里跑 Git。
      可以证明「文案文件的版本管理」能在网页中完成；不能证明「整套 i18n CMS」应该用 Git 当主存储。
    </p>

    <div class="verdict">
      <div class="card yes">
        <h2>Git 引擎适合做什么</h2>
        <ul class="list">
          <li>把文案当文件：JSON / 分组树 / 截图 URL 清单</li>
          <li>草稿、提交、分支、合并、对比、回滚、标签</li>
          <li>和研发仓库同源，方便 CLI / PR / 发布流水线</li>
          <li>浏览器离线编辑后再 push（译员工作台、本地沙箱）</li>
        </ul>
      </div>
      <div class="card no">
        <h2>Git 引擎不适合当 CMS 主库</h2>
        <ul class="list">
          <li>App 名称、成员、启用语种等主数据需要「不进快照」</li>
          <li>锁定、跳号删除、权限过滤是业务规则，不是 Git 语义</li>
          <li>分页检索、跨系统查重、批量搬迁需要索引和事务</li>
          <li>浏览器 Git 受 CORS、仓库体积、IndexedDB 配额限制</li>
        </ul>
      </div>
    </div>

    <div class="card section">
      <h2>CMS 能力 → Git 映射</h2>
      <div class="table-wrap" style="margin-top: 12px">
        <table class="map-table">
          <thead>
            <tr>
              <th>i18n CMS 能力</th>
              <th>Git / 浏览器对应</th>
              <th>结论</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.cms">
              <td>{{ item.cms }}</td>
              <td class="muted">{{ item.git }}</td>
              <td :class="{ 'ok-text': item.level === 'ok', 'warn-text': item.level === 'warn', 'no-text': item.level === 'no' }">
                {{ item.result }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card section">
      <h2>若要落地，更稳的架构</h2>
      <ul class="list">
        <li>
          <b>主路径保持现有设计</b>：MySQL 存 App 主数据 + 草稿/版本快照，权限和检索走后端。
        </li>
        <li>
          <b>Git 作为发布面，而不是编辑面</b>：锁定版本后导出为 <code>locales/*.json</code> 并 commit/push 到业务仓库。
        </li>
        <li>
          <b>浏览器 Git 可作为增强</b>：译员离线改稿、和 GitHub/GitLab 对账、预览某 tag；不要替代 CMS 事务。
        </li>
        <li>
          <b>不要用 rebase/删除 commit 模拟「删未锁定版本」</b>：历史改写在协作场景会把远程仓库打乱。
        </li>
      </ul>
    </div>

    <div class="card">
      <h2>本 demo 已验证的浏览器操作</h2>
      <p class="muted" style="margin-top: 8px">
        初始化本地仓库、clone、pull、push、读改文件、commit、分支切换/创建、merge、只读预览历史、回滚写入工作区、硬重置、tag、diff。
        数据保存在浏览器 IndexedDB，刷新页面仍在；点「清空本地仓库」才会丢掉。
      </p>
    </div>
  </div>
</template>
