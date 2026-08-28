# Hooks-Admin-Pro

### 介绍 📖

🚀🚀🚀 Hooks-Admin-Pro 一款基于 React 19、React-Router v7、React Hooks、Zustand、TypeScript、Vite 8、Ant Design 6 的后台管理框架。

### 主要功能 🔨

- 使用 React 19 + TypeScript 开发，整个项目使用 Hooks + TypeScript 完成
- 使用 Vite 8 作为开发、打包工具（配置 Gzip 压缩打包、Visualizer 包分析…）
- 使用 React-Router v7 数据路由，项目支持多路由（Hash | History）切换、路由懒加载配置
- 项目菜单、路由权限使用 **动态路由** 控制，完全根据后端菜单数据动态生成路由
- 基于 React 19 `Activity` 实现页面 **KeepAlive**，通过路由 `meta.isKeepAlive` 开关，与多标签页同步缓存 / 关闭 / 刷新
- 使用 Zustand 作为状态管理工具，集成 persist 持久化
- 使用 Ant Design 6 组件库开发，将 Design Token 注入到 CSS 变量中，方便配置项目主题
- 项目支持多主题：主题颜色、暗黑模式、灰色模式、色弱模式、紧凑主题、圆角大小配置
- 项目支持多布局：横向布局、经典布局（可开启菜单分割功能）、纵向布局、分栏布局配置
- 项目其它功能：菜单手风琴模式、无限级菜单、多标签页（拖拽）、详情页标签、面包屑导航、页面水印、ECharts 组件封装、SVG 图标组件、数据大屏…
- 使用 Prettier 统一格式化代码，集成 ESLint 10（Flat Config）、Stylelint 代码校验规范
- 使用 husky、lint-staged、commitlint、czg、cz-git 规范代码提交信息
