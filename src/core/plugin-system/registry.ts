/**
 * PluginRegistry（插件注册表）占位实现文件。
 *
 * 职责（PRD 4.2）：
 * - register(plugin, context)：执行 install()、注入路由、注册 store、追加导航项等。
 * - unregister(pluginId)：可选卸载（调用 uninstall），并移除路由/状态。
 * - get/getAll/isInstalled：查询已安装插件。
 *
 * 约束：
 * - registry 只负责“装配与生命周期”，不应夹带具体业务逻辑。
 * - 插件顺序决定导航顺序（按 meta.order 或注册顺序，具体策略后续确定）。
 */

