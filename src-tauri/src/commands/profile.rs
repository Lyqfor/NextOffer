//! Profile（个人档案）相关 Tauri Commands（占位）。
//!
//! 职责：
//! - 提供前端调用的 Profile API：模板管理、基本信息、教育/经历/项目/技能/荣誉等 CRUD 与排序。
//! - 提供“侧边栏字段输出”接口：给 Browser 插件侧边栏展示/复制用。
//!
//! 边界：
//! - 仅做 IO 边界（参数校验/错误转换/调用下层 service/repo），不在 Command 层堆业务逻辑。
//! - 不处理 Keychain（Profile 本身不应存敏感密钥）。

