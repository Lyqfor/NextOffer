/**
 * LLM Service 统一入口（占位）。
 *
 * 职责：
 * - 暴露 `chat` / `chatStream` 等统一调用方法。
 * - 根据默认配置选择 provider（OpenAI/DeepSeek/智谱/custom）。
 * - 统一处理错误、超时、降级与用量统计（usage）。
 *
 * 边界：
 * - provider 适配在 `providers/` 下实现；这里仅做编排与对外 API。
 */

