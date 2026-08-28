# Backend design adjustments
_Exported on 8/27/2026 at 14:36:49 GMT+8 from Cursor (3.17.21)_

---

**User**

/vc-backend-design-generator  当前已经走到step 7了，调整设计方案 @doc/backend-design/design.md ：
CMS 继续用 MySQL 管草稿/分组/app/平台/权限，引入git引擎（浏览器里的 isomorphic-git + LightningFS（IndexedDB）），创建版本后生成json文件 commit/push 到业务仓库

---

**Cursor**

当前已到 Step 7，我会先读现有概要设计和相关规范，再按「MySQL 管草稿/权限 + 浏览器 isomorphic-git 提交 JSON 到业务仓」调整方案。

接下来会把版本、导出、快照相关章节和接口清单读完，确认哪些职责要从后端迁到浏览器 Git 引擎。

架构会从「MySQL 存全量快照」改成「MySQL 只管草稿与权限，版本 JSON 由浏览器 Git 推到业务仓」。我先核对现有版本接口、原型和相关文档，再改 `design.md`。

架构边界已经清楚：MySQL 只保留草稿与权限，正式版本冻结成 JSON，由浏览器 isomorphic-git 推到业务仓。开始改 `design.md` 的总述、表结构和版本相关接口。

已按「MySQL 只管草稿/权限，正式版本 JSON 由浏览器 git 推业务仓」改完 `doc/backend-design/design.md`。Step 7 检查也跑完了，下面先给结论，再列需要你拍板的问题。

## 方案怎么改的

**MySQL** 继续管：平台、App、成员、语种、权限、**草稿**分组/截图/文案、导入、版本元数据。

**正式版本不再按关系表拷贝。** `addVersion` 把当前草稿冻成：

- `{lang}.json`：给业务用的嵌套 locale
- `.i18n-cms.json`：分组名、排序、截图 URL

写入 `i18n_version_bundle`，再由浏览器 **isomorphic-git + LightningFS** commit / tag（`i18n/vN`）/ push 到该 App 绑定的业务仓库。本服务不执行 git、不存 Token。

配套接口：`getAppGit` / `saveAppGit`、`getVersionBundle`、`confirmVersionPush`、`rebuildUnlockedVersion`。锁定时把 bundle 展成每 App 一份发布索引，供跨系统搜索/查重。

**相对原型的行为变化：** 分组/文案/导入写接口只打草稿；正式版本在 CMS 只读。未锁定 = 可删，或用当前草稿重建 JSON 再覆盖 push；锁定后不可覆盖、不可删。

---

## Step 7 合并问题清单

请勾选：**补 / 改 / 保持 / 给出拍板**。确认后我再一次性改文档。

### 缺失项

1. **getTextList 正式版本无法按分组分页**：`groupId` 在正式版本恒为 0，缺少 `groupKeyPath`。
2. **版本下分组缺失提示**因此对正式版本失效。
3. **exportText 树过滤**：仍用 `groupIdList`/`textIdList`，正式版本没有这些 ID；缺 `groupKeyPathList` / `textKeyList`。
4. **getVersionBundle / rebuildUnlockedVersion / rollbackVersion** 响应表未按模板全量展开。

### 错误项（建议改）

5. **exportText** 改为按 Key 路径过滤，不要用关系表 ID。
6. **5.2 截图下载**仍写读 `i18n_screenshot`，应改为读 bundle 里的 `screenshotUrl`。
7. **lockVersion 可能用旧版本覆盖更新的发布索引**（后锁更小 version_no）。
8. **发布索引唯一键** `group_key_path` 前缀 64，列长 256，无法保证全路径唯一。
9. **deleteApp** 对没有 `app_id` 的子表写成按 `app_id` 删，应改成按父业务 ID 级联。
10. **textKey 未禁 `.`**，会破坏 `$t` 全路径。
11. **正式版本 `groupId`/`textId` 返回 0**，与「系统级 `group_id=0`」冲突。
12. 若干表注释仍写「快照 / 导出取图 / 跨系统查重走草稿 hash」。
13. **copyTextList** 跳过时 `newTextId=null`（规范禁止 null）。
14. **saveTextList.content** 允许空串却可能被要求 `@NotBlank`（应标明例外）。
15. 多处 String/枚举缺 maxlength、`@Min/@Max`。

### 待确认项

16. **pending（git 未 push 成功）版本**：列表能看见，但组树/文案拒绝查看——是允许读 bundle，还是列表标成不可查看？
17. **超管能否代删 App、代转让管理员**？（现设计：不能）
18. **超管判定接口与字段**（原已占位）。
19. **Git 托管域名、浏览器 HTTPS git 是否被 CORS 拦住**；一期不做服务端 git 代理。
20. **locale JSON 体积上限**（例如整包多少 MB）。
21. **confirmImport 空数组 `[]`**：不导任何条目，还是禁止？
22. **跨系统行 `groupNamePath`**：发布索引加名称路径，还是外系统固定空串？
23. **failMessage** 是否落库？

### 数据分级

请再看一眼新表字段分级是否合适，尤其是 `git_repo_url`（现标 L4）、`git_commit_sha`（L4）、发布索引正文（L4）。AI 标注只是初稿。

---

建议优先拍板的 4 件：

1. 正式版本查询/导出是否一律改成 **Key 路径**（`groupKeyPath` / `textKey`），不再用 `groupId`/`textId`？
2. 未锁定版本是否接受「CMS 表格只读 + 用草稿重建覆盖」？若仍要在正式版本表格里直接改，后端模型要再拆一层。
3. Git 是否确认 **浏览器直连业务仓、本服务不存 Token、不代理**？
4. pending 版本能不能查看？

你确认要补/改的项之后，我再改文档，并问要不要做 Step 8（录入 YAPI）。

---

**User**

设计方案再次调整：去掉草稿的概念，mysql中不用管理文案了，全部放git仓库。
1.新建系统时默认初始化一个master分支（作为一个全量的发布分支）
2.系统新建后，第2步是新建项目（从master分支拉一个开发分支出来dev-{日期}）（支持多人并行开发：即多个开发分支）
3.修改完成后，点击“发布”，则开发分支合回master，并基于master新建tag
4.“回滚”改为项目级别的操作，点击回滚，则将master分支从最新的tag回滚到上一个tag

---

**Cursor**

这次会把草稿和 MySQL 文案存储拿掉，改成「master 发布 + 多开发分支项目 + 合回打 tag / 按 tag 回滚」。先对照现有文档结构，再整份改设计。

职责边界已定：MySQL 只留系统/权限/开发项目元数据，分组和文案全部进 Git。正在重写 `design.md`。

正在把整份概要设计改成 Git 主干工作流，并去掉 MySQL 里的草稿与文案表。

`doc/backend-design/design.md` 已按新主干模型重写：**去掉草稿，MySQL 不再管文案，内容全部在 Git。**

## 现在怎么分工

**MySQL 只留元数据：** 系统、成员、启用语种、仓库绑定、开发项目、发布 tag。分组、截图、文案、导入预览表全部删除。

**Git 才是内容库（浏览器 isomorphic-git）：**

1. **新建系统** → 绑定仓库 → 前端初始化并 push **`master`**（空 locale 种子，作为全量发布分支）。
2. **新建开发项目** → 从 `master` 拉 **`dev-{yyyyMMdd}`**（同日冲突则 `-2`、`-3`）。多个开发中项目可以并存。
3. 分组/文案/导入/导出/查重/Diff 都在**当前开发分支**上改 JSON，本服务不再提供这些 HTTP 接口。
4. **发布** → 前端把开发分支合入 `master` → 本服务发号 → 前端打 tag `i18n/vN`。该项目变为已发布，不能再发；要继续改就再开一个开发项目。
5. **回滚**从项目工作台进，但动的是 **master**：把内容恢复成上一 tag（新 commit，不 force-push），再打新 tag。历史 tag 保留。

后端接口从 37 个收到 **20 个**（系统 + Git 确认 + 开发项目 + 发布/回滚）。

## 请拍板的几点（我已按下面默认写进文档）

1. **回滚方式**：新 commit 恢复上一 tag 的树 + 新 tag，而不是 `reset --force`。
2. **回滚粒度**：入口在项目工作台，实际回滚的是整条 **master**，不是某一个 `dev-*` 分支。
3. **发布后开发分支**：项目标记「已发布」，分支可留在远端；不能用同一项目再合一次。
4. **查重/跨系统搜索/Excel 导出**：一期纯前端，后端不落文案所以也不做。
5. **超管仍不能代删系统、代转让管理员。**

这几条若要改，直接说目标行为即可。确认后可以再跑一轮完整性/正确性检查，或进入 Step 8 录 YAPI。

---

**User**

3.发布后开发分支可以删除
5.可以代删代转让
再跑一轮完整性/正确性检查

---

**Cursor**

先读技能里的 Step 7 检查项和当前设计文档，再改「发布后删开发分支」和「超管可代删/代转让」，然后跑完整性与正确性检查。

接着改文档里发布后删分支和超管代删/代转让的规则，并读检查器说明与相关接口细节。

先把两条拍板写进文档，再并行跑完整性与正确性检查。

两条拍板已经写进 `doc/backend-design/design.md`：

- **发布后**：`confirmPublish` 返回 `gitBranch`；前端打 tag 后删除远端开发分支；MySQL 项目仍是「已发布」。`deleteProject` 只废弃开发中项目。
- **超管**：可代删系统、代转让管理员；可见性不变（非超管仍只看自己创建的）。

Step 7 检查已跑完。下面按「补 / 改 / 保持」勾选，确认后我一次性改文档。

---

### 缺失项

1. **`saveAppGit` 响应**只写「同 getAppGit 的仓库三字段」，未展开完整字段表。  
   建议：补全，并写明是否返回 `isMasterInited` / `masterCommitSha`。
2. **`i18n_app_lang`** 缺表功能说明（其它表都有）。  
   建议：补一句。
3. **`confirmMasterInit` / `confirmProjectBranch` 的 `gitCommitSha`**：成功必填已写，失败时不传/忽略未写清。  
   建议：补「`pushSuccess=0` 时不传，传入则忽略」。
4. **`confirmRollback.tagNote`** 写「不传则服务端写默认文案」，没有默认原文。  
   建议：定一句，例如 `rollback to {toTagName}`。
5. **4.1** 若干行描述/备注为空（`getAppDetail`、`confirmMasterInit`、`getProjectList`、`confirmProjectBranch`、`getTagList`）。  
   建议：各补一句话。
6. **7.3** 未写传输加密（HTTPS）和脱敏策略（字段目前全是 `deSensitiveType=no`）。  
   建议：写明走网关 HTTPS；本期无脱敏字段。

### 错误项（建议改）

1. **2.2.7** 写成「允许（建议）删除远端分支」，和文首/流程/接口「打 tag 后删除」不一致。  
   你上次原话是「可以删除」。请选：  
   - **A. 必须删**（失败可重试，不回滚已发布）  
   - **B. 允许删**（不删也可以）
2. **2.3** 回滚节点写成「confirmRollback 打新 tag」，实际是接口取名、前端打 tag。  
   建议：改成「取 newTagName」。
3. **`i18n_app_tag.tag_name`** 唯一索引未加前缀（varchar>32）。  
   建议：`(app_id, tag_name(32))`。
4. **若干请求字段缺长度**：`appName`≤128、`appDesc`≤512、`gitRepoUrl`≤512、`gitMasterBranch`≤128、`gitLocaleDir`≤256、`langCode`/`memberName`≤32、`gitCommitSha`/`masterCommitSha`≤64、`tagNote`≤256。  
   建议：按库字段补齐。
5. **各接口参数缺示例**（规范项，量大）。  
   建议：只给关键接口补 1 个请求示例，或本期保持不补。

### 待确认项（对接后才能填，建议保持占位）

1. 超管判定接口与字段  
2. Git 托管域名 / 浏览器 git HTTPS CORS  

---

请核对各表字段的 **数据分级（L1–L4）** 是否准确；当前是按规范初标的，需要你确认。

回复示例：`1–6 补；错误项除 5 外都改；分支选 A；占位保持；分级 OK`。确认后我再改文档，并问是否进入 Step 8 录 YAPI。

---

**User**

修改拍板项：发布后，打 tag 后不删除开发分支，当前开发分支对应的项目的状态为「已发布」，当前项目分支仍可继续修改，再次发布后（发布弹窗要求填写发布描述），自动升最后一位版本并重新打tag。

缺失项：
1.saveAppGit 接口稍后说明（是否需要git后端接口？初步设想是浏览器端直接操作，绕过后端）
2.应用系统支持语种范围
3、4. 同1
5. 请明确是否要补充接口说明？
6. 走网关 HTTPS；本期无脱敏字段。

错误项：
1. 这期先不删。所有开发分支保留
2. ok
3. ok
4. ok
5. 补上请求示例

分级OK

---

**Cursor**

按拍板改发布模型（可重复发布、升版本、保留开发分支），并一次性补上已确认的缺失/错误项。先读文档和接口规范里的示例格式。

先改发布模型和拍板结论，再补长度、索引、示例和 7.3。

`doc/backend-design/design.md` 已按这次拍板改完。

## 发布模型（核心变化）

- 打 tag 后**不删开发分支**，本期所有 `dev-*` 都留着。
- 首次发布后项目状态变成 **已发布**，同一分支可以继续改。
- **再次发布**要填发布描述（`tagNote` 必填），序号只升最后一位：`i18n/v1` → `i18n/v2` → `i18n/v3`。
- `confirmProjectBranch` 对已发布项目也允许回写 sha，方便再发。

## 缺失项怎么处理的

1. **`saveAppGit`（以及 3、4 的 Git 回写细节）**：文档里标了**稍后确认**，响应表先不展开。  
   **是否需要 Git 后端接口：** 浏览器直连 git、不让服务端执行 git，这个方向对。后端仍建议至少留「元数据」：`addApp` 写入仓库 URL、`getAppGit` 读出来、`confirmMasterInit` 挡住未初始化就开项目。`saveAppGit` 只在「初始化前要改仓库地址」时才有用，可以砍掉或并进 `addApp`。
2. **`i18n_app_lang`**：表说明写成「应用系统支持语种范围」。
5. **要不要补 4.1 接口说明：** 要。那是给开发和 YAPI 的一句话摘要，空着不影响跑，但对清单对照不方便。空的备注已经补上。
6. **7.3**：已写明走网关 HTTPS；本期无脱敏字段。

## 错误项

- 分支策略、回滚流程图用词、`tag_name` 索引前缀 32、请求字段长度、20 个接口的 `data` 请求示例，都已改。

---

是否把本次 20 个接口录入 / 更新 YAPI（https://yapi.vesync.com/project/1379）？`saveAppGit` 仍是草案的话，可以先不同步这一条。

