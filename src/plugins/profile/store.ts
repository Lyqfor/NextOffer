/**
 * Profile 插件 Pinia Store（占位）。
 *
 * 职责：
 * - 管理档案模板、当前激活模板、各分类结构化数据的前端缓存状态。
 * - 通过调用后端 Commands（Tauri invoke）完成数据读写（后续实现）。
 *
 * 边界：
 * - 不被其他插件直接 import；跨插件数据交换走 EventBus（见 `core/event-bus`）。
 */

