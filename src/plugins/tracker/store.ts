/**
 * Tracker 插件 Pinia Store（占位）。
 *
 * 职责：
 * - 管理卡片列表、筛选条件、列折叠状态等前端状态。
 * - 通过 Tauri Commands 进行卡片 CRUD、状态更新、统计查询等（后续实现）。
 *
 * 约束：
 * - 不允许其他插件直接 import；跨插件联动通过 EventBus + Command。
 */

