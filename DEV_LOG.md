# DEV_LOG — NextOffer 开发日志

> 规则：按日期追加记录；每次变更至少更新“当前进度 / 待完成 / 已完成”。  
> 需求来源：`NextOffer_PRD.md`（v1.0）。  


## 2026-03-13

### 当前进度
- **阶段**：文档对齐 / 项目初始化前
- **状态**：已按 PRD 第 3 节补齐“目录结构规范”对应的文件与目录骨架（`src-tauri/` 与 `src/`），工程初始化与依赖接入尚未开始。

### 待完成（按 PRD Phase）
- **Phase 1（工程骨架 / P0）**
  - 初始化 Tauri 2.x + Vue 3 + TypeScript 工程
  - 搭建插件系统（`Plugin` 接口、`PluginRegistry`、插件加载顺序）
  - 集成 `mitt` EventBus（并集中定义事件名/类型）
  - 集成 Pinia、Vue Router（支持插件注入路由/导航）
  - 集成 SQLite（初始化 `schema.sql` + migrations 机制）
  - 实现主布局 `MainLayout`、主题切换
- **Phase 2（Profile）**：结构化档案、多模板、PDF 上传预览、侧边栏字段输出
- **Phase 3（Browser）**：账号管理（Keychain）、Webview、档案侧边栏、添加到看板
- **Phase 4（Tracker）**：Kanban、详情（时间线/面试/笔记）、列表、统计、面试后提醒任务
- **Phase 5（Inbox）**：IMAP 绑定、定时同步、规则引擎解析、自动关联、通知
- **Phase 6（收尾）**：LLM Service、全局搜索（FTS5）、备份/恢复、联调与修复

### 已完成
- 更新 `CONTEXT.md`：基于 PRD 归纳项目定位、关键约束、模块拆分、事件协议、数据策略与阶段规划；并纠正为“当前仓库尚未初始化代码”的事实状态。
- 初始化 `DEV_LOG.md`：建立按日期记录的开发日志骨架与待办清单。
- Phase 1：创建并对齐 PRD「目录结构规范」的完整目录树与文件占位（每个文件注明职责与边界）。

