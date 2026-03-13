/**
 * OpenAI Provider 适配器（占位）。
 *
 * 职责：
 * - 将统一的 LLMRequest 转换为 OpenAI 兼容接口的请求格式并发起调用。
 * - 将响应转换回统一的 LLMResponse。
 *
 * 边界：
 * - 不保存 API Key（Key 由上层从 Keychain 提供）。
 * - 不做产品级业务逻辑（例如邮件解析 Prompt 选择应由业务层决定）。
 */

