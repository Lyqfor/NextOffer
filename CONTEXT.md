# NextOffer 项目上下文（对话必读 / 精简事实版）

## 项目一句话
**本地优先（Local-First）的求职全流程桌面应用**：档案准备 → 网页投递（内置浏览器 + 侧边栏复制）→ 进度看板 → 邮件解析与提醒。所有数据默认落地本机 SQLite，敏感信息进系统 Keychain。

## 当前仓库状态（务必以此为准）
- **代码状态**：当前 `d:\Java\NextOffer\` 仅包含 `NextOffer_PRD.md` 与本文档，**尚未初始化工程代码**，仓库也**尚无 commit**。
- **本仓库“源需求真相”**：`NextOffer_PRD.md`（v1.0）。

## 技术栈（PRD 指定）
- **桌面**：Tauri 2.x（Rust 主进程）
- **前端**：Vue 3 + TypeScript（`<script setup>`）
- **状态**：Pinia（插件可注册 store）
- **路由**：Vue Router 4（插件可注入路由）
- **事件总线**：mitt（跨插件通信）
- **UI**：Naive UI（含暗色模式）
- **数据库**：SQLite（`tauri-plugin-sql`）
- **密钥**：`tauri-plugin-keychain`（密码 / API Key / IMAP 授权码）
- **PDF**：`pdfjs-dist`
- **拖拽**：`vue-draggable-plus`
- **图表**：ECharts 5

## 架构原则（违反即视为 BUG）
- **插件化解耦**：业务模块以插件形式注册，主应用不直接依赖业务实现。
- **跨插件通信只能走 EventBus**：禁止跨插件直接 `import` 对方 store / service（必要能力通过事件协议或 `PluginContext` 注入的全局服务提供）。
- **敏感信息不落 SQLite/文件**：密码、API Key、IMAP 授权码必须存 Keychain；备份文件不包含 Keychain 数据。
- **Webview 安全约束**：MVP 采用“侧边栏复制粘贴”方案，**禁止向 Webview 注入脚本**（不做 DOM 自动填充）。
- **Command 分层**：所有 Tauri Commands 按模块放在 `src-tauri/src/commands/` 下分文件（`profile.rs/tracker.rs/inbox.rs/browser.rs/system.rs`）。

## 插件与模块（MVP v1.0 范围）
- **模块 0：应用核心**：主布局、主题、全局搜索（FTS5）、数据备份/恢复、通知等全局能力
- **模块 1：Profile（个人档案/简历中心）**：结构化档案、多模板、PDF 简历上传预览、侧边栏字段输出
- **模块 2：Browser（投递浏览器）**：账号/密码（Keychain）、内置 Webview、档案侧边栏、一键“添加到看板”
- **模块 3：Tracker（求职看板）**：Kanban 拖拽、卡片详情（时间线/面试记录/笔记）、列表视图、统计、面试后提醒任务
- **模块 4：Inbox（邮件中心）**：IMAP 绑定、定时拉取、规则引擎解析、自动关联看板、提醒
- **模块 5：LLM Service（可选增强）**：多 Provider 配置、统一调用接口、用于邮件解析增强

## 数据策略（SQLite + Keychain）
- **SQLite**：存所有业务数据与元数据（档案/看板/邮件解析记录/LLM 配置元信息/设置等）
- **Keychain**：仅存敏感密钥（站点密码、IMAP 密码/授权码、LLM API Key）
- **备份**：导出 `.nextoffer`（本质 ZIP）= SQLite + 附件（PDF），**不包含 Keychain**（恢复后需用户重新输入密钥）

## EventBus 事件协议（统一目录，禁止自造命名）
命名规范：`{插件ID}:{动词}:{名词}`。以下为 PRD 指定的全局事件最小集合：

| 事件名 | 发布方 | 订阅方 | 数据结构（摘要） |
|---|---|---|---|
| `tracker:update:card-status` | inbox | tracker | `{ companyId, newStatus, metadata }` |
| `tracker:create:card` | browser | tracker | `{ companyName, url, position }` |
| `inbox:notify:new-interview` | inbox | system | `{ companyName, time, location }` |
| `profile:request:fields` | browser | profile | `{ fieldKeys: string[] }` |
| `profile:response:fields` | profile | browser | `{ fields: ProfileField[] }` |
| `llm:request:analyze` | 任意 | llm-service | `{ prompt, context, callbackEvent }` |
| `llm:response:result` | llm-service | 任意 | `{ result, callbackEvent }` |

## 计划中的目录结构（实现时需遵守 PRD）
> 当前仓库尚未生成工程代码；以下为 PRD 规定的目标结构，用于后续创建项目时对齐。

- `src-tauri/`：Tauri 主进程（Rust）
  - `src/commands/`：按模块拆分 Command（`profile/tracker/inbox/browser/system`）
  - `src/db/schema.sql` + `src/db/migrations/`：初始化与迁移
  - `src/imap/`：IMAP 客户端与解析器
- `src/`：Vue 前端
  - `core/plugin-system/`：插件系统（类型/注册表/加载器）
  - `core/event-bus/`：mitt 封装
  - `core/llm-service/`：LLM Service 与 provider 适配器
  - `plugins/{profile,tracker,browser,inbox}/`：业务插件目录
  - `layouts/`：`MainLayout.vue` / `BrowserLayout.vue`
  - `shared/`：全局组件与工具

## PRD 阶段规划（用于更新进度）
- **Phase 1**：工程骨架 + 插件系统 + SQLite 初始化/迁移 + 主布局/主题/路由
- **Phase 2**：Profile
- **Phase 3**：Browser + 侧边栏 + “添加到看板”
- **Phase 4**：Tracker
- **Phase 5**：Inbox（IMAP + 解析 + 通知）
- **Phase 6**：LLM + 全局搜索（FTS5）+ 备份/恢复 + 联调收尾

## 下一步建议
每次执行完当前任务后结合规划给出下一步的任务，只需要给出一个阶段的小任务即可