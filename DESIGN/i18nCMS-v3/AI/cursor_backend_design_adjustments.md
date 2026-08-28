# Backend design adjustments
_Exported on 8/28/2026 at 20:08:21 GMT+8 from Cursor (3.17.21)_

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

---

**User**

@doc/backend-design/通读设计文档后，澄清以下问题：.md 

按以上澄清项调整设计，调整完后我再来review 数据库表设计和接口设计。

---

**Cursor**

澄清项会改仓库布局、分支命名、版本号、表合并和删除行为。先通读文档里的表结构和接口，再一次性改设计。

按澄清项重写整体方案：合并表、统一仓库目录、`dev-{projectKey}`、VERSION.txt 四段版本，以及删除时同步远端。文档较长，分块写入并核对接口与表一致。

正在重写概要设计：表减到 5 张（Git 并入系统、最新 tag 并入项目），并按澄清项改流程与接口。

`doc/backend-design/design.md` 已按澄清项改完。请先看 **第 3 章表** 和 **第 4 章接口**。

## 表（5 张）

- **`i18n_app_git` 已并入 `i18n_app_system`**：`app_key`、`git_repo_url`、`git_master_branch`、初始化状态、当前 `current_version` / `current_tag_name`。
- **`i18n_app_tag` 已并入 `i18n_dev_project`**：只留该项目最新一次发布的 `latest_version` / `latest_tag_name` / `latest_tag_note` / `latest_tag_sha`。完整 tag 历史在 Git。
- 仍保留：`i18n_preset_lang`、`i18n_app_member`、`i18n_app_lang`。

## 接口（仍 20 个，语义有变）

- **addApp** 要填 `appKey`；**saveAppGit** 在新建后绑定共享仓。
- **addProject** 由用户填 `projectKey`，分支为 `dev-{projectKey}`。
- **confirmPublish** 记录 `VERSION.txt` 的 `serviceVersion`，tag 为 `i18n/v{x.x.x.x}`。
- **getTagList** 只返回各项目最新 tag。
- **deleteApp / deleteAppLang / deleteProject** 分别返回目录名、语种文件、分支名，供前端删远端。

## 按澄清写死、请你确认的两点

1. **「删除远端仓库」**：所有系统共用一仓，所以删系统只删 `{app_key}/` 目录，不删整个 Git 仓。
2. **回滚**：MySQL 不再存 tag 历史，跳档校验改由前端从 Git tags 选择，后端只回写系统当前版本。

你 review 表和接口时，这两点如果要改，直接说目标行为即可。

---

**User**

1和2确认

---

**Cursor**

两条都已记进 `design.md`，作为已确认结论：

1. **删系统**只删共享仓里的 `{app_key}/` 目录，不删整个 Git 仓库。  
2. **回滚**不做跳档校验：上一档由前端从 Git tags 选，本服务只回写系统当前版本。

表结构和 20 个接口可以按当前文档 review。

是否把这 20 个接口录入 / 更新 YAPI（https://yapi.vesync.com/project/1379）？

---

**User**

“Git 后端接口 保留：saveAppGit（新建系统后绑定仓库）、confirmMasterInit、confirmProjectBranch。本服务不执行 git、不存 Token。”
关于以上描述的疑问：本服务新建系统后，需要在git端创建目录，然后绑定到系统表，这个操作应该要通过token执行git吧？

---

**Cursor**

需要 Token 才能在 Git 上建目录，但按当前方案这个 Token **不走本服务**。

建目录确实要带 Git Token，但按现在的设计，**Token 在浏览器里，本服务既不存也不拿它去调 Git。**

当前分工是这样的：

1. **`addApp`**：只写 MySQL（名称、`appKey`、语种、成员），返回种子文件内容。
2. **`saveAppGit`**：只把共享仓 URL、`master` 分支名写进系统表。这是绑定元数据，**不会**在 Git 上建目录。
3. **浏览器 isomorphic-git**：用用户存在 IndexedDB 里的 Token，在 `master` 上创建 `{app_key}/`（空 locale + `VERSION.txt`）并 push。
4. **`confirmMasterInit`**：前端把 push 成功/失败和 sha 回写 MySQL。本服务仍然不碰 Git。

所以那句「本服务不执行 git、不存 Token」和「新建系统后要在 Git 建目录」并不矛盾：建目录的是前端，不是 `i18nService`。三个 Git 后端接口只做「记 URL / 记是否初始化成功 / 记分支 sha」。

如果改成 **本服务去建目录**，就必须同时改掉这条原则，例如：

- 服务端存一份仓库级 Token（或走公司 Git 服务账号），用 JGit / Git HTTP API 创建 `{app_key}/`；或
- 接口入参带用户 Token（安全上更差，一般不建议）。

请选一条：

- **A. 维持现状**：建目录仍由浏览器 + 用户 Token 完成，本服务不碰 Git。  
- **B. 改由本服务建目录**：需要服务端持有 Token 并执行 git，我再改设计和接口。

---

**User**

疑问：token存在IndexedDB 里的 Token，是否每次换浏览器都需要用户手动获取git token存到本地？

---

**Cursor**

是的。按现在的方案，**换浏览器、换电脑、清站点数据、无痕窗口，本地都没有这份 Token**，用户要再拿一次 Git Token 存进这个浏览器。

IndexedDB 绑的是「这台机器上的这个浏览器 + 这个站点」。它不会跟员工账号走，本服务也不存、不下发，所以没法自动带到新浏览器里。

常见做法只有这几类：

| 方式 | 换浏览器要不要再配 | 谁拿 Token |
| --- | --- | --- |
| 现在：用户 PAT 进 IndexedDB | 要，每次新环境都要贴一次 | 每个使用者 |
| Git OAuth 登录（点授权，不贴 PAT） | 也要再授权一次，但不用手抄 Token | 每个使用者 |
| **共享仓用服务账号，本服务持有一份 Token** | 不用，登录 CMS 即可 | 平台一份 |

你们是**所有系统共用一个仓库**，更适合最后一种：员工只登 CMS；建目录、push、打 tag 由本服务用仓库级 Token 去做。代价是本服务要存 Token、要执行 git，和现在「不执行 git、不存 Token」相反。

请选：

- **A. 继续浏览器 Token**：接受换浏览器要重新配置（可做成 OAuth，少贴 PAT）。  
- **B. 改成服务端持仓 Token**：用户不用管 Git 凭据，我按这个改设计和接口。

---

**User**

选用B

---

**Cursor**

改成服务端持有仓库 Token 并执行 Git。先通读设计里所有 Git/Token/前端 isomorphic-git 相关描述，再一次性改表、流程和接口。

按方案 B 改设计：Git 由平台服务账号在服务端执行，用户只登录 CMS。正在把 `design.md` 从浏览器 Git 切到服务端 Git。

已按 **方案 B** 改完 `doc/backend-design/design.md`：Git 由平台服务账号在服务端执行，用户只登录 CMS，换浏览器也不再填 Token。

**凭据与执行**
- Token、仓库 URL、master 分支名配在配置中心，不进 MySQL、不进接口、不进日志。
- 本服务调 Git 托管 HTTP API（必要时 JGit）完成建目录、建分支、读写文件、merge、打 tag、删目录/文件/分支。
- 浏览器不再直连 Git，无 CORS 项。

**日常编辑**
- 新增 `getDevWorkspace` / `saveDevWorkspace`：前端仍做分组、文案、导入导出、查重、Diff，落盘一律走后端。
- `saveDevWorkspace` 只接受已启用语种的 `{langCode}.json` 和 `.i18n-cms.json`，禁止写 `VERSION.txt`。

**原 Git 回调接口改为服务端重试**
- `saveAppGit`：只从平台配置同步 URL，不再收用户仓库地址或 Token。
- `confirmMasterInit` / `confirmProjectBranch`：本服务重试建目录 / 建分支，不再收前端 sha。
- `addApp`、`addProject`、发布、回滚、删除系统/语种/项目：MySQL 与 Git 都由本服务完成。
- `confirmPublish` / `confirmRollback` 只收业务参数（`tagNote`、回滚目标 tag）；版本号由服务端按主档递增。
- `getTagList` 增加 `remoteTagList`，回滚从这里选档，仍不做跳档校验。

接口共 **22** 个。仍待补充：GitLab/GitHub、配置项名、commit 作者、单文件大小上限。YAPI 仍未录入；需要的话再说一声。

---

**User**

Git 由平台服务账号在服务端和浏览器端都可执行。Git token配置在ops 占位符里，服务端和浏览器端的代码都可直接拿到，方便后续万一需要切换账号。
读写文件、merge等操作保留之前的浏览器直接操作方案，更便捷。
补充项：
使用GitLab；单文件大小上限1MB；

---

**Cursor**

按你的补充把设计改成混合方案：Token 走 ops 占位符，服务端和浏览器都能用；日常读写和 merge 仍由浏览器直连 GitLab。先对照当前文档再改。

按混合方案改文档：Token 走 ops 占位符（前后端都能读）；日常读写和 merge 仍由浏览器直连 GitLab；结构类操作留在服务端。正在改 `design.md`。

已按混合方案改完 `design.md`。核心如下。

**Token**
- 配在 **ops 占位符**（`gitRepoUrl` / `gitMasterBranch` / `gitToken`），服务端和浏览器代码都直接读，不经业务接口转发。
- 切换平台服务账号只改占位符，不必改代码。
- Token 不进 MySQL、不进接口请求/响应、不进日志。用户不用手填，也不走 IndexedDB。

**两端都能跑 Git，本期默认分工**

| 默认浏览器（isomorphic-git） | 默认服务端（GitLab API） |
| --- | --- |
| 读写文件、commit/push | 建 `{app_key}/` 种子 |
| merge、写 VERSION、打 tag | 建/删 `dev-{projectKey}` |
| 回滚恢复目录、列 tag | 删系统目录 |
| 增删语种 json | — |

后续若要把某一类操作改到另一端，不必换 Token 配置。

**已落地的补充项**
- 托管：**GitLab**
- 单文件上限：**1MB**（locale JSON、`.i18n-cms.json`、`VERSION.txt`）

工作区接口 `getDevWorkspace` / `saveDevWorkspace` 已去掉，接口回到 **20** 个。发布/回滚仍由浏览器做完 Git 后再调 `confirmPublish` / `confirmRollback` 回写 MySQL。

仍待补充：ops 占位符的具体 key 名、GitLab 对 CMS 域名的 CORS、commit 作者。需要的话可以把占位符 key 发我写进文档。

---

**User**

补充项：
1.ops占位符：i18n_git_repo_url / i18n_git_main_branch / i18n_git_token
2.后续会找运维配置GitLab 的跨域允许
3.commit 作者：暂定为ops deploy @deploy 



---

**Cursor**

正在把这三项写进设计文档，替换所有相关的待补充占位。

三项已写入 `design.md`。

**ops 占位符**

| 占位符 | 用途 | 是否入库 |
| --- | --- | --- |
| `i18n_git_repo_url` | 共享仓 HTTPS 地址 | 写入 `git_repo_url` |
| `i18n_git_main_branch` | 发布分支名 | 写入 `git_master_branch` |
| `i18n_git_token` | 平台服务账号 Token | 不入库 |

文档里原先写死的 `master` 已改成：以 `i18n_git_main_branch` 为准（可以是 `master` 或 `main`）。

**GitLab 跨域**  
记为后续由运维配置，允许 CMS 前端域名。CORS 未放开时，浏览器 isomorphic-git 会失败，建目录/建删分支等结构操作仍走服务端。

**commit 作者（暂定）**  
显示名 `ops deploy`，GitLab 账号 `@deploy`，前后端提交都用这个作者。

Git 相关补充项已齐。还剩超管判定接口与字段，等权限中心对接后再补。

---

**User**

1.V1.0.0.0，项目第一次发布时升第3位，后续发布升最后一位；tag=i18n/v{x.x.x.x}
2.saveAppGit接口的调用场景是什么？
3.业务流程图中，
1）“Git 建目录成功”后有两个“是”分支，应该把回滚分支的箭头起点挪到“addApp写主数据..."节点
2）”浏览器打tag...“节点挪到"confirmPublish..."节点前，并且在”confirmPublish..."节点前增加一个“commit + push”节点
4.种子文件：{app_key}/.i18n-cms.json 为 [ {"groupName": "", "groupKey": "", "screenshot": "", "subGroups": []}, ...]；{app_key}/VERSION.txt 初始 SERVICE.NAME {app_key}、SERVICE.VERSION=V1.0.0.0、CHANGELOG 空。

---

**Cursor**

正在对照文档里版本号、saveAppGit、流程图和种子文件相关段落，按这四条一并改。

四条都已写入 `design.md`。

**1. 版本号**  
种子 `V1.0.0.0`（未发布）。相对主档当前版本：

- 该项目**第一次**发布：第 3 位 +1，末位归 0  
- **同一项目再发**：最后一位 +1  
- tag：`i18n/v{x.x.x.x}`

示例：`V1.0.0.0` → 项目 A 首发 `V1.0.1.0` → A 再发 `V1.0.1.1` → 项目 B 首发 `V1.0.2.0`。`confirmPublish` 会按此规则校验入参。回滚仍只升最后一位。

**2. `saveAppGit` 调用场景**  
正常 `addApp` 已经从 ops 占位符写入仓库地址和发布分支，**成功路径不用调**。只在目录还没初始化时补一次：

1. `addApp` 时占位符还没配齐，主档 URL 是空的；运维补上后再同步，然后 `confirmMasterInit`  
2. 初始化前占位符里的仓库或分支名改了，刷新主档快照后再初始化  

已初始化后会拒绝。不收 URL、不收 Token。

**3. 流程图**  
- 回滚从 `addApp 写主数据并建 app_key 目录种子` 拉出，不再从「Git 建目录成功 = 是」分叉  
- 发布路径改为：改 VERSION → merge → **commit + push** → **打 tag** → `confirmPublish`

**4. 种子文件**  
- `.i18n-cms.json`：`[{"groupName":"","groupKey":"","screenshot":"","subGroups":[]}]`（`subGroups` 递归同构）  
- `VERSION.txt`：`SERVICE.NAME={app_key}`，`SERVICE.VERSION=V1.0.0.0`，`CHANGELOG` 空  
- 发布时浏览器把 `SERVICE.NAME` 改成本次 `projectKey`

---

**User**

1.saveAppGit 调用场景: 不考虑占位符不对或没配的情况，所以这个接口是不是可以去掉了？
2.业务流程图中，回滚分支中的浏览器打新tag节点调到comfirmRollback前

---

**Cursor**

按你的两点改：去掉 `saveAppGit`，并把回滚流程图里打 tag 挪到 `confirmRollback` 之前。

正在改设计文档：去掉 `saveAppGit`，并把回滚流程图的打 tag 挪到 `confirmRollback` 之前。

两点都按你的口径改完了。

**1. `saveAppGit` 可以去掉。**  
本期不考虑占位符没配或配错，`addApp` 直接从 ops 占位符写入 `git_repo_url` / `git_master_branch`，没有单独同步绑定的场景。已从接口清单、详细设计、测试用例里删除该接口；结构类重试仍只留 `confirmMasterInit` / `confirmProjectBranch`。接口总数 **20 → 19**。`getAppGit` 保留，只读快照。

**2. 回滚打 tag 已挪到 `confirmRollback` 之前。**  
流程与发布对齐：恢复目录并 push → **浏览器打新 tag** → `confirmRollback` 回写 MySQL。业务流程图和回滚时序图都已改。

---

**User**

发布时浏览器无需修改 SERVICE.NAME ，只需增加版本信息即可

---

**Cursor**

发布时浏览器不再改 `SERVICE.NAME`，只更新版本信息。我先在设计文档里把相关描述找全再改。

已按这个口径改完：发布时浏览器**不改 `SERVICE.NAME`**，只更新版本信息。

`SERVICE.NAME` 在 `addApp` 种子里写成 `{app_key}`，之后发布、回滚都保持这个值。浏览器只改：

- `SERVICE.VERSION`：按规则递增
- `CHANGELOG`：写入本次发布描述（回滚则写回滚说明）

发布后的 `VERSION.txt` 示例：

```
VERSION
SERVICE.NAME={app_key}

SERVICE.VERSION=V1.0.1.0
CHANGELOG
{发布描述}
```

---

**User**

超管判定和权限中心对接，参考其他服务模块（说明书平台），本方案不进行详述。

---

**Cursor**

超管判定改为对齐说明书平台、本方案不展开。我先把设计文档里相关待补充点找全再改。

已按这个口径改完：超管判定对接权限中心，**对齐说明书平台，本方案不再展开接口与字段**。文档里原先的 `[待补充]` 已去掉。

本方案只保留业务结果，不写权限中心细节：

- 登录态走 BEnd 网关，身份取 `context.accountID`
- 超管可见全部系统，可代删、代转让；非超管只看自己创建的系统
- 判定失败不授予超管，禁止用 `data` 冒充账号

实现时直接复用说明书平台的既有对接即可。

---

**User**

应该不需要对外提供getOperator接口

---

**Cursor**

去掉对外的 `getOperator`。我先把设计文档里所有引用找全，再删接口并重编号。

已去掉对外的 `getOperator`。接口总数 **19 → 18**。

超管仍由服务端按登录账号判定（对齐说明书平台），前端从 **`getAppList` 的 `isSuperAdmin`** 获知是否超管，并据此过滤可见系统。写接口的代删、代转让同样走内部判定，不必再单独查操作者。

---

**User**

系统元数据增加一个系统Key（用作git目录名），系统Key不通过输入框输入，限制系统名输入为大小写字母/数字，将其转成中横线分隔的小写单词串作为系统key（一经生成则不再修改，全平台唯一）

---

**Cursor**

系统 Key 改为由系统名自动生成、不可手填。我先对照当前设计里 `appKey` / 系统名的约定再改文档。

按你的规则改：系统名只允许字母和数字，系统 Key 由服务端转成 kebab-case，不提供输入框，生成后不可改。

已按这个口径改完。

**系统名**：只允许大小写字母和数字，须以字母开头（不能有空格、下划线、中横线、中文）。前端只提供系统名输入框。

**系统 Key**：服务端按驼峰切成中横线分隔的小写串，作为 Git 目录名。不手填，生成后不可改，全平台唯一。冲突或超长则拒绝，需改系统名。改系统名也不会重生 Key。

示例：

| 系统名 | 系统 Key |
| --- | --- |
| `VeSyncApp` | `ve-sync-app` |
| `VeSync` | `ve-sync` |
| `i18nCMS` | `i18n-cms` |
| `vesync` | `vesync` |

---

**User**

系统key由系统名称转换而来：空格拆词 → 小写 → 中横线连接

---

**Cursor**

系统 Key 改为按空格拆词、转小写、再用中横线连接。我会把文档里原先的驼峰切词规则一并改掉。

已改成按空格分词生成系统 Key。

规则：**空格拆词 → 小写 → 中横线连接**。系统名允许大小写字母、数字和空格；连续空格当作一个分隔。不再用驼峰切词。

示例：`VeSync App` → `vesync-app`；`i18n CMS` → `i18n-cms`；`VeSync` → `vesync`。

---

**User**

方案有调整：
1、不采用共享仓库了，一个系统对应一个GitLab仓库，新建系统则在i18n_git_repo_url 对应的分组下新建一个仓库
2、项目增加“进行中/已结项”状态，增加“结项”按钮操作
3、当存在“进行中”的项目时，系统卡片上的回滚按钮不可操作
4、系统删除、项目删除都改为软删除，且不删除git仓库和git分支
5、语种增加/删除从系统级操作改为项目级操作，系统级只做语种范围的显示，删除语种是在开发分支上的删除
6、每次发布，dev分支合回master分支时，将语种范围、分组数、文案数等信息更新到系统表里作为一个快照信息，供系统卡片快速读取和显示



---

**Cursor**

这是一轮结构性调整。我先通读当前设计里仓库、删除、语种和发布相关的约定，再按 6 点改文档。

开始按 6 点改设计：独立 GitLab 仓、结项状态、软删除、语种改到项目级、发布时回写系统快照。

Chapters 1–3 are already aligned. I’ll finish the leftover 4.2 APIs (remove system-level language endpoints, add `closeProject`), then sync sequence diagrams, GitLab notes, security, and tests.

六项调整已全部写进 `doc/backend-design/design.md`，接口现为 **17** 个。要点如下。

**1. 一系统一仓**  
`i18n_git_repo_url` 只表示 GitLab **分组**。`addApp` / `confirmMasterInit` 在该分组下创建 `app_key` 仓库，仓库 HTTPS 写入主档 `git_repo_url`。locale、`.i18n-cms.json`、`VERSION.txt` 都在仓库根目录。

**2. 项目状态 + 结项**  
`project_status`：1 进行中 / 2 已结项 / 3 已软删。发布不改状态。新增 `closeProject`：进行中 → 已结项；已结项不能再发。

**3. 回滚按钮**  
`getAppList` / `getAppDetail` 的 `canRollback=1` 仅当已有当前 tag **且** 无进行中项目。`confirmRollback` 同样拒绝。

**4. 软删除**  
系统 `is_deleted=1`，项目置 status=3。不删 GitLab 仓库，不删开发分支。`app_key` / `project_key` 仍占唯一性。

**5. 语种改为项目级**  
已去掉 `addAppLang` / `deleteAppLang`。系统卡片只读发布快照。增删 `{lang}.json` 由浏览器在当前 **开发分支** 完成（须选自预设，至少保留 1 个）。

**6. 发布快照**  
`confirmPublish` / `confirmRollback` 必传 `langCodeList`、`groupCount`、`textCount`，写入主档 `snapshot_*`，供卡片直接展示。

尚未录入 YAPI。需要的话可以说一声再做。

---

**User**

tag由i18n/v{x.x.x.x}改为 v{x.x.x.x}

---

**Cursor**

我会把设计文档里所有 `i18n/v{x.x.x.x}` 的 tag 规则改成 `v{x.x.x.x}`。

Git tag 规则已改为 **`v{x.x.x.x}`**（由 `SERVICE.VERSION` 去掉前缀 `V` 后加小写 `v`）。

例如：`V1.0.1.0` → tag `v1.0.1.0`。

`design.md` 里公共约定、`confirmPublish`、`confirmRollback` 示例和时序图都已对齐。

---

**User**

canRollback由getAppDetail返回，而不是getAppList返回

---

**Cursor**

`canRollback` 已只由 **`getAppDetail`** 返回。

规则不变：已有当前 tag 且不存在进行中项目时为 `1`。前端用该字段禁用回滚按钮；`getAppList` 不再带这个字段，仍返回 `projectCount` 等卡片统计。`confirmRollback` 在存在进行中项目时继续拒绝。

---

**User**

getAppGit接口有什么用

---

**Cursor**

当前方案里，`getAppGit` **几乎没有独立价值**。

它只读主档里的 Git 绑定：该系统独立仓 HTTPS、发布分支名、是否已建仓写种子、`master` sha。**不返回 Token**（Token 仍走 ops 占位符）。

这是早期「先建系统、再 `saveAppGit` 绑共享仓」留下的查询口。`saveAppGit` 已经去掉，建仓改在 `addApp` / `confirmMasterInit` 里完成。

现在这些字段已经够用：

- `getAppDetail` 已有 `gitRepoUrl`、`gitMasterBranch`、`isMasterInited`
- `addProject` 也会返回仓地址和发布分支名

`getAppGit` 多出来的只有 **`masterCommitSha`**。浏览器日常读写 Git 并不依赖这个 sha。

结论：前端进系统详情后即可直连该仓，不必再调 `getAppGit`。若你确认不需要单独查 sha，可以从 17 个接口里拿掉，把 `masterCommitSha` 并进 `getAppDetail`（或也不返回）。需要的话我可以直接改设计文档。

---

**User**

好的，帮我改设计文档

---

**Cursor**

会删掉 `getAppGit`，把 `masterCommitSha` 并进 `getAppDetail`，并把接口清单从 17 改成 16。

已从设计文档去掉 `getAppGit`，接口现为 **16** 个。

前端进系统后调 `getAppDetail` 即可拿到独立仓地址、发布分支、是否已初始化，以及并入的 `masterCommitSha`，再直连 GitLab。Token 仍只走 ops 占位符。

---

**User**

getTagList接口有什么用

---

**Cursor**

当前方案里，`getTagList` **也几乎没有独立价值**。

它只从 MySQL 读每个开发项目**最近一次发布**的 tag（`latest_tag_*`），再标一下哪条等于系统当前 tag。文档已经写明：**完整 tag 历史由浏览器读 GitLab**，本服务不做跳档校验。回滚选档走 GitLab tags，不走这个接口。

和现有接口的重叠：

- `getAppDetail` 已有系统 `currentVersion` / `currentTagName`
- `getProjectList` 已有每项目的 `latestVersion` / `latestTagName`

`getTagList` 多出来的只有：过滤掉从未发布的项目、`tagNote`、`gitCommitSha`、`isCurrent`。项目列表上展示「该项目最新版本」用 `getProjectList` 就够。

结论：回滚看 GitLab tags；项目卡片看 `getProjectList`。若你确认不需要单独的「各项目最新 tag」页，可以去掉该接口；`tagNote` 如要在项目列表展示，并进 `getProjectList` 即可。需要的话我可以直接改设计文档。

---

**User**

可以去掉该接口。另外tagName是什么信息？tagNote应该是需要的，就是VERSION文件里的发布描述

---

**Cursor**

去掉 `getTagList`，把 `tagNote`（VERSION 里的发布描述）并进 `getProjectList`，并在文档里写清 `tagName` 与版本号的对应关系。

已去掉 `getTagList`，接口现为 **15** 个。`tagNote` 并进 `getProjectList`（`latestTagNote`）。

三个字段的含义：

| 字段 | 来源 | 示例 |
| --- | --- | --- |
| **serviceVersion / latestVersion** | `VERSION.txt` 的 `SERVICE.VERSION` | `V1.0.1.0` |
| **tagName / latestTagName** | 打在 master 上的 **git tag 名**，由版本号推出（去掉 `V`，加小写 `v`） | `v1.0.1.0` |
| **tagNote / latestTagNote** | `VERSION.txt` 的 **CHANGELOG**（发布弹窗填的那段描述） | `首页文案第一批` |

`tagName` 不是业务名称，只是 Git 用来标记这次发布的标签，回滚时前端从 GitLab 读这些 tag。完整历史仍由浏览器列 GitLab tags，本服务不再单独提供列表接口。

---

**User**

confirmMasterInit 和 confirmProjectBranch，是不是可以改为对内接口？服务端失败后直接重试

---

**Cursor**

可以。前端不必再调这两个重试口：Git 失败由本服务当场再试，仍失败则走对内补偿。正在把设计改成这个口径。

可以，已经按这个口径改了设计。

**前端不再调这两个接口。** Git 失败由服务端自己处理：

1. `addApp` / `addProject` 里 Git 失败后**当场再试 1 次**（单次超时仍 10s）
2. 仍失败则写 `is_master_inited=0` / `branch_push_status=2`，**不回滚 MySQL**，并**异步**走对内补偿
3. 前端只看 `getAppDetail.isMasterInited`、`getProjectList.branchPushStatus`，没有「重试」按钮

两个接口改为**对内**（路径去掉 `ops` 前缀，不走 CMS 登录）：

- `POST /admin/i18nService/v1/app/confirmMasterInit`
- `POST /admin/i18nService/v1/project/confirmProjectBranch`

合计仍是 15 个接口：**对外 13、对内 2**。

---

**User**

confirm接口仍失败则回滚 MySQL，提示创建失败

---

**Cursor**

创建最终仍失败时回滚本次写入的 MySQL，并向调用方返回创建失败；正在按这个口径改设计。

已写入 `doc/backend-design/design.md`：`confirm` 仍失败时**回滚本次 MySQL，对外提示「创建失败」**。

**成功路径**  
`addApp` / `addProject` 在 Git 失败后：当场再试 1 次 → **同步**走对内 `confirmMasterInit` / `confirmProjectBranch`。成功才返回，`isMasterInited` / `branchPushStatus` **恒为 1**，不再有半成功。

**仍失败**  
- 物理删除本次插入行（系统：主档 + 成员，释放 `app_key`；项目：项目行，释放 `project_key`），用户可重试。  
- 业务错误「创建失败」，不返回 result。  
- **不删** GitLab 仓库/分支（孤儿可残留；重试时已存在视为幂等）。  
- 与用户主动**软删**不同：软删不物理删行、不释放 Key。

**对内 confirm**  
仍用于进程崩溃残留（`is_master_inited=0` / `branch_push_status≠1`）。仍失败同样物理清理未完成行；已初始化、已结项、已软删的行不删。CMS 前端不调这两个接口。

YAPI 未改。需要落接口文档时再说一声。

---

**User**

流程图中，“closeProject 进行中变已结项”节点不用流向“存在进行中项目？”

---

**Cursor**

结项后不再连到「存在进行中项目？」判断，`closeProject` 作为独立终点。

已改：`closeProject 进行中变已结项` 不再连到「存在进行中项目？」，结项是流程终点。

回滚判断仍从 `getAppList` 旁路出来（`B1 → 存在进行中项目?`），与新建项目并行，不依赖结项节点。

---

**User**

1.commit+push节点不流向“结项？”
2.confirmPublish 回写版本与快照流向“结项？”

---

**Cursor**

去掉 `commit + push` 到「结项？」的连线，只保留 `confirmPublish` 流向「结项？」。

已按你的两点改完：

1. `commit + push` 只流向「发布？」，不再连「结项？」
2. 「结项？」只从 `confirmPublish 回写版本与快照` 出来

---

**User**

i18n_preset_lang表，可以去掉preset_lang_id字段，直接用lang_code和外部做业务关联

---

**Cursor**

把 `preset_lang_id` 从预设语种表拿掉，改为用 `lang_code` 做业务关联。先查设计里所有引用。

正在改表结构、接口响应和关联约定，统一用 `lang_code`。

已改：`i18n_preset_lang` 去掉 `preset_lang_id`，对外一律用 `lang_code`。

- **表**：只保留自增主键 `id`（禁止用于业务）+ `lang_code` 唯一索引；不再生成 CloudId。
- **关联**：`addApp.langCodeList`、快照 `snapshot_lang_codes`、Git `{langCode}.json` 都对这个码。
- **接口**：`getPresetLangList` 不再返回 `presetLangId`，只返回 `langCode` / `langName` / `sortNo`。

系统、成员、项目仍用 CloudId。

---

**User**

getPresetLangList接口，云端按sortNo排序后返回，不用返回sortNo字段

---

**Cursor**

已改：`getPresetLangList` 由云端按表字段 `sort_no` 升序后返回，**响应不再带 `sortNo`**。

列表项只剩 `langCode`、`langName`。前端按数组顺序展示即可。`i18n_preset_lang.sort_no` 仍保留，仅服务端排序用。

---

**User**

前端拿isSuperAdmin有什么用？

---

**Cursor**

列表过滤**不用**这个字段：`getAppList` 已经按登录账号筛过了，超管看到全部未软删系统，其他人只看到自己创建的。

前端拿 `isSuperAdmin`，主要是为了**代操作按钮**：

- 软删、转让管理员的规则是「创建者 **或** 超管」
- 每条系统已有 `isCreator`。自己的系统用 `isCreator=1` 就能显示删/转
- 超管打开**别人的**系统时 `isCreator=0`，这时要用 `isSuperAdmin=1` 才能显示代删、代转让；否则按钮会被藏掉，虽然后端其实允许

所以：`isCreator || isSuperAdmin` 控制删/转入口。权限仍由服务端校验，前端字段只影响展示，不能当鉴权。

顺带替代了已去掉的 `getOperator`：登录后不必再调一次「我是不是超管」。也可以用来显示「超管视图」之类文案，不是刚需。

如果前端愿意每条用 `canDelete` / `canTransfer`（创建者或超管为 1），全局 `isSuperAdmin` 可以不返。

---

**User**

改用canDelete / canTransfer吧，对前端来说更直观

---

**Cursor**

把 `isSuperAdmin` 换成每条系统上的 `canDelete` / `canTransfer`，先把文档里所有相关引用找全。

已改：不再返回 `isSuperAdmin`。`getAppList`、`getAppDetail` 按条给 `canDelete` / `canTransfer`。

- **1**：当前登录者是创建者，或云端判定为超管  
- **0**：都不是（权限中心失败按非超管）  
- 前端直接绑软删 / 转让按钮；`isCreator` 仍保留，只表示是不是创建者  
- `canTransfer` 不预判有没有可转的成员，那由 `transferAppAdmin` 校验  
- 列表过滤和写接口鉴权仍在服务端，不提供 `getOperator`

`addApp` 要改成入参带 `appKey`、去掉 `langCodeList`。先核对当前设计里 Key 生成和初始语种种子怎么写的，再一并改文档。

---

**User**

addApp接口请求参：去掉langCodeList，增加appKey

---

**Cursor**

`addApp` 改为入参带 `appKey`、去掉 `langCodeList`。先把设计里所有相关约定找全，再一并改掉。

正在同步改结论、表注释、`addApp` 入参/流程和种子约定：用户填 `appKey`，建仓不再写初始语种文件。

已改 `addApp` 请求：

- **去掉** `langCodeList`
- **增加** 必填 `appKey`（`^[a-z][a-z0-9-]{0,63}$`，≤64，全平台唯一含已软删）

连带约定：

- Key 由用户填写，不再从系统名生成；`updateApp` 不改、不接收 `appKey`
- 建仓种子只写 `.i18n-cms.json` 和 `VERSION.txt`，**不写**语种 json；快照语种初始为 `[]`
- 语种仍只在开发分支由前端增删；`confirmPublish` / `confirmRollback` 的 `langCodeList` 不变（发布快照用）

---

**User**

addApp：返回无需appKey，appKey由前端根据规则从系统名生成

---

**Cursor**

`addApp` 响应去掉 `appKey`；Key 改由前端按规则从系统名生成再提交。正在把文档里相关约定改齐。

已改：`addApp` **响应不再返回 `appKey`**。

- 前端按规则从系统名生成 Key 再放进请求：trim → 按空格拆词 → 小写 → 中横线连接（如 `VeSync App` → `vesync-app`）
- 请求仍带 `appKey`；服务端用同一规则校验，不一致、超长或冲突则拒绝
- 创建后不可改；`updateApp` 改名不重生 Key
- 列表/详情仍返回 `appKey`，创建成功后前端用本地已生成的值即可

---

**User**

addApp还是用原来的设计吧：appKey由服务端按规则生成，前端传参不传appKey，响应增加appKey

---

**Cursor**

把 `addApp` 的 `appKey` 改回服务端生成：请求不传，响应带回。先核对文档里当前写法再改。

已改回原来的 `appKey` 约定：

- **请求不传** `appKey`（传入也不采用）
- **服务端**按规则从系统名生成：trim → 空格拆词 → 小写 → 中横线（`VeSync App` → `vesync-app`）
- **响应返回**生成的 `appKey`
- 创建后不可改；`updateApp` 改名不重生

`langCodeList` 仍不在 `addApp` 请求里，种子也不写语种文件。

---

**User**

updateApp：响应应该无需memberCount；“memberNameList 非 null 时覆盖 member_role=2”是什么意思

---

**Cursor**

先说明那句话，再从 `updateApp` 响应里去掉 `memberCount`，并把处理流程改成更直白的写法。

那句话的意思是：`member_role=2` 是普通成员（管理员是 `1`）。`memberNameList` **传了**（含空数组）就用这份名单**整表替换所有普通成员**，管理员不动；**不传**这个字段则成员完全不改。空数组 `[]` 等于清掉全部普通成员，只留管理员。

`updateApp` 响应已去掉 `memberCount`，成功只回 `appId`。

原来那句的意思是：成员表里 **1=管理员、2=普通成员**。`memberNameList` 用来改普通成员，不动管理员。

| 入参 | 效果 |
| --- | --- |
| 字段不传 | 成员完全不改 |
| `["Alice"]` | 普通成员变成只有 Alice，管理员仍在 |
| `[]` | 普通成员清空，只留管理员 |

本接口不能改管理员；转让走 `transferAppAdmin`。处理流程已改成上面这套说法，不再用「覆盖 `member_role=2`」那种写法。

---

**User**

transferAppAdmin返回不需要appId

---

**Cursor**

已改：`transferAppAdmin` **响应不再返回 `appId`**，成功时 `result` 为空对象 `{}`。请求里的 `appId` 仍要传。

---

**User**

检查：transferAppAdmin只改member_role，不改creator_account_id 的话，会不会影响可见权限

---

**Cursor**

**按当前规则，转让不会改列表可见性。** `getAppList` / `assertVisible` 只认 `creator_account_id` 和超管，不看 `member_role`。`transferAppAdmin` 只对调普通成员和管理员角色，创建者账号不变，所以谁能看见这套系统，转让前后一样。

具体是：

| 人 | 转让后 |
| --- | --- |
| 原创建者账号 | 列表里仍能看到；`isCreator=1`，仍能软删、再转让 |
| 新管理员（姓名「Alice」） | **不会**因此看到这套系统。成员只存姓名、不绑账号，角色换了也登不进这套数据 |
| 超管 | 始终能看见、能代操作 |

这是有意的：可见性跟「谁建的」走，不跟「卡片上谁是管理员」走。集成测试也写了「可见性仍按原创建者」。

要注意的副作用：

1. **「管理员即创建者」转让后不再成立。** 表里 `member_role=1` 是新名字，可见性和 `canDelete` / `canTransfer` 仍只给原创建者（或超管）。新管理员在 CMS 里既看不见，也不能管。
2. **没法靠改 `creator_account_id` 把可见性交给新人。** 目标只有姓名，没有账号可写。
3. 一期成员不绑账号的话，转让只是**展示角色**（谁显示成管理员），不是把系统交给另一个员工登录使用。

如果产品要「转给同事后，对方能在列表里看到并操作」，需要成员绑账号，并在转让时改 `creator_account_id`（或可见性改为创建者 **或** 当前管理员账号）。要按那个口径改设计的话可以说一声。

---

**User**

调整：1.可见性改为管理员+成员+超管
2.移交和删除只有管理员和超管有权限
3.初始系统数据时管理员即为创建者


---

**Cursor**

可见性要落到登录账号上，成员表会补上 `member_account_id`；删/转改为当前管理员或超管。`addApp` 写入的管理员就是创建者。

已按这三条改完权限模型。

**可见性（`assertVisible`）**  
超管，或成员表里有当前登录账号（管理员或普通成员）。列表/详情/建项目/发布/结项都走这条。

**删系统、转让管理员（`assertAdmin`）**  
仅当前管理员（`member_role=1`）或超管。`canDelete` / `canTransfer` 与此相同。  
`isCreator` 仍按 `creator_account_id`，只展示，不给删/转。

**新建时管理员 = 创建者**  
`addApp` 用登录账号插入 `member_role=1`，并写入 `creator_account_id`。转让只对调角色，**不改**创建者字段。原创建者变成普通成员后仍能看见系统，但不能再删/转。

为了让「成员可见」对得上登录态，成员改为 **账号 ID + 姓名快照**（不再只存姓名）。`addApp` / `updateApp` 的 `memberNameList` 换成 `memberList`（`accountId` + `memberName`）。

---

**User**

isCreator 字段应该没有用了

---

**Cursor**

`isCreator` 确实可以去掉。我先在设计文档里找出所有引用，再一并删掉。

接口不再返回 `isCreator`。主档仍保留 `creator_account_id` 作为创建记录，转让时不改。

已从接口里去掉 `isCreator`。

`getAppList`、`getAppDetail` 都不再返回该字段。前端用 `canDelete` / `canTransfer` 控制删、转即可。

主档仍保留 `creator_account_id` / `creator_name`：新建时写入，转让不改，只作创建记录，不参与鉴权和接口展示。

---

**User**

memberId是不是可以删掉，统一用accountId即可？

---

**Cursor**

先核对 `memberId` 在接口和表里怎么用，再决定能不能改成统一走 `accountId`。

可以。成员已绑登录账号，`(app_id, member_account_id)` 就是自然键。接口和表都去掉 `memberId`，对外统一 `accountId`。

可以，已经按这个改完了。

成员必须绑登录账号，同系统内 `(app_id, member_account_id)` 就是唯一标识，不必再造一层 `memberId`。

具体变化：

- **表**：去掉 `member_id`，不再给成员发 CloudId。
- **列表/详情**：`memberList` 只保留 `accountId`、`memberName`、`memberRole`。
- **转让**：`targetMemberId` 改为 `accountId`，按登录账号定位本系统普通成员。

`addApp` / `updateApp` 本来就是 `accountId`，现在读写都统一了。

---

**User**

deleteApp的返回也可为空

---

**Cursor**

已改：`deleteApp` 成功时 `result` 为空对象 `{}`，不再返回 `appId`、`appKey`、`gitRepoUrl`，与 `transferAppAdmin` 一致。

---

**User**

confirmMasterInit应该要增加appKey传参，因为要拿这个key去创建仓库

---

**Cursor**

对内 `confirmMasterInit` 补上必填 `appKey`，建仓用这个仓库名，并与主档校验一致。先看当前接口与 `addApp` 的调用约定。

已加上。`confirmMasterInit` 现在必传 `appId` + `appKey`。

建仓用入参 `appKey` 作为 GitLab 仓库的 path/name。`appKey` 必须和主档一致，不能靠入参改仓名。`addApp` 同步补偿、崩溃残留清理都会带上这个 key。

---

**User**

getProjectList应该可以去掉projectStatus

---

**Cursor**

已去掉请求里的 `projectStatus`。`getProjectList` 只传 `appId`，一次返回该系统下进行中和已结项项目（不含已软删）。每条仍带 `projectStatus`，前端自己区分即可。

---

**User**

confirmProjectBranch传参应该也可以加上projectKey

---

**Cursor**

已加上。`confirmProjectBranch` 现在必传 `appId` + `projectId` + `projectKey`。

拉分支用入参拼 `dev-{projectKey}`。`projectKey` 必须和该行一致，不能靠入参改分支名。`addProject` 同步补偿、崩溃残留清理都会带上这个 key。

---

**User**

confirmProjectBranch和confirmMasterInit保留之前的设计，传参去掉key

---

**Cursor**

按你的要求，对内补偿接口改回只传 ID，仓名和分支名从主档查出，不再带 `appKey` / `projectKey`。

已改回。两个对内补偿接口都不传 key：

- `confirmMasterInit`：只传 `appId`，仓名读主档 `app_key`
- `confirmProjectBranch`：只传 `appId` + `projectId`，分支名读该行 `project_key` 再拼 `dev-{projectKey}`

---

**User**

deleteProject的响应应该可以为空吧

---

**Cursor**

可以，已经改成和 `deleteApp` 一样：成功时 `result` 为空对象 `{}`，不再返回 `projectId`、`gitBranch`、`projectStatus`。

---

**User**

addProject的响应为什么要有gitMasterBranch和appKey

---

**Cursor**

这两个是系统级字段，`getAppDetail` 已经有了，新建项目不必再带回。一并去掉同样冗余的 `gitRepoUrl`。

不必有。`appKey`、`gitMasterBranch`（以及同样冗余的 `gitRepoUrl`）都是系统级信息，进系统时 `getAppDetail` 已经给过，新建项目不会改它们。

`addProject` 成功只返回项目自己的字段：`projectId`、`projectKey`、`gitBranch`、`branchPushStatus`、`sourceCommitSha`。仓地址和发布分支继续从详情取。

