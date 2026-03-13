//! IMAP 子系统入口。
//!
//! 职责：
//! - 管理 IMAP 连接、拉取邮件、将原始邮件内容交给解析器。
//! - 对外暴露同步/拉取能力供 `commands/inbox.rs` 调用。
//!
//! 安全约束：
//! - IMAP 密码/授权码不得写入 SQLite 或文件，必须通过 Keychain 存取（由 Command 层协调）。

pub mod client;
pub mod parser;

