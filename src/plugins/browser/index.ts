/**
 * Browser 插件注册入口（占位）。
 *
 * 职责（PRD 模块 2）：
 * - 注册账号管理页与内置浏览器页（Webview + 档案侧边栏）。
 * - 在 install() 中提供“添加到看板”的能力（通过 EventBus 发出 `tracker:create:card`）。
 *
 * 安全约束：
 * - MVP 禁止向 Webview 注入脚本；只提供复制粘贴的侧边栏能力。
 */

