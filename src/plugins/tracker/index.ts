/**
 * Tracker 插件注册入口（占位）。
 *
 * 职责（PRD 模块 3）：
 * - 注册求职看板相关页面（Kanban/List/Stats/Detail）。
 * - 在 install() 中订阅 EventBus 事件（例如 `tracker:create:card`、`tracker:update:card-status`）。
 *
 * 约束：
 * - 来自 Inbox/Browser 的联动只能通过 EventBus 事件触发，不允许直接 import tracker store。
 */

