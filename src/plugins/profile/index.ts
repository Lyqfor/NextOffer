/**
 * Profile 插件注册入口（占位）。
 *
 * 职责（PRD 模块 1）：
 * - 导出实现 Plugin 接口的 ProfilePlugin：声明 meta、routes、stores、navItems 等。
 * - 在 install() 生命周期中注册本插件对外能力（通常通过 EventBus 响应请求事件）。
 *
 * 关键约束：
 * - 其他插件不得直接 import 本插件 store；如 Browser 需要字段列表，必须通过 EventBus 请求。
 */

