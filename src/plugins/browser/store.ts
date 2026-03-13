/**
 * Browser 插件 Pinia Store（占位）。
 *
 * 职责：
 * - 管理账号列表、当前打开的 URL、侧边栏开关/宽度等 UI 状态。
 * - 通过 Tauri Commands 读写账号元数据（密码由 Keychain 管理，前端不持久化明文）。
 *
 * 边界：
 * - 不负责 Profile 字段数据本体；侧边栏字段来自 Profile 插件，通过 EventBus 请求/响应获取。
 */

