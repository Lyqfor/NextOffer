# NextOffer

本仓库为 **NextOffer**（本地优先求职管理桌面应用）的实现仓库。

- 需求文档：`NextOffer_PRD.md`
- 项目上下文：`CONTEXT.md`
- 开发日志：`DEV_LOG.md`

## 目录结构（对齐 PRD 第 2/3 节）

> 说明：当前仅完成 **Phase 1 / 初始化目录结构**（工程骨架尚未接入构建配置与依赖）。

```
NextOffer/
├── src-tauri/                    # Tauri 主进程（Rust）
│   ├── src/
│   │   ├── main.rs               # 入口（占位）
│   │   ├── commands/             # Tauri Command 层（前端调用的 API）
│   │   │   ├── mod.rs
│   │   │   ├── profile.rs
│   │   │   ├── tracker.rs
│   │   │   ├── inbox.rs
│   │   │   ├── browser.rs
│   │   │   └── system.rs
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── schema.sql
│   │   │   └── migrations/
│   │   │       └── .gitkeep
│   │   ├── imap/
│   │   │   ├── mod.rs
│   │   │   ├── client.rs
│   │   │   └── parser.rs
│   │   └── crypto/
│   │       └── mod.rs
│   └── tauri.conf.json           # 占位（后续按 Tauri 2 初始化生成/调整）
│
├── src/                          # Vue 3 前端
│   ├── main.ts                   # 入口（占位）
│   ├── app.vue                   # 根组件（占位）
│   ├── router/
│   │   └── index.ts              # 基础路由（占位）
│   ├── stores/
│   │   ├── app.ts                # 全局应用状态（占位）
│   │   └── plugin-registry.ts    # 插件注册中心 Store（占位）
│   ├── core/
│   │   ├── plugin-system/
│   │   │   ├── types.ts
│   │   │   ├── registry.ts
│   │   │   └── loader.ts
│   │   ├── event-bus/
│   │   │   └── index.ts
│   │   └── llm-service/
│   │       ├── types.ts
│   │       ├── index.ts
│   │       └── providers/
│   │           └── .gitkeep
│   ├── plugins/
│   │   ├── profile/
│   │   │   └── .gitkeep
│   │   ├── tracker/
│   │   │   └── .gitkeep
│   │   ├── browser/
│   │   │   └── .gitkeep
│   │   ├── inbox/
│   │   │   └── .gitkeep
│   │   └── _extensions/
│   │       └── .gitkeep
│   ├── layouts/
│   │   └── .gitkeep
│   └── shared/
│       ├── components/
│       │   └── .gitkeep
│       └── utils/
│           └── .gitkeep
│
├── CONTEXT.md
├── DEV_LOG.md
└── NextOffer_PRD.md
```

