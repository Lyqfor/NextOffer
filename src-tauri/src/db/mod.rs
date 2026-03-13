//! 数据库模块（SQLite）。
//!
//! 职责：
//! - 负责应用启动时的数据库连接初始化（后续接入 tauri-plugin-sql 或自管连接）。
//! - 执行 `schema.sql` 的初始化（仅首次）与 `migrations/` 的增量迁移。
//! - 提供给各 Command 层的统一 DB 访问入口（例如连接池句柄、事务工具等）。
//!
//! 边界：
//! - 不包含业务逻辑；业务逻辑应位于对应模块（profile/tracker/inbox/...) 的 service/repo 层。
//! - 不存任何敏感信息（密码/API Key/IMAP 授权码必须走 Keychain）。

// 占位：后续补充 DatabaseService/Connection 管理实现。

