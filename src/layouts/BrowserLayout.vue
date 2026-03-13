<template>
  <div>BrowserLayout（占位）</div>
</template>

<script setup lang="ts">
/**
 * 浏览器布局（BrowserLayout）占位。
 *
 * 职责（按 PRD 模块 2）：
 * - 左/中：Webview（加载目标投递网页）。
 * - 右侧：档案侧边栏（Profile Sidebar），用于字段搜索与一键复制。
 *
 * 关键安全约束：
 * - MVP 禁止向 Webview 注入脚本；侧边栏采用“复制粘贴”方案而非 DOM 自动填充。
 *
 * 边界：
 * - Webview 的导航栏（后退/前进/刷新/地址栏）属于 Browser 插件的 UI；
 *   布局只提供结构与区域划分。
 */
</script>

