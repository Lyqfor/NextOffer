/**
 * 插件加载器占位。
 *
 * 职责：
 * - 统一在应用启动时加载内置插件（Profile/Tracker/Browser/Inbox）。
 * - 为未来扩展插件预留入口（PRD 提到 `_extensions` 目录）。
 *
 * 约束：
 * - 不允许插件之间建立直接依赖；共享能力通过 PluginContext 注入或 EventBus 事件契约实现。
 */

