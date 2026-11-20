# React Admin

### 介绍 📖

React Admin 一款基于 React 19、React-Router v7、TanStack Query v5、Zustand 5、TypeScript、Vite 8、Ant Design 6、UnoCSS 的后台管理框架。

仓库：[https://github.com/wolaishishihuo/react-admin](https://github.com/wolaishishihuo/react-admin)

### 主要功能 🔨

- 使用 React 19 + TypeScript 开发，整个项目使用 Hooks + TypeScript 完成
- 使用 Vite 8（Oxc + Lightning CSS）作为开发、打包工具（配置 Gzip / Brotli 压缩打包、Visualizer 包分析…）
- 使用 React-Router v7 数据路由，项目支持多路由（Hash | History）切换、路由懒加载配置与同步渲染级守卫
- 项目菜单、路由权限使用 **动态路由** 控制，完全根据后端菜单数据动态生成路由
- 基于 React 19 `Activity` 实现页面 **KeepAlive**，通过路由 `meta.isKeepAlive` 开关，与多标签页同步缓存 / 关闭 / 刷新
- 使用 Zustand 5 管理全局与会话状态，集成 persist 持久化；使用 TanStack Query v5 管理声明式服务端状态
- 使用 Ant Design 6 + ProComponents 开发，将 Design Token 与明暗自适应灰阶注入 CSS 变量，配合 UnoCSS + 原生现代 CSS
- 项目支持多主题：主题颜色、暗黑模式、灰色模式、色弱模式、紧凑主题、圆角大小配置
- 项目支持多布局：横向布局、经典布局（可开启菜单分割功能）、纵向布局、分栏布局配置
- 项目其它功能：菜单手风琴模式、无限级菜单、多标签页、面包屑导航、页面水印、ECharts 组件封装、Remix Icon 统一图标组件…
- 使用 Oxc（`oxlint` + `oxfmt`）统一代码静态检查（含 `unocss/order`）与极速格式化
- 使用 husky、lint-staged、commitlint、czg、cz-git 规范代码提交信息
