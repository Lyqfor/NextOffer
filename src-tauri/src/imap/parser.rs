//! 邮件解析器（规则引擎优先，LLM 可选增强）。
//!
//! 职责：
//! - 按 PRD 模块 4 的规则引擎（Regex + 关键词）识别邮件类型：
//!   interview_invite / test / offer / rejection / unknown。
//! - 抽取结构化字段（公司、时间、地点/链接、截止时间、摘要等）。
//! - 输出统一的解析结果结构，供 Command 层写入 `inbox_parsed_emails` 并驱动后续联动（更新看板/通知）。
//!
//! 说明：
//! - MVP 默认走规则引擎；当“置信度低/解析失败”可请求 LLM（由上层决定，避免在此直接耦合外部 API）。

// 占位：后续实现 ParseRules 读取、Regex 抽取、结果结构体与置信度逻辑。

