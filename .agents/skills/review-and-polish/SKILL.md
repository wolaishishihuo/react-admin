---
name: review-and-polish
description: >-
  Reviews and polishes code changes or modules against this template's
  engineering standards and UI craft: catches dead exports, redundant effects or
  memos, state ownership leaks, light/dark theme glitches, and missing
  interactive states. Use when the user asks to review, refactor, clean up, or
  polish code before committing or merging.
---

# 代码评审与重构打磨

围绕「代码读起来舒服、界面用起来顺手、仓库不留债务」做一次聚焦检查，不机械挑刺，也不做超出任务范围的过度重构。

## 审查维度

1. **零历史遗留（高优先级）**
   - 检查是否残留：无生产消费的 `export` / 兼容重导出、仅为单测暴露的生产 `export`、注释掉的旧代码、未引用文件/常量/样式规则。
   - 拆分或移动代码时，所有调用方与单测是否已同步更新。

2. **React 19 写法与状态纯净度**
   - 能在渲染期直接算出的值，是否误写成 `useState + useEffect` 同步副本？
   - `useEffect` 是否只做外部系统同步（DOM / 订阅 / 定时器 / 图表 / Form）且清理干净？
   - 是否存在无依据的 `React.memo` / `useCallback` / `useMemo`？
   - 新代码是否符合「箭头函数 + 独立 Props `interface` + 首行解构 + 内部 `function` 声明」风格？

3. **数据流与边界**
   - 同一份服务端数据是否被 `ProTable.request`、TanStack Query、Zustand 或 `useState` 重复管理？
   - 退出/切号/取消场景是否遵守 `src/apis/README.md` 的取消与清理时机？
   - 外部链接是否带 `'noopener,noreferrer'`？全局事件监听与定时器是否释放？

4. **UI 与交互质感**
   - 颜色是否走 UnoCSS 语义色或 `--hooks-*` token，明暗主题切换是否自然无硬编码？
   - 按钮主次层级、间距呼吸感是否克制；空态、加载态、禁用防连点、表单草稿重置、危险操作二次确认是否完整？

## 验证收口

修改完成后按实际改动范围执行并如实汇报结果：

- `pnpm type:check`
- `pnpm lint` & `pnpm format:check`
- `pnpm test:run`（涉及行为改动时）
- `pnpm build:pro`（涉及构建、依赖、路由加载或资源集成时）
