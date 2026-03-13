# NextOffer — 产品需求文档 (PRD) v1.0

> **文档状态：** 可用于 AI 辅助自动化开发  
> **技术栈：** Tauri 2.x + Vue 3 + TypeScript + SQLite  
> **架构模式：** 插件化架构（Plugin-based Architecture）  
> **数据策略：** Local-First，所有数据存储于本地 SQLite，无需服务器  

---

## 目录

1. [产品概述](#1-产品概述)
2. [技术架构总览](#2-技术架构总览)
3. [目录结构规范](#3-目录结构规范)
4. [插件系统设计（核心）](#4-插件系统设计核心)
5. [数据库 Schema 设计](#5-数据库-schema-设计)
6. [模块 0：应用核心 & 全局服务](#6-模块-0应用核心--全局服务)
7. [模块 1：个人档案与简历中心](#7-模块-1个人档案与简历中心)
8. [模块 2：内置浏览器与档案侧边栏](#8-模块-2内置浏览器与档案侧边栏)
9. [模块 3：求职进度看板](#9-模块-3求职进度看板)
10. [模块 4：邮件智能解析](#10-模块-4邮件智能解析)
11. [模块 5：LLM 通用组件](#11-模块-5llm-通用组件)
12. [MVP 范围界定与开发阶段规划](#12-mvp-范围界定与开发阶段规划)
13. [非功能性需求](#13-非功能性需求)
14. [预留扩展点索引](#14-预留扩展点索引)

---

## 1. 产品概述

### 1.1 定位

**NextOffer** 是一款面向求职者的本地优先（Local-First）桌面应用。旨在打通"信息准备 → 网页投递 → 进度追踪 → 面试提醒"的求职全流程，所有数据存储于本地，保护隐私，开箱即用。

### 1.2 核心价值主张

| 痛点 | NextOffer 的解法 |
|------|----------------|
| 海投时重复填写相同信息 | 档案侧边栏：一键复制预存字段，粘贴到任意网页 |
| 多平台投递进度分散难追踪 | 可视化 Kanban，统一管理所有公司投递状态 |
| 面试邮件淹没在收件箱中 | IMAP 自动解析，面试时间自动录入 + 桌面提醒 |
| 信息填充依赖平台适配 | 侧边栏复制模式，不依赖页面结构，零兼容性问题 |

### 1.3 设计原则

- **Local-First：** 核心功能完全离线可用，外部 API（LLM 等）均为可选增强
- **插件化解耦：** 所有业务模块以插件形式注册，彼此无直接依赖
- **渐进增强：** MVP 功能闭环，v2+ 通过插件机制扩展，不破坏已有功能
- **数据安全：** 密码等敏感字段使用系统 Keychain 加密存储，不以明文写入 SQLite

---

## 2. 技术架构总览

```
┌────────────────────────────────────────────────────┐
│                  NextOffer Desktop App              │
│  ┌──────────────────────────────────────────────┐  │
│  │              Vue 3 Frontend (渲染进程)         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │  │
│  │  │ Profile  │ │ Tracker  │ │   Browser    │ │  │
│  │  │ Plugin   │ │ Plugin   │ │   Plugin     │ │  │
│  │  └──────────┘ └──────────┘ └──────────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │  │
│  │  │  Inbox   │ │   LLM    │ │  [扩展插件]   │ │  │
│  │  │ Plugin   │ │ Service  │ │   占位符      │ │  │
│  │  └──────────┘ └──────────┘ └──────────────┘ │  │
│  │  ──────────── Plugin Registry ─────────────  │  │
│  │  ──────────── Event Bus (mitt) ─────────────  │  │
│  │  ──────── Global Store (Pinia) ──────────────  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │              Tauri Core (主进程/Rust)          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │  │
│  │  │  SQLite  │ │  IMAP   │ │   Keychain   │ │  │
│  │  │  (数据库) │ │ (邮件)  │ │   (密码)     │ │  │
│  │  └──────────┘ └──────────┘ └──────────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │  │
│  │  │ Webview  │ │  通知   │ │  文件系统     │ │  │
│  │  │ (内置浏览)│ │ (提醒)  │ │  (PDF上传)   │ │  │
│  │  └──────────┘ └──────────┘ └──────────────┘ │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

### 2.1 技术选型

| 层级 | 选型 | 说明 |
|------|------|------|
| 桌面框架 | Tauri 2.x | Rust 核心，体积小，内存占用低 |
| 前端框架 | Vue 3 + TypeScript | Composition API + `<script setup>` |
| 状态管理 | Pinia | 支持插件级 store 注册 |
| 事件总线 | mitt | 轻量跨插件通信 |
| 路由 | Vue Router 4 | 支持插件动态注册路由 |
| UI 组件库 | Naive UI | Vue 3 原生，支持暗色模式 |
| 数据库 | SQLite（tauri-plugin-sql） | 本地持久化 |
| 密码存储 | tauri-plugin-keychain | 系统级加密 |
| 邮件协议 | IMAP（Rust imap crate） | 绑定邮箱拉取邮件 |
| PDF 预览 | pdfjs-dist | 前端渲染 PDF |
| 拖拽 | vue-draggable-plus | Kanban 拖拽 |
| 图表 | ECharts 5 | 转化漏斗图等 |

---

## 3. 目录结构规范

```
nextoffer/
├── src-tauri/                    # Tauri 主进程（Rust）
│   ├── src/
│   │   ├── main.rs               # 入口
│   │   ├── commands/             # Tauri Command 层（前端调用的 API）
│   │   │   ├── mod.rs
│   │   │   ├── profile.rs        # 档案相关命令
│   │   │   ├── tracker.rs        # 看板相关命令
│   │   │   ├── inbox.rs          # 邮件相关命令
│   │   │   ├── browser.rs        # 浏览器/密码相关命令
│   │   │   └── system.rs         # 通知/备份/全局命令
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── schema.sql        # 数据库初始化 SQL
│   │   │   └── migrations/       # 版本迁移 SQL 文件
│   │   ├── imap/
│   │   │   ├── mod.rs
│   │   │   ├── client.rs         # IMAP 连接管理
│   │   │   └── parser.rs         # 邮件解析（规则引擎）
│   │   └── crypto/
│   │       └── mod.rs            # 密码加解密工具
│   └── tauri.conf.json
│
├── src/                          # Vue 3 前端
│   ├── main.ts                   # 应用入口，加载插件注册表
│   ├── app.vue                   # 根组件
│   ├── router/
│   │   └── index.ts              # 基础路由，插件可动态注入
│   ├── stores/
│   │   ├── app.ts                # 全局应用状态（主题/语言/设置）
│   │   └── plugin-registry.ts    # 插件注册中心 Store
│   ├── core/
│   │   ├── plugin-system/
│   │   │   ├── types.ts          # Plugin 接口类型定义
│   │   │   ├── registry.ts       # PluginRegistry 实现
│   │   │   └── loader.ts         # 插件加载器
│   │   ├── event-bus/
│   │   │   └── index.ts          # mitt 事件总线封装
│   │   └── llm-service/
│   │       ├── types.ts          # LLM 服务接口类型
│   │       ├── index.ts          # LLM Service 统一入口
│   │       └── providers/        # 各 LLM 厂商适配器
│   │           ├── openai.ts
│   │           ├── deepseek.ts
│   │           └── zhipu.ts
│   ├── plugins/                  # 各业务插件目录
│   │   ├── profile/              # 插件 1：个人档案
│   │   │   ├── index.ts          # 插件注册入口（必须实现 Plugin 接口）
│   │   │   ├── store.ts          # 该插件的 Pinia store
│   │   │   ├── routes.ts         # 该插件注入的路由
│   │   │   ├── views/            # 页面组件
│   │   │   └── components/       # 子组件
│   │   ├── tracker/              # 插件 2：求职进度看板
│   │   ├── browser/              # 插件 3：内置浏览器
│   │   ├── inbox/                # 插件 4：邮件解析
│   │   └── _extensions/          # 未来扩展插件占位
│   │       ├── ai-resume/        # 预留：AI 简历优化
│   │       ├── cloud-sync/       # 预留：云同步
│   │       ├── calendar-export/  # 预留：日历导出
│   │       └── interview-prep/   # 预留：八股文背诵
│   ├── layouts/
│   │   ├── MainLayout.vue        # 主布局（侧边导航 + 内容区）
│   │   └── BrowserLayout.vue     # 浏览器布局（Webview + 侧边栏）
│   └── shared/
│       ├── components/           # 全局共享组件
│       │   ├── AppSidebar.vue
│       │   ├── GlobalSearch.vue
│       │   └── ThemeToggle.vue
│       └── utils/                # 全局工具函数
│
└── package.json
```

---

## 4. 插件系统设计（核心）

插件系统是 NextOffer 解耦的核心。每个业务模块均实现统一的 `Plugin` 接口，由 `PluginRegistry` 统一管理，主应用对具体模块无直接依赖。

### 4.1 Plugin 接口定义

```typescript
// src/core/plugin-system/types.ts

import type { RouteRecordRaw } from 'vue-router'
import type { StoreDefinition } from 'pinia'
import type { Component } from 'vue'

/** 插件元数据 */
export interface PluginMeta {
  id: string           // 唯一标识，如 'profile', 'tracker'
  name: string         // 显示名称，如 '个人档案'
  version: string      // 语义化版本，如 '1.0.0'
  icon: string         // 导航图标（Naive UI icon name）
  order: number        // 在侧边栏中的排列顺序
  description?: string
}

/** 插件导航配置 */
export interface PluginNavItem {
  label: string
  icon: string
  routeName: string
  badge?: () => number | string | null   // 动态角标，如未读邮件数
}

/** 插件接口（所有插件必须实现） */
export interface Plugin {
  meta: PluginMeta

  // 生命周期
  install: (context: PluginContext) => void | Promise<void>
  uninstall?: () => void | Promise<void>

  // 路由注入（可选）
  routes?: RouteRecordRaw[]

  // Store 注入（可选，返回 Pinia store definition）
  stores?: StoreDefinition[]

  // 侧边栏导航项（可选）
  navItems?: PluginNavItem[]

  // 插件向全局注册的能力（供其他插件通过 EventBus 调用）
  provides?: string[]
}

/** 插件安装上下文 */
export interface PluginContext {
  eventBus: EventBusInstance    // 跨插件通信
  router: Router                // 注入路由
  pinia: Pinia                  // 注入 Store
  llmService: LLMService        // LLM 服务引用
  db: DatabaseService           // 数据库服务引用
}
```

### 4.2 PluginRegistry 实现规范

```typescript
// src/core/plugin-system/registry.ts

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()

  async register(plugin: Plugin, context: PluginContext): Promise<void>
  // 注册插件：执行 install()，注入路由，注册 Store，添加导航项

  unregister(pluginId: string): void
  // 注销插件（调用 uninstall()，移除路由和 Store）

  get(pluginId: string): Plugin | undefined
  getAll(): Plugin[]
  isInstalled(pluginId: string): boolean
}
```

### 4.3 插件注册主入口

```typescript
// src/main.ts — 插件加载顺序即优先级

import { ProfilePlugin } from './plugins/profile'
import { TrackerPlugin } from './plugins/tracker'
import { BrowserPlugin } from './plugins/browser'
import { InboxPlugin } from './plugins/inbox'

// 注册顺序决定侧边栏显示顺序
await registry.register(ProfilePlugin, context)
await registry.register(TrackerPlugin, context)
await registry.register(BrowserPlugin, context)
await registry.register(InboxPlugin, context)
// 未来扩展只需在此处添加 register，无需修改现有代码
```

### 4.4 跨插件通信规范（EventBus）

插件间禁止直接 import 对方的 store，必须通过 EventBus 通信。

```typescript
// 事件命名规范：'{插件ID}:{动词}:{名词}'
// 示例：

// Inbox 插件解析到面试 → 通知 Tracker 更新卡片状态
eventBus.emit('tracker:update:card-status', {
  companyId: 'xxx',
  newStatus: 'interview',
  metadata: { interviewTime: '2025-03-15 14:00', location: '线上' }
})

// Tracker 插件需要当前档案信息 → 请求 Profile
eventBus.emit('profile:request:basic-info')
eventBus.on('profile:response:basic-info', (data) => { ... })
```

**全局事件目录（须在 `types.ts` 中统一定义，防止命名冲突）：**

| 事件名 | 发布方 | 订阅方 | 数据结构 |
|--------|--------|--------|---------|
| `tracker:update:card-status` | inbox | tracker | `{ companyId, newStatus, metadata }` |
| `tracker:create:card` | browser | tracker | `{ companyName, url, position }` |
| `inbox:notify:new-interview` | inbox | system | `{ companyName, time, location }` |
| `profile:request:fields` | browser | profile | `{ fieldKeys: string[] }` |
| `profile:response:fields` | profile | browser | `{ fields: ProfileField[] }` |
| `llm:request:analyze` | 任意 | llm-service | `{ prompt, context, callbackEvent }` |
| `llm:response:result` | llm-service | 任意 | `{ result, callbackEvent }` |

---

## 5. 数据库 Schema 设计

```sql
-- schema.sql
-- 所有表均使用 INTEGER PRIMARY KEY（SQLite 自增）

PRAGMA journal_mode = WAL;  -- 写入性能优化
PRAGMA foreign_keys = ON;

-- ============================================================
-- 模块 1：个人档案
-- ============================================================

-- 档案模板（支持多套）
CREATE TABLE IF NOT EXISTS profile_templates (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL DEFAULT '默认模板',
  is_default INTEGER NOT NULL DEFAULT 0,   -- 1 = 当前激活模板
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 基本信息（一个模板对应一条）
CREATE TABLE IF NOT EXISTS profile_basic (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id  INTEGER NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
  name         TEXT,    -- 姓名
  phone        TEXT,    -- 手机号
  email        TEXT,    -- 邮箱
  city         TEXT,    -- 所在城市
  github       TEXT,    -- GitHub 链接
  linkedin     TEXT,    -- LinkedIn 链接
  personal_site TEXT,   -- 个人网站
  wechat       TEXT,    -- 微信号
  gender       TEXT,    -- 性别（可选）
  birthday     TEXT,    -- 生日（可选）
  avatar_path  TEXT,    -- 头像本地路径（可选）
  summary      TEXT     -- 个人简介（Markdown）
);

-- 教育经历
CREATE TABLE IF NOT EXISTS profile_education (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id  INTEGER NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  school       TEXT NOT NULL,   -- 学校名称
  degree       TEXT,            -- 学位（本科/硕士/博士等）
  major        TEXT,            -- 专业
  gpa          TEXT,            -- GPA（可选，字符串以支持 3.8/4.0 格式）
  start_date   TEXT,            -- 开始时间（YYYY-MM）
  end_date     TEXT,            -- 结束时间（YYYY-MM 或 '至今'）
  description  TEXT             -- 补充描述（荣誉/课程等，Markdown）
);

-- 工作/实习经历
CREATE TABLE IF NOT EXISTS profile_experience (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id  INTEGER NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  type         TEXT NOT NULL DEFAULT 'internship', -- 'internship' | 'fulltime'
  company      TEXT NOT NULL,
  position     TEXT NOT NULL,
  start_date   TEXT,
  end_date     TEXT,
  description  TEXT   -- 工作描述（Markdown，支持项目符号）
);

-- 项目经历
CREATE TABLE IF NOT EXISTS profile_project (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id  INTEGER NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  name         TEXT NOT NULL,
  role         TEXT,            -- 担任角色
  tech_stack   TEXT,            -- 技术栈（逗号分隔）
  link         TEXT,            -- 项目链接
  start_date   TEXT,
  end_date     TEXT,
  description  TEXT             -- 项目描述（Markdown）
);

-- 技能
CREATE TABLE IF NOT EXISTS profile_skill (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id  INTEGER NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  category     TEXT NOT NULL,   -- 技能类别，如 '编程语言'、'框架'、'工具'
  items        TEXT NOT NULL    -- 技能项（逗号分隔）
);

-- 荣誉/证书
CREATE TABLE IF NOT EXISTS profile_award (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id  INTEGER NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  name         TEXT NOT NULL,
  issuer       TEXT,
  date         TEXT,
  description  TEXT
);

-- 简历附件（PDF）
CREATE TABLE IF NOT EXISTS profile_resume_files (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id  INTEGER REFERENCES profile_templates(id) ON DELETE SET NULL,
  file_name    TEXT NOT NULL,
  file_path    TEXT NOT NULL,   -- 应用数据目录下的相对路径
  is_primary   INTEGER NOT NULL DEFAULT 0,  -- 1 = 主简历
  uploaded_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 模块 2：账号密码管理（仅存元数据，密码存 Keychain）
-- ============================================================

CREATE TABLE IF NOT EXISTS browser_accounts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name   TEXT NOT NULL,
  login_url      TEXT NOT NULL,
  username       TEXT,
  keychain_key   TEXT NOT NULL UNIQUE, -- 对应 Keychain 中的 key，格式：nextoffer_{id}
  notes          TEXT,
  last_used_at   TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 模块 3：求职进度看板
-- ============================================================

-- 公司/投递卡片
CREATE TABLE IF NOT EXISTS tracker_cards (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name   TEXT NOT NULL,
  position       TEXT NOT NULL,          -- 投递岗位
  department     TEXT,                   -- 部门（可选）
  job_url        TEXT,                   -- 职位原始链接
  status         TEXT NOT NULL DEFAULT 'wishlist',
  -- status 枚举：'wishlist' | 'applied' | 'test' | 'interview' | 'offer' | 'rejected' | 'archived'
  priority       INTEGER NOT NULL DEFAULT 1, -- 1=普通 2=重点 3=梦校
  source         TEXT,                   -- 信息来源（Boss/牛客/官网/邮件等）
  salary_range   TEXT,                   -- 薪资区间（字符串，如 '20k-30k'）
  location       TEXT,                   -- 工作地点
  jd_text        TEXT,                   -- 职位描述备份（纯文本）
  notes          TEXT,                   -- 面试复盘笔记（Markdown）
  applied_at     TEXT,                   -- 投递时间
  interview_at   TEXT,                   -- 最近一次面试时间
  offer_deadline TEXT,                   -- Offer 截止日期
  is_starred     INTEGER NOT NULL DEFAULT 0,
  account_id     INTEGER REFERENCES browser_accounts(id) ON DELETE SET NULL,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 卡片操作时间线
CREATE TABLE IF NOT EXISTS tracker_timeline (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id     INTEGER NOT NULL REFERENCES tracker_cards(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  -- event_type 枚举：'created'|'status_changed'|'note_updated'|
  --                  'interview_scheduled'|'email_parsed'|'reminder_sent'|'manual_edit'
  from_status TEXT,
  to_status   TEXT,
  description TEXT,          -- 事件描述
  triggered_by TEXT NOT NULL DEFAULT 'user', -- 'user' | 'system' | 'email_parser'
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 面试轮次记录
CREATE TABLE IF NOT EXISTS tracker_interviews (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id      INTEGER NOT NULL REFERENCES tracker_cards(id) ON DELETE CASCADE,
  round        INTEGER NOT NULL DEFAULT 1,  -- 第几轮
  type         TEXT,     -- '电话' | '视频' | '现场' | '笔试' | 'HR终面'
  scheduled_at TEXT,     -- 面试时间
  location     TEXT,     -- 地点或视频链接
  interviewer  TEXT,     -- 面试官（可选）
  result       TEXT,     -- 'passed' | 'failed' | 'pending'
  notes        TEXT,     -- 面试复盘
  source       TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'email_parser'
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 模块 4：邮件解析
-- ============================================================

-- 绑定的邮箱账号
CREATE TABLE IF NOT EXISTS inbox_accounts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL UNIQUE,
  provider        TEXT NOT NULL,  -- 'qq' | 'netease' | 'gmail' | 'outlook' | 'custom'
  imap_host       TEXT NOT NULL,
  imap_port       INTEGER NOT NULL DEFAULT 993,
  use_ssl         INTEGER NOT NULL DEFAULT 1,
  keychain_key    TEXT NOT NULL UNIQUE,  -- IMAP 密码/授权码存 Keychain
  sync_interval   INTEGER NOT NULL DEFAULT 300,  -- 轮询间隔（秒）
  last_synced_at  TEXT,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 已解析邮件记录（防止重复处理）
CREATE TABLE IF NOT EXISTS inbox_parsed_emails (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id       INTEGER NOT NULL REFERENCES inbox_accounts(id) ON DELETE CASCADE,
  message_id       TEXT NOT NULL,    -- 邮件 Message-ID 头字段
  subject          TEXT,
  sender           TEXT,
  received_at      TEXT,
  is_job_related   INTEGER NOT NULL DEFAULT 0,
  parsed_type      TEXT,
  -- parsed_type 枚举：'interview_invite' | 'offer' | 'rejection' | 'test' | 'unknown'
  extracted_data   TEXT,   -- JSON 字符串，存储提取的结构化信息
  linked_card_id   INTEGER REFERENCES tracker_cards(id) ON DELETE SET NULL,
  parse_method     TEXT NOT NULL DEFAULT 'regex',  -- 'regex' | 'llm'
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(account_id, message_id)
);

-- ============================================================
-- 模块 5：LLM 配置
-- ============================================================

CREATE TABLE IF NOT EXISTS llm_configs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  provider     TEXT NOT NULL,   -- 'openai' | 'deepseek' | 'zhipu' | 'custom'
  name         TEXT NOT NULL,   -- 用户自定义名称
  base_url     TEXT,            -- 自定义 API Base URL（兼容 OpenAI 格式）
  model        TEXT NOT NULL,   -- 模型名称，如 'deepseek-chat'
  keychain_key TEXT NOT NULL UNIQUE,  -- API Key 存 Keychain
  is_default   INTEGER NOT NULL DEFAULT 0,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 全局设置
-- ============================================================

CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 默认设置种子数据
INSERT OR IGNORE INTO app_settings (key, value) VALUES
  ('theme', 'light'),                    -- 'light' | 'dark' | 'system'
  ('language', 'zh-CN'),
  ('reminder_before_interview_1d', '1'), -- 提前1天提醒
  ('reminder_before_interview_1h', '1'), -- 提前1小时提醒
  ('auto_status_update_after_interview', '1'),
  ('data_dir', ''),                      -- 用户自定义数据目录（空=默认）
  ('last_backup_at', '');
```

---

## 6. 模块 0：应用核心 & 全局服务

### 6.1 主布局（MainLayout.vue）

```
┌──────────────────────────────────────────────────────┐
│  NextOffer                              🔍  🌓  设置  │  ← 顶部栏
├─────────┬────────────────────────────────────────────┤
│         │                                            │
│  📋 档案 │                                            │
│  🖥️ 浏览 │              内容区域（路由视图）             │
│  📊 看板 │                                            │
│  📧 邮件 │                                            │
│         │                                            │
│  [扩展] │                                            │
│         │                                            │
│  ⚙️ 设置 │                                            │
└─────────┴────────────────────────────────────────────┘
```

- 左侧导航栏由 PluginRegistry 动态渲染，按 `meta.order` 排序
- 导航项支持角标（badge），由插件通过响应式计算属性提供
- 支持收折侧边栏（仅显示图标）

### 6.2 全局搜索（GlobalSearch）

- 快捷键：`Cmd/Ctrl + K` 唤起搜索框
- 搜索范围：公司名称、岗位名称、备注内容
- 搜索结果分类展示（看板卡片 / 档案字段），点击直接跳转
- 实现：SQLite 全文检索（FTS5 虚拟表）

```sql
-- 为看板卡片创建 FTS 索引
CREATE VIRTUAL TABLE IF NOT EXISTS tracker_cards_fts
USING fts5(company_name, position, notes, jd_text, content='tracker_cards', content_rowid='id');
```

### 6.3 数据备份与恢复

- 位置：设置页 → 数据管理
- **导出：** 将 SQLite 文件 + PDF 附件打包为 `.nextoffer` 归档文件（本质是 ZIP），用户选择保存路径
- **恢复：** 解包 `.nextoffer` 文件，覆盖当前数据目录（操作前自动创建临时备份）
- **注意：** Keychain 数据（密码/API Key）不包含在备份文件中，恢复后需用户重新输入
- 备份操作通过 Tauri Command 在主进程执行，前端仅触发

### 6.4 主题与国际化

- 主题：支持亮色 / 暗色 / 跟随系统，通过 Naive UI `n-config-provider` 全局控制
- 国际化：预留 vue-i18n 支持，MVP 阶段只实现中文，i18n key 规范从一开始遵守

### 6.5 全局求职目标设置

- 位置：设置页 → 求职目标
- 字段：目标岗位类型、目标城市（多选）、期望薪资范围、求职截止日期
- 在看板页顶部以进度条展示："已获 Offer 0 个 / 目标 3 个"

---

## 7. 模块 1：个人档案与简历中心

### 7.1 插件元数据

```typescript
// src/plugins/profile/index.ts
export const ProfilePlugin: Plugin = {
  meta: {
    id: 'profile',
    name: '个人档案',
    version: '1.0.0',
    icon: 'person-outline',
    order: 1,
  },
  // ...
}
```

### 7.2 页面结构

```
/profile
  ├── /profile/basic          # 基本信息
  ├── /profile/education      # 教育经历
  ├── /profile/experience     # 工作/实习经历
  ├── /profile/project        # 项目经历
  ├── /profile/skill          # 技能
  ├── /profile/award          # 荣誉/证书
  ├── /profile/resume-files   # 简历附件管理
  └── /profile/templates      # 模板管理
```

主页面采用左侧分类 Tab + 右侧内容区的布局。

### 7.3 功能规格

#### 7.3.1 结构化档案填写

- 所有档案分类（教育/经历/项目/技能/荣誉）均支持：多条记录、拖拽排序、单条编辑/删除
- 表单采用弹窗（Modal）方式编辑，关闭即保存到 SQLite
- 描述性文本字段支持 Markdown 输入，实时预览
- 表单字段级别的字数统计（尤其是简历描述）

#### 7.3.2 多套模板管理

- 支持创建多套档案模板（如"技术岗模板"、"产品岗模板"）
- 模板之间数据隔离
- 顶部下拉切换当前激活模板，切换后所有档案视图刷新
- 模板支持复制（克隆当前模板所有数据创建新模板）
- 模板支持删除（非最后一个模板时可删除）

#### 7.3.3 简历 PDF 上传与预览

- 支持上传多个 PDF 简历文件
- 文件存储路径：`{app_data_dir}/resumes/{uuid}.pdf`，SQLite 记录元数据和相对路径
- 支持设置一个"主简历"（在档案侧边栏中优先展示下载链接）
- PDF 使用 `pdfjs-dist` 在应用内预览，支持缩放和翻页
- 支持删除（同步删除本地文件）
- **MVP 注：** 从结构化数据生成 PDF 简历功能预留接口但 MVP 阶段不实现

```typescript
// 预留扩展接口（MVP 阶段为空实现）
interface ResumeGeneratorPlugin {
  generate(templateId: number, profileData: ProfileData): Promise<Blob>
}
```

#### 7.3.4 档案字段复制辅助（供侧边栏使用）

- 提供 `ProfileService.getFieldsForSidebar(templateId)` 方法
- 返回结构化字段列表，每个字段包含：`label`（显示名）、`value`（内容）、`category`（分类）
- 该方法供浏览器插件的档案侧边栏调用

```typescript
interface ProfileField {
  id: string          // 唯一 key，如 'basic.name', 'basic.phone'
  label: string       // 显示名，如 '姓名', '手机号'
  value: string       // 字段值
  category: string    // 分类，如 '基本信息', '教育经历'
  multiline: boolean  // 是否多行内容（影响侧边栏显示方式）
}
```

### 7.4 Tauri Command 接口

```rust
// profile.rs — 须实现以下 Command

#[tauri::command] get_profile_templates() -> Vec<ProfileTemplate>
#[tauri::command] create_profile_template(name: String) -> ProfileTemplate
#[tauri::command] set_default_template(id: i64) -> bool
#[tauri::command] clone_template(id: i64) -> ProfileTemplate
#[tauri::command] delete_template(id: i64) -> bool

#[tauri::command] get_basic_info(template_id: i64) -> Option<BasicInfo>
#[tauri::command] save_basic_info(template_id: i64, data: BasicInfo) -> bool

// education / experience / project / skill / award 均实现以下 4 个：
#[tauri::command] get_{section}(template_id: i64) -> Vec<{SectionItem}>
#[tauri::command] save_{section}_item(template_id: i64, item: {SectionItem}) -> i64
#[tauri::command] delete_{section}_item(id: i64) -> bool
#[tauri::command] reorder_{section}(ids: Vec<i64>) -> bool

// 简历文件
#[tauri::command] upload_resume_file(template_id: i64, src_path: String, file_name: String) -> ResumeFile
#[tauri::command] get_resume_files(template_id: i64) -> Vec<ResumeFile>
#[tauri::command] set_primary_resume(id: i64) -> bool
#[tauri::command] delete_resume_file(id: i64) -> bool

// 侧边栏专用
#[tauri::command] get_profile_fields_for_sidebar(template_id: i64) -> Vec<ProfileField>
```

---

## 8. 模块 2：内置浏览器与档案侧边栏

### 8.1 插件元数据

```typescript
export const BrowserPlugin: Plugin = {
  meta: {
    id: 'browser',
    name: '投递浏览器',
    icon: 'globe-outline',
    order: 2,
    version: '1.0.0',
  }
}
```

### 8.2 页面布局

```
/browser
  ├── /browser/home      # 账号列表 + 快速入口
  └── /browser/view      # 内置浏览器 + 档案侧边栏
```

```
┌──────────────────────────────────────────────────────────┐
│  ← → ↻  🔒 https://campus.example.com/apply    ⊞ 侧边栏  │  ← 导航栏
├──────────────────────────────────────┬───────────────────┤
│                                      │ 📋 档案侧边栏      │
│                                      │ ─────────────────  │
│         Webview                      │ 🔍 搜索字段...     │
│     （加载目标网页）                  │ ─────────────────  │
│                                      │ ▼ 基本信息         │
│                                      │  姓名    李明 [复制]│
│                                      │  手机  138xxxx [复制]│
│                                      │  邮箱  xx@xx  [复制]│
│                                      │ ▼ 教育经历         │
│                                      │  学校  XX大学 [复制]│
│                                      │  ...              │
└──────────────────────────────────────┴───────────────────┘
```

### 8.3 功能规格

#### 8.3.1 账号管理页（/browser/home）

- 展示所有已添加的公司账号卡片（公司名、登录链接、上次使用时间）
- 操作：添加账号、编辑、删除、直接打开（跳转到内置浏览器）
- 添加/编辑弹窗字段：公司名称、登录 URL、用户名/邮箱、密码
- 密码通过 Tauri Command 存入系统 Keychain，界面显示时以 `••••••` 脱敏
- 支持未存账号的快速访问：地址栏直接输入 URL

#### 8.3.2 内置浏览器（Webview）

- 使用 Tauri 的 `WebviewWindow` 或组件内 `webview` 实现
- 浏览器导航栏：后退、前进、刷新、当前 URL 显示（可点击编辑跳转）、开关侧边栏按钮
- 支持基础的网页加载进度条
- **安全限制：** 禁止在 Webview 内注入脚本（与"Magic Fill 自动填充"方案不同，本产品采用手动复制粘贴方式，不做 DOM 注入，以规避兼容性和安全风险）
- **自动登录：** 在账号详情中配置登录脚本（可选，高级功能，MVP 预留接口但不实现）

#### 8.3.3 档案侧边栏（Profile Sidebar）

**这是 Magic Fill 的核心实现方式。** 侧边栏独立于 Webview 渲染，不依赖目标网页结构。

- 侧边栏宽度：固定 280px，可通过按钮收折
- 顶部：模板切换下拉选择器（切换后字段实时刷新）
- 搜索框：实时过滤字段（输入"手机"即只显示手机号字段）
- 字段按分类折叠展示（基本信息 / 教育经历 / 工作经历 / 项目 / 技能 / 荣誉）
- **每个字段：**
  - 左侧：字段 Label（如"手机号"）
  - 右侧：字段值截断显示（超过 20 字符省略号）
  - 悬浮 / 点击"复制"按钮：调用 `navigator.clipboard.writeText()` 写入剪贴板
  - 复制成功：显示绿色"✓ 已复制"提示（1.5s 后恢复）
- **多行内容字段**（如简历描述、项目经历）：
  - 显示折叠态，点击展开完整内容
  - 提供"复制全部"和按段落复制两种模式
- 侧边栏底部：快速访问当前激活模板的 PDF 简历（显示文件名，点击在应用内打开预览）

#### 8.3.4 看板快速记录

- 浏览器导航栏右侧提供"添加到看板"按钮
- 点击后弹出快速填写弹窗：公司名称（自动从页面 `<title>` 提取）、岗位名称、状态（默认"已投递"）
- 确认后通过 EventBus 触发 `tracker:create:card`，在看板插件中创建卡片
- 创建成功后显示 Toast 提示，点击可直接跳转到该卡片

### 8.4 Tauri Command 接口

```rust
// browser.rs

#[tauri::command] get_browser_accounts() -> Vec<BrowserAccount>
#[tauri::command] save_browser_account(data: BrowserAccountInput) -> BrowserAccount
// 注：密码通过 keychain_key 存入 Keychain，data 中 password 字段只用于写入，不返回

#[tauri::command] delete_browser_account(id: i64) -> bool
#[tauri::command] get_account_password(id: i64) -> String  // 从 Keychain 取出，仅用于自动填充
#[tauri::command] update_account_last_used(id: i64) -> bool
```

---

## 9. 模块 3：求职进度看板

### 9.1 插件元数据

```typescript
export const TrackerPlugin: Plugin = {
  meta: {
    id: 'tracker',
    name: '求职看板',
    icon: 'grid-outline',
    order: 3,
    version: '1.0.0',
  }
}
```

### 9.2 页面结构

```
/tracker
  ├── /tracker/kanban     # 主看板（Kanban 视图）
  ├── /tracker/list       # 列表视图（同数据，表格展示）
  ├── /tracker/stats      # 数据统计
  └── /tracker/card/:id   # 公司详情页
```

### 9.3 功能规格

#### 9.3.1 Kanban 主看板

**列定义（status 枚举对应的列）：**

| 列名 | status 值 | 说明 |
|------|-----------|------|
| 收藏/待投递 | `wishlist` | 感兴趣但未投递 |
| 已投递 | `applied` | 已提交申请 |
| 笔试/测评 | `test` | 收到笔试/在线测评通知 |
| 面试中 | `interview` | 进入面试阶段 |
| Offer | `offer` | 已获得 Offer |
| 已拒绝 | `rejected` | 被拒绝或已挂科 |
| 已归档 | `archived` | 主动放弃或结束 |

- 每列显示卡片数量角标
- 支持拖拽卡片到其他列（使用 `vue-draggable-plus`），拖拽完成自动更新 status 并记录时间线
- 列可折叠（点击列标题，只显示列标题和卡片数量）
- 顶部过滤栏：按优先级、来源、城市、时间范围过滤
- 顶部操作：新建卡片、切换视图（看板/列表）、进入统计

**卡片展示信息：**
- 公司名称（加粗）
- 岗位名称
- 优先级标识（🌟 = 重点，⭐ = 梦校）
- 投递时间（相对时间，如"3天前"）
- 最近面试时间（若有）
- 来源 Tag（Boss / 牛客 / 官网等）
- 操作菜单（···）：编辑 / 删除 / 移至回收站

#### 9.3.2 公司详情卡片页（/tracker/card/:id）

详情页采用抽屉（Drawer）或全页面方式呈现，包含以下 Tab：

**概览 Tab：**
- 完整编辑公司卡片所有字段
- 职位描述（JD 备份）完整展示

**时间线 Tab：**
- 倒序展示该卡片的所有操作记录（`tracker_timeline`）
- 区分"系统自动"（灰色）和"用户操作"（蓝色）事件
- 允许用户手动添加备注事件

**面试记录 Tab：**
- 列表展示所有面试轮次
- 可手动添加面试轮次（类型、时间、地点、结果）
- 邮件解析到的面试会自动出现在此列表中
- 每轮面试可填写复盘笔记（Markdown 编辑器）

**笔记 Tab：**
- 完整的 Markdown 编辑器（用于记录综合复盘、薪资谈判准备等）
- 支持实时预览

#### 9.3.3 列表视图

- 与 Kanban 数据同源，以表格形式展示
- 表格列：公司名 / 岗位 / 状态 / 优先级 / 投递时间 / 面试时间 / 操作
- 支持按列排序
- 支持批量操作：批量修改状态、批量删除

#### 9.3.4 数据统计（/tracker/stats）

- **投递漏斗图**（ECharts 漏斗图）：各状态数量，展示转化率
- **投递时间趋势**（ECharts 折线图）：近 30/60/90 天每日投递数量
- **来源分布**（ECharts 饼图）：各招聘平台占比
- **城市分布**（横向柱状图）：各目标城市投递数量
- 统计卡片：总投递数 / 面试邀请数 / Offer 数 / 面试通过率

#### 9.3.5 面试状态自动流转（系统级）

后台定时任务（Tauri 侧每 30 分钟检查一次）：
- 扫描所有 status = `interview` 的卡片
- 若最近一次 `tracker_interviews.scheduled_at` 已超过当前时间 2 小时
- 自动在 `tracker_timeline` 记录"面试已结束，等待结果"事件
- 发送桌面通知："📋 您在 [公司名] 的面试已结束，记得更新进度！"
- **不自动修改 status**（避免误操作），由用户手动确认

### 9.4 Tauri Command 接口

```rust
// tracker.rs

#[tauri::command] get_all_cards(filter: CardFilter) -> Vec<TrackerCard>
#[tauri::command] get_card_by_id(id: i64) -> Option<TrackerCard>
#[tauri::command] create_card(data: CreateCardInput) -> TrackerCard
#[tauri::command] update_card(id: i64, data: UpdateCardInput) -> TrackerCard
#[tauri::command] delete_card(id: i64) -> bool
#[tauri::command] update_card_status(id: i64, new_status: String, triggered_by: String) -> bool

#[tauri::command] get_timeline(card_id: i64) -> Vec<TimelineEvent>
#[tauri::command] add_timeline_event(card_id: i64, event: TimelineEventInput) -> TimelineEvent

#[tauri::command] get_interviews(card_id: i64) -> Vec<InterviewRecord>
#[tauri::command] save_interview(card_id: i64, data: InterviewInput) -> InterviewRecord
#[tauri::command] delete_interview(id: i64) -> bool

#[tauri::command] get_stats() -> TrackerStats
// TrackerStats: { total, by_status: HashMap<String,i64>, by_source, by_city, daily_trend: Vec<DailyCount> }

#[tauri::command] search_cards(query: String) -> Vec<TrackerCard>  // FTS 全文搜索
```

---

## 10. 模块 4：邮件智能解析

### 10.1 插件元数据

```typescript
export const InboxPlugin: Plugin = {
  meta: {
    id: 'inbox',
    name: '邮件中心',
    icon: 'mail-outline',
    order: 4,
    version: '1.0.0',
  },
  navItems: [{
    label: '邮件中心',
    icon: 'mail-outline',
    routeName: 'inbox',
    badge: () => unreadCount.value || null   // 未读求职邮件数角标
  }]
}
```

### 10.2 页面结构

```
/inbox
  ├── /inbox/accounts      # 邮箱账号管理
  ├── /inbox/emails        # 已解析邮件列表
  └── /inbox/settings      # 解析规则与 LLM 配置入口
```

### 10.3 功能规格

#### 10.3.1 邮箱绑定

支持的邮件服务商（预设 IMAP 配置）：

| 服务商 | IMAP 地址 | 端口 | 说明 |
|--------|-----------|------|------|
| QQ 邮箱 | imap.qq.com | 993 | 需开启 IMAP 并获取授权码 |
| 网易邮箱 163 | imap.163.com | 993 | 需开启 IMAP |
| Gmail | imap.gmail.com | 993 | 需开启 IMAP 或使用应用专用密码 |
| Outlook | outlook.office365.com | 993 | 需开启 IMAP |
| 自定义 | 用户填写 | 用户填写 | 兼容任意标准 IMAP 服务 |

- 添加账号时，UI 提供各服务商授权码/密码获取教程链接
- 密码/授权码存入 Keychain
- 绑定成功后立即执行一次全量同步（拉取最近 30 天邮件）
- 支持绑定多个邮箱

#### 10.3.2 邮件拉取与解析流程

```
定时触发（每 N 分钟）
       ↓
IMAP 连接 → 拉取未读邮件（收件箱 UNSEEN）
       ↓
去重检查（message_id 是否已处理）
       ↓
第一轮过滤（关键词初筛）
  → 包含关键词（面试/笔试/邀请/录用/遗憾等）→ 进入解析
  → 不含关键词 → 标记为 is_job_related=0，跳过
       ↓
解析引擎（规则引擎 优先，LLM 降级或并行）
       ↓
提取结构化数据 → 写入 inbox_parsed_emails
       ↓
匹配看板卡片（按公司名模糊匹配）
  → 匹配成功 → 更新卡片状态 + 创建时间线事件 + 创建面试记录
  → 匹配失败 → 在 UI 中高亮提示"发现新求职邮件，需要手动关联"
       ↓
触发桌面通知 + 更新侧边栏角标
```

#### 10.3.3 规则引擎（Regex Parser）

规则引擎在 Rust 端实现（`imap/parser.rs`），规则配置以 JSON 格式存储，支持用户在 UI 中查看/扩展规则。

**邮件类型识别规则（按优先级）：**

```json
{
  "rules": [
    {
      "type": "interview_invite",
      "priority": 1,
      "subject_patterns": ["面试邀请", "邀请您参加面试", "interview invitation", "面试通知"],
      "body_patterns": ["面试时间", "面试地点", "请确认您的面试时间"],
      "extract": {
        "company": ["来自(.+?)的面试", "(.+?)诚邀您"],
        "datetime": ["(\\d{4}年\\d{1,2}月\\d{1,2}日.{0,20}\\d{1,2}[:：]\\d{2})", "(\\d{4}-\\d{2}-\\d{2}.{0,10}\\d{2}:\\d{2})"],
        "location": ["面试地点[：:].{0,50}", "地址[：:].{0,80}", "腾讯会议|zoom|钉钉|飞书"],
        "link": ["(https?://[^\\s<>\"]+(?:zoom|meeting|tencent)[^\\s<>\"]+)"]
      }
    },
    {
      "type": "test",
      "subject_patterns": ["笔试通知", "测评邀请", "在线测试", "编程测试"],
      "extract": { "datetime": ["..."], "link": ["..."] }
    },
    {
      "type": "offer",
      "subject_patterns": ["Offer Letter", "录用通知", "录取通知", "恭喜您通过"],
      "extract": {}
    },
    {
      "type": "rejection",
      "subject_patterns": ["很遗憾", "未能通过", "感谢您的申请", "投递未通过"],
      "extract": {}
    }
  ]
}
```

#### 10.3.4 LLM 解析模式（可选）

- 在邮件解析设置中，用户可选择"仅规则引擎"或"规则引擎 + LLM 增强"
- LLM 增强模式：规则引擎解析失败（置信度低）时，调用 LLM Service
- Prompt 模板（固定，不让用户修改）：

```
你是一个求职邮件解析助手。请从以下邮件中提取求职相关信息，
只返回 JSON 格式，不要有任何解释。

邮件主题：{subject}
发件人：{sender}
邮件内容：{body_text}

请返回以下格式（未能确定的字段返回 null）：
{
  "is_job_related": true/false,
  "type": "interview_invite|test|offer|rejection|unknown",
  "company": "公司名称",
  "position": "岗位名称（若有）",
  "interview_time": "ISO8601格式时间字符串（若有）",
  "interview_location": "地点或链接（若有）",
  "deadline": "截止时间（若有）",
  "summary": "一句话摘要"
}
```

#### 10.3.5 解析结果 UI

- `/inbox/emails` 页面：列表展示所有被标记为求职相关的邮件
- 每条记录：类型图标 + 公司名 + 解析摘要 + 时间 + 关联卡片状态
- 支持手动修正解析结果（点击编辑，修改提取的时间/地点等）
- 支持手动关联到看板卡片（未自动匹配时，搜索并选择对应卡片）
- 未关联的邮件以黄色高亮显示，引导用户处理

#### 10.3.6 日程提醒

- 提醒触发：在 `tracker_interviews.scheduled_at` 的 **前 24 小时**和**前 1 小时**
- 通过 Tauri 的 `tauri-plugin-notification` 发送系统桌面通知
- 通知内容：「📅 明天 14:00 | XX公司 后端开发 面试提醒」
- 点击通知可直接打开该公司的看板详情页
- 用户可在设置中关闭具体的提醒时间点

### 10.4 Tauri Command 接口

```rust
// inbox.rs

#[tauri::command] get_inbox_accounts() -> Vec<InboxAccount>
#[tauri::command] add_inbox_account(data: InboxAccountInput) -> Result<InboxAccount, String>
// 含 IMAP 连接测试
#[tauri::command] delete_inbox_account(id: i64) -> bool
#[tauri::command] sync_inbox(account_id: i64) -> SyncResult
// SyncResult: { fetched: i64, new_job_emails: i64, updated_cards: i64 }
#[tauri::command] get_parsed_emails(filter: EmailFilter) -> Vec<ParsedEmail>
#[tauri::command] update_parsed_email(id: i64, data: ParsedEmailUpdate) -> ParsedEmail
#[tauri::command] link_email_to_card(email_id: i64, card_id: i64) -> bool
#[tauri::command] get_parse_rules() -> ParseRules  // 返回规则引擎 JSON
```

---

## 11. 模块 5：LLM 通用组件

### 11.1 设计目标

LLM Service 是一个**全局单例服务**，以依赖注入方式提供给所有插件使用（通过 `PluginContext.llmService`）。所有插件不直接调用外部 API，而是通过统一接口调用 LLM Service，便于统一管理 Token 使用、错误处理和降级策略。

### 11.2 接口设计

```typescript
// src/core/llm-service/types.ts

interface LLMProvider {
  id: string           // 'openai' | 'deepseek' | 'zhipu' | 'custom'
  name: string
  baseUrl: string
  defaultModel: string
  supportedModels: string[]
}

interface LLMConfig {
  providerId: string
  model: string
  apiKey: string       // 运行时从 Keychain 读取，不持久化在 Store 中
  baseUrl?: string     // custom provider 的自定义地址
  temperature?: number
  maxTokens?: number
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LLMRequest {
  messages: LLMMessage[]
  config?: Partial<LLMConfig>   // 不传则使用全局默认配置
  stream?: boolean
}

interface LLMResponse {
  content: string
  usage?: { prompt_tokens: number; completion_tokens: number }
  provider: string
  model: string
}

interface LLMService {
  // 核心调用
  chat(request: LLMRequest): Promise<LLMResponse>
  chatStream(request: LLMRequest, onChunk: (chunk: string) => void): Promise<void>

  // 配置管理
  getConfigs(): Promise<LLMConfig[]>
  getDefaultConfig(): Promise<LLMConfig | null>
  setDefaultConfig(configId: number): Promise<void>

  // 连通性测试
  testConnection(config: Partial<LLMConfig>): Promise<{ success: boolean; latency: number }>

  // 是否可用（有有效配置且不为空）
  isAvailable(): boolean
}
```

### 11.3 预设 Provider 列表

```typescript
const PRESET_PROVIDERS: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    supportedModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    supportedModels: ['deepseek-chat', 'deepseek-coder'],
  },
  {
    id: 'zhipu',
    name: '智谱 AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    supportedModels: ['glm-4', 'glm-4-flash', 'glm-3-turbo'],
  },
  {
    id: 'custom',
    name: '自定义（兼容 OpenAI 格式）',
    baseUrl: '',  // 用户填写
    defaultModel: '',
    supportedModels: [],
  }
]
```

### 11.4 LLM 设置 UI

- 位置：设置页 → AI 设置（全局，所有插件共享）
- 支持添加多个配置，设置一个默认
- 每个配置：Provider 选择（下拉）→ API Key 输入（加密存储）→ 模型选择 → 测试连接
- 自定义 Provider：额外显示 Base URL 输入框
- Token 用量展示（从 LLMResponse.usage 累积，存入 app_settings）

---

## 12. MVP 范围界定与开发阶段规划

### 12.1 MVP 范围（v1.0）

| 功能 | 状态 | 优先级 |
|------|------|--------|
| 应用基础框架（Tauri + Vue 3 + 插件系统） | ✅ MVP | P0 |
| SQLite 初始化与 Schema 迁移机制 | ✅ MVP | P0 |
| 全局布局、主题切换、全局搜索 | ✅ MVP | P0 |
| **模块 1：** 结构化档案填写（基本/教育/经历/项目/技能） | ✅ MVP | P0 |
| **模块 1：** 多套模板管理 | ✅ MVP | P1 |
| **模块 1：** PDF 简历上传与预览 | ✅ MVP | P1 |
| **模块 1：** 从结构化数据生成 PDF 简历 | ❌ v2 | - |
| **模块 2：** 账号密码管理（Keychain 加密） | ✅ MVP | P0 |
| **模块 2：** 内置 Webview 浏览器 | ✅ MVP | P0 |
| **模块 2：** 档案侧边栏（字段复制） | ✅ MVP | P0 |
| **模块 2：** 自动登录脚本 | ❌ v2 | - |
| **模块 2：** JD 一键抓取 + 关键词匹配 | ❌ v2 | - |
| **模块 3：** Kanban 看板（拖拽 + 状态流转） | ✅ MVP | P0 |
| **模块 3：** 公司详情（时间线 + 面试记录 + 笔记） | ✅ MVP | P0 |
| **模块 3：** 列表视图 | ✅ MVP | P1 |
| **模块 3：** 数据统计图表 | ✅ MVP | P1 |
| **模块 3：** 面试后自动状态流转 | ✅ MVP | P1 |
| **模块 4：** IMAP 邮箱绑定 | ✅ MVP | P0 |
| **模块 4：** 邮件拉取与规则引擎解析 | ✅ MVP | P0 |
| **模块 4：** 自动关联看板卡片 | ✅ MVP | P0 |
| **模块 4：** 桌面提醒 | ✅ MVP | P1 |
| **模块 5：** LLM 通用组件（多 Provider） | ✅ MVP | P1 |
| **模块 5：** LLM 辅助邮件解析 | ✅ MVP | P1 |
| 数据备份与恢复 | ✅ MVP | P1 |
| 求职目标设置 | ✅ MVP | P2 |

### 12.2 开发阶段规划

**Phase 1 — 核心基础框架（预计 3-5 天）**
- 搭建 Tauri 2.x + Vue 3 + TypeScript 项目骨架
- 实现插件系统（PluginRegistry + EventBus）
- 初始化 SQLite，执行 schema.sql，搭建 migration 机制
- 实现主布局（MainLayout）、主题切换、路由框架
- 实现 Pinia Store 基础结构

**Phase 2 — 个人档案模块（预计 4-6 天）**
- 实现全部 profile Tauri Commands（Rust 端）
- 实现档案填写 UI（各分类表单 + 拖拽排序）
- 实现多模板管理
- 实现 PDF 上传和预览
- 实现 ProfilePlugin 完整注册

**Phase 3 — 内置浏览器与侧边栏（预计 4-6 天）**
- 实现账号管理 UI + Keychain 存储
- 集成 Tauri Webview
- 实现档案侧边栏（字段渲染 + 一键复制）
- 实现"添加到看板"快速记录
- 实现 BrowserPlugin 完整注册

**Phase 4 — 求职看板（预计 5-7 天）**
- 实现 Kanban UI（vue-draggable-plus）
- 实现公司详情页（时间线 + 面试记录 + Markdown 笔记）
- 实现列表视图和数据统计
- 实现面试状态自动流转（后台定时任务）
- 实现 TrackerPlugin 完整注册

**Phase 5 — 邮件解析（预计 5-7 天）**
- 实现 Rust 端 IMAP 连接与邮件拉取
- 实现规则引擎解析器
- 实现解析结果 UI 与手动关联
- 实现桌面通知
- 实现 InboxPlugin 完整注册

**Phase 6 — LLM 组件 + 收尾（预计 3-4 天）**
- 实现 LLM Service（多 Provider 适配器）
- 实现 LLM 设置 UI
- 接入邮件 LLM 解析模式
- 实现全局搜索（FTS5）
- 实现数据备份与恢复
- 整体联调与 Bug 修复

---

## 13. 非功能性需求

### 13.1 性能要求

- 应用冷启动时间 < 3 秒
- 看板拖拽操作响应 < 100ms
- SQLite 查询（看板全量） < 200ms（假设 500 张卡片）
- PDF 预览首页渲染 < 2 秒
- IMAP 同步在后台执行，不阻塞 UI 线程

### 13.2 安全要求

- 密码、API Key、IMAP 授权码均**必须**通过 `tauri-plugin-keychain` 存入系统 Keychain，**禁止**以任何形式写入 SQLite 或本地文件
- 应用启动时校验数据目录权限
- Webview 禁止远程代码执行，`Content-Security-Policy` 严格配置
- 备份文件不含 Keychain 数据，恢复时明确提示用户

### 13.3 兼容性要求

- 支持平台：macOS 12+、Windows 10+、Linux（Ubuntu 20.04+）
- 分辨率：最低 1280×720，响应式适配至 2560×1440

### 13.4 应用体积要求

- 安装包体积 < 30MB（Tauri 目标）
- 运行时内存占用 < 200MB（空载状态）

---

## 14. 预留扩展点索引

以下功能在架构层面已预留接口，未来可通过实现对应插件直接扩展，无需修改现有代码：

| 扩展功能 | 目录占位 | 所需接口 |
|---------|---------|---------|
| AI 简历优化 | `plugins/_extensions/ai-resume/` | `LLMService.chat()` + `ProfilePlugin.getFieldsForSidebar()` |
| 从结构化数据生成 PDF 简历 | 已在 `profile` 插件中预留 `ResumeGeneratorPlugin` 接口 | `profile_basic / education / experience...` 等全部表 |
| JD 抓取 + 关键词匹配 | `plugins/browser/` 内预留入口按钮（灰色禁用状态） | Webview DOM 访问 + `LLMService` |
| 数据云同步 | `plugins/_extensions/cloud-sync/` | 备份/恢复相同的数据格式（`.nextoffer` ZIP） |
| 日历导出（iCal） | `plugins/_extensions/calendar-export/` | `tracker_interviews` 表 |
| 八股文背诵 | `plugins/_extensions/interview-prep/` | 独立数据表，通过 `PluginRegistry` 注入新路由 |
| 自动登录脚本 | `plugins/browser/` 内已预留 `account.login_script` 字段 | Webview JS 注入（Tauri `eval` API） |
| 多语言国际化 | `vue-i18n` 已在框架层初始化，i18n key 规范从 MVP 遵守 | 只需添加语言包文件 |
| 数据统计增强 | 新插件订阅 `tracker:stats:request` 事件 | `TrackerStats` 数据结构扩展 |

---

*文档版本：1.0.0 | 适用于 AI 辅助自动化开发 | 请确保 AI 开发时严格遵守插件间 EventBus 通信规范，禁止跨插件直接 import*
