/**
 * LLM Service 类型定义（占位）。
 *
 * 职责（PRD 模块 5）：
 * - 定义统一的 LLMProvider/LLMConfig/LLMRequest/LLMResponse 与 LLMService 接口。
 * - 供任意插件通过 `PluginContext.llmService` 使用，而不是直接调用外部 API。
 *
 * 安全与边界：
 * - API Key 运行时从 Keychain 读取；不得以明文写入 SQLite 或前端持久化。
 */

