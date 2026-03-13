/**
 * NextOffer 前端入口（渲染进程）占位文件。
 *
 * 职责：
 * - 初始化 Vue 应用实例。
 * - 挂载 Pinia、Vue Router。
 * - 创建并安装全局服务（EventBus、LLMService、DatabaseService 的前端代理等）。
 * - 调用插件系统（PluginRegistry）按固定顺序注册内置插件（Profile/Tracker/Browser/Inbox）。
 *
 * 约束：
 * - 插件之间禁止直接 import 对方 store；跨插件交互必须走 EventBus（见 `core/event-bus/`）。
 * - 本文件只做“装配（wiring）”，不写业务逻辑。
 */


