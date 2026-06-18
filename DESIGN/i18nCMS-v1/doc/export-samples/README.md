# i18n CMS 导出 JSON 格式规范

本文档定义了 i18n CMS 导出 JSON 文件的格式规范与示例，供导出、发布至 S3、跨环境迁移等场景使用。

---

## 1. 格式总览

| 格式            | 文件名                       | 用途                          | 是否多语言 | 保留层级 | 含元数据 |
| --------------- | ---------------------------- | ----------------------------- | ---------- | -------- | -------- |
| **Runtime**（默认） | `{lang}.json`                | 发布至 S3 / 前端运行时加载    | 单语言     | 是       | 轻量     |
| **Flat**（可选）    | `{lang}.flat.json`           | 前端快速查找、平铺式框架适配  | 单语言     | 否（路径拼接） | 轻量     |
| **Full**（备份）    | `{dirKey}.full.json`         | 跨环境迁移、备份归档、二次导入 | 全量语言   | 是       | 完整     |

所有文件均为 `UTF-8` 编码，缩进 2 空格。

---

## 2. 共同约定

- 根节点 `_meta` 为保留字段（下划线前缀），存放导出元信息。
- 目录节点 Key 采用 `layout_{id}` 命名（与 CMS 中「目录 Key」一致）。
- 文案节点 Key 全大写 + 下划线，最长 16 字符（与 PRD 3.2.2 一致）。
- 区分规则：值为 `object` → 目录；值为 `string` → 文案。
- 文案内容支持：
  - 变量占位符：`{user_name}`、`{count}`
  - HTML 标签：`<b>`、`<a>`、`<br/>` 等（需前端转义/反转义处理）
  - 复数/富文本：通过约定标记扩展（预留）

---

## 3. Runtime 格式

### 3.1 用途

- 发布至 S3，对应 URL：`https://cdn.vesync.com/i18n/{dirKey}/{lang}.json`
- 前端项目通过 HTTP 请求或构建期 `import` 加载
- 只包含已发布（非草稿）内容

### 3.2 结构

```json
{
  "_meta": { /* 导出元信息 */ },
  "TEXT_KEY_1": "翻译内容",
  "layout_sub_dir": {
    "TEXT_KEY_2": "翻译内容",
    "layout_nested": {
      "TEXT_KEY_3": "翻译内容"
    }
  }
}
```

### 3.3 前端使用示例

```javascript
import i18n from './zh-CN.json';

i18n.PD_TITLE;
i18n.layout_product_spec.SPEC_COLOR;
i18n.layout_product_review.layout_review_image.IMG_REVIEW_BTN;
```

### 3.4 样例文件

- `sample-zh-CN.json`
- `sample-en-US.json`
- `sample-ja-JP.json`

---

## 4. Flat 格式

### 4.1 用途

- 适配 `i18next`、`react-intl` 等按「点路径」查找的框架
- 便于日志打点、翻译缺失检测

### 4.2 结构

```json
{
  "_meta": { ... },
  "PD_TITLE": "商品详情",
  "layout_product_spec.SPEC_COLOR": "颜色",
  "layout_product_review.layout_review_image.IMG_REVIEW_BTN": "添加照片/视频"
}
```

### 4.3 样例文件

- `sample-zh-CN.flat.json`

---

## 5. Full 备份格式

### 5.1 用途

- 跨环境迁移（例如从预发环境导出 → 导入正式环境）
- 历史版本归档
- 保留目录配置（审核员、截图、状态、创建信息等）

### 5.2 结构

根节点 `tree` 为一棵目录树，每个节点包含：

- `type`：`directory` | `message`
- 目录节点附加：`id` / `key` / `name` / `reviewers` / `screenshots` / `messages` / `children`
- 文案节点附加：`key` / `status` / `translations` / `createdBy` / `updatedAt` 等

### 5.3 样例文件

- `sample-full.json`

---

## 6. 元数据（`_meta`）字段说明

| 字段            | 类型       | 说明                                            |
| --------------- | ---------- | ----------------------------------------------- |
| `schemaVersion` | string     | 格式版本号，当前为 `1.0`                        |
| `project`       | string     | 项目标识（英文）                                |
| `projectName`   | string     | 项目中文名                                      |
| `directoryId`   | string     | 导出目录的内部 ID                               |
| `directoryKey`  | string     | 导出目录的 Key，如 `layout_product`             |
| `directoryPath` | string[]   | 从根到当前目录的 Key 链路                       |
| `language`      | string     | 语言码（Runtime / Flat 格式）                   |
| `languages`     | string[]   | 含全部语言码（Full 格式）                       |
| `version`       | string     | 发布版本号，如 `v1.2.3`                         |
| `exportedAt`    | string     | 导出时间（ISO 8601）                            |
| `exportedBy`    | string     | 导出人邮箱                                      |
| `cdnUrl`        | string     | 对应 S3 访问链接                                |
| `totalMessages` | number     | 文案总数                                        |
| `totalDirectories` | number  | 子目录总数                                      |
| `checksum`      | string     | 内容 SHA-256，用于校验数据完整性（可选）        |

---

## 7. 导入兼容性

- **Runtime 格式**：导入时根据嵌套结构自动创建目录树；目录 Key 以 `layout_` 前缀识别。
- **Flat 格式**：导入时按 `.` 分隔符解析层级。
- **Full 格式**：完整恢复所有元信息（审核员、状态、时间戳不覆盖已有数据，由用户在冲突弹窗中选择）。

冲突策略（详见 PRD 3.2.3）：

| 情况                         | 处理                            |
| ---------------------------- | ------------------------------- |
| 同 Key 内容一致              | 跳过                            |
| 同 Key 内容不一致            | 弹窗提示，用户选择「覆盖 / 保留 / 合并」 |
| 目录 Key 冲突                | 合并到现有目录（同级同 Key）    |
| 语言码非法                   | 整体校验失败、终止导入          |

---

## 8. 版本策略

- `schemaVersion` 采用 `主.次` 语义：
  - 次版本升级：向后兼容（新增字段）
  - 主版本升级：不兼容变更
- 旧版本导入新格式时，未知字段应被忽略（`unknown field → ignore`），不触发报错。
