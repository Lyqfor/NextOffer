-- NextOffer SQLite 初始化 Schema（占位骨架）
--
-- 职责：
-- - 定义应用所有核心表结构（Profile/Browser/Tracker/Inbox/LLM/Settings）。
-- - 作为首次启动时的初始化脚本。
--
-- 注意：
-- - PRD 明确要求：敏感信息不入库（密码/API Key/IMAP 授权码必须存 Keychain）。
-- - 迁移增量变更应放在 `migrations/`，不要直接改老版本线上 schema。

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 占位：后续在 Phase 1/2 会按 PRD 第5节完整落库。

