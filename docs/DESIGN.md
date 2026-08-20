# DESIGN.md — 视觉与交互设计规范

本项目**自包含**的设计规范：所有数值提炼自当前代码（原始视觉来源为 art-design-pro，已完成像素级对齐；无需本地持有 art 源码）。改样式以本文档 + 代码现状为准；本文档与代码不一致时，以代码为准并回来修文档。

## 1. 设计原语（Design Tokens）

### 1.1 颜色（`--hooks-*` CSS 变量，useTheme 注入；Uno 语义色映射见 uno.config.ts）

| 语义（uno 类）                   | 变量                             | 亮色              | 暗色                    |
| -------------------------------- | -------------------------------- | ----------------- | ----------------------- |
| 画布 `bg-canvas`                 | `--hooks-colorBgContent`         | `#fafbfc`         | `#070707`               |
| 卡面 `bg-surface`                | `colorBgContainer`(antd)         | `#fff`            | `#161618`               |
| 浮层                             | `colorBgElevated`(antd)          | antd 默认         | `#1e1e20`               |
| 图标/次级文字 `text-icon`        | `--hooks-colorIconText`          | `#7987a1`         | `#c7c7d1`               |
| hover 灰 `bg-hover`              | `--hooks-colorHover`             | `#edeff0`         | `#252530`               |
| active 灰 `bg-active`            | `--hooks-colorActive`            | `#f2f4f5`         | `#202226`               |
| 芯片/卡片边框 `border-line-chip` | `--hooks-colorBorderChip`        | `rgba(0,0,0,.08)` | `rgba(255,255,255,.08)` |
| 输入类边框 `border-line-box`     | `--hooks-colorBorderBox`         | `#dbdfe1`         | `#505062`               |
| 弱文字 `text-content-pale`       | `--hooks-colorTextPale`          | `#949eb7`         | `#73738c`               |
| Logo 标题 `text-logo`            | `--hooks-colorLogoText`          | `#475768`         | `#f1f1f1`               |
| 弹出菜单选中底                   | `--hooks-colorMenuPopupActiveBg` | `#f2f4f5`         | `#292a2e`               |
| 登录页画布/面板                  | `colorBgLoginContainer/Main`     | `#eee` / 白 80%   | `#191919` / 黑 80%      |

- 主题色默认 `#1677ff`（用户可换，派生 `colorPrimary5/8` 两档供 ThemeDrawer 预览）。
- **elevation 规则**：画布恒比卡面深一档，卡面默认带边框——层次靠「底色深浅 + 边框」，不靠阴影。
- 其余色一律引用 antd token（`--hooks-colorText/-Secondary/-Tertiary`、`colorError`、`colorSuccess`...），**禁止新增裸 hex**；留守 less 中的特例必须注释理由。

### 1.2 圆角 / 阴影 / 字号

- 圆角走 antd token：`rd-base`（`borderRadius`）/ `rd-lg`（`borderRadiusLG`），用户可在 ThemeDrawer 调；组件不写死 px 圆角（Menu 项 6px 为 antd token 配置，见 §3.2）。
- 阴影仅两处具名 token：`shadow-login`、`shadow-analysis`；常规卡片**不加阴影**（见 elevation 规则）。
- 字号基准 14px（`app-card` 内）；辅助信息 12px（tabs 芯片、表格次级文字）；图标 16px（工具栏）/ 20px（菜单、icon-btn）。

## 2. 布局骨架尺寸

| 部位        | 规格                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header      | 高 **60px**；左右 padding 对齐 20px 网格；随 `.app-header` sticky 吸顶（app-main 为唯一滚动容器）                                                 |
| 侧栏        | 展开 `var(--menu-open-width)`（默认 **230px**，设置面板可调 180–320），折叠 **64px**；dual-menu rail **80px**（纯图标 64px）；移动端转 fixed 抽屉 |
| 内容区侧沟  | **统一 20px**（Main padding / Tabs inset / Header 左缘同一条线）                                                                                  |
| Logo 标题   | **18px**                                                                                                                                          |
| 标签栏 Tabs | 容器 `px-20px pb-12px`（≤640px 侧沟 15px），芯片间 gap 6px；芯片高 32px（`chip` 基底）、文字 12px、无 icon                                        |
| 列表页节奏  | `.app-pro-table` flex 列 gap **12px**；卡内 padding **24px**（`app-card` 不含 padding，使用方自给）；工具栏与表格间 `mt-12px`                     |
| 图标钮      | 工具栏 `toolbar-icon-btn` 32×32 / rd-6px / 16px 图标 / 底 `bg-hover/55`→hover `bg-hover`；Header `icon-btn` 34×34 / rd-4px / 20px 图标            |
| 响应式断点  | 移动端 **800px**（`useIsMobile`，侧栏 overlay：遮罩 z-600 < 侧栏 z-601，点遮罩/导航后自动收起）；列表页 **640px** 以下回退整页滚                  |

## 3. 组件视觉规则

### 3.1 标签栏（Tabs 芯片）

- `chip` 基底：32px 高、卡面同色底、`line-chip` 边框、`rd-base` 圆角；激活态文字变主题色（无实心底）；固定标签（isAffix，类 `tabs-item-affix`）padding `0 10px`，其余 `0 8px 0 12px`。
- 关闭钮：`closable && 多于一个标签` 才渲染（单标签隐藏 X，art 同规则）；padding 由 affix 类驱动，不随 X 钮隐藏变化。
- **不渲染 icon**（刻意决策，勿加回）。

### 3.2 侧栏菜单（antd Menu token 配置于 App.tsx）

- 项高 **42px**、圆角 6px、两侧内缩 8px、块间距 4px、图标 20px；hover 灰（亮 `#f2f4f5` / 暗 `#17171c`）。
- Menu theme **恒 light**（antd dark 菜单绕开 light token，刻意不用）；**菜单主题三档配方管线**（design/dark/light，配方常量见 `src/layouts/Sidebar/theme.ts`，经 aside 变量 `--menu-bg/--menu-text/--menu-icon/--menu-name` + 档位类 `menu-theme-*` 生效）：design=白底+tinted 选中芯片（现状默认）、dark=`#191A23` 底+选中白字 `#27282D` 底+hover `#0F1015`（弹出子菜单同档位换肤 `menu-popup-dark`）、light=design+4px 主题色左条；**isDark 强制覆盖**（无视档位）：卡面底暗色配方，选中态同 dark 档。折叠弹出子菜单圆角、design/light 档选中为**灰底**（`colorMenuPopupActiveBg`）；子菜单不另设底色（平铺设计）。
- 横向/混合菜单（top / top-left）选中态：**文字变主题色，无实心主色底**（top-left 另有 40×2 主题色下划线）。
- **dual-menu（双列）对齐 art**：第一列轨道 **80px** 宽（纯图标态 64px），项 `margin:8px`/圆角 token/**图标 20px**、文字 12px，选中态浅主题底（`colorPrimaryBg`）+ 主题色文字；第二列顶部系统名**左对齐**（`padding-left:25px`）+ **常规字重**（非居中加粗），rail logo 仍居中；第二列右缘 **11×50 悬浮折叠钮**（aside 悬停浮现）。

### 3.3 卡片与表格

- 卡片 = `app-card`（bg-surface + line-secondary 边框 + rd-lg，**不含 padding**）；统计横幅用单卡分栏 + 竖分割线，勿拆多张小卡。
- 标准分页表使用 ProTable 的列设置、分页和项目作用域高度链；树表、双表、复杂汇总表按真实业务需要使用原生 AntD Table。表格高度机制见 CLAUDE.md §6 和 `docs/PROTABLE.md`。

### 3.4 图表（echarts）

- tooltip 必须随主题：暗 `rgba(0,0,0,0.8)` 黑底白字 / 亮 `rgba(255,255,255,0.9)`——用 `@/components/ECharts/config` 的 `getTooltipStyle(isDark)`，禁用 echarts 默认恒白底。

### 3.5 头栏部件

- 头栏 60px；左区 flex-1 + min-width:0（面包屑场景 mask-image 右缘渐隐）；右区图标簇 gap 10px。
- 归属规则：logo 仅 top（<1400px 藏系统名）；汉堡仅 left（移动端四模式恒显，开抽屉）；刷新四模式恒显；面包屑仅 left/dual-menu。
- 响应式：刷新 ≤640 隐藏；搜索/全屏 ≤768 隐藏；头像 ≤640 缩 26px。
- 右区构成：搜索触发器 → 全屏 → 设置 → 明暗 → 头像（通知功能件已移除；用户菜单为 antd Dropdown 现状形态）。

### 3.6 设置面板（ThemeDrawer）

- **图片卡范式**（art `.setting-box-wrap` 同构，`theme-style-box` 复用）：52px 预览图卡、2px 描边、8px 圆角、选中态主题色描边；明暗三卡/布局四卡带底部名字，菜单风格三卡无名字；>3 项换行 `row-gap: 16px`；暗色下描边透明、选中保持主题色。
- **菜单风格三档**（design/dark/light）写 `menuThemeType`，仅纵向/混合下可切；**横向、分栏、isDark 禁用**（no-drop 光标 + 点击 no-op，选中标记保留，档位值不重置；对齐 art MenuStyleSettings `isTopMenu || isDualMenu || isDark`）——横向无侧栏、分栏沿用切换前档位渲染，暗色由强制覆盖配方接管（配方规则见 §3.2）。
- **菜单宽度**：InputNumber 180–320、步进 10，写 `menuOpenWidth`（侧栏 `--menu-open-width` 即时生效，折叠态 64px 不受影响）。

## 4. 交互行为规则（原扒自 art，现以此文档为准）

- **标签栏**：纵向滚轮映射横向滚动（取 `deltaX/deltaY` 绝对值大者加到 `scrollLeft`，原生 wheel 监听 + preventDefault）；激活标签自动入视区（首次挂载瞬时、路由切换 `behavior:'smooth'`）；**一套菜单双入口**——标签右键 + more 按钮（作用于激活标签）：刷新（仅激活标签可用）/最大化（恒可用）/关闭左侧/右侧/其它/所有（`isAffix` 固定标签参与禁用判定；关闭范围吞掉激活标签时先跳转菜单目标标签，关闭所有回首页）；无「关闭当前」项（标签 X 钮覆盖）。
- 主题：`themeMode` 三档 light/dark/auto——auto 由 `matchMedia('(prefers-color-scheme)')` 实时跟随系统；用户选择持久化，实际生效读 `isDark`；`index.html` 内联脚本读 `theme-state` 做首屏防闪（含 auto 档）。
- **列表搜索**：标准分页表由 ProTable columns 描述搜索字段；看板使用页内 AntD Form，查询只在提交后更新应用条件，重置恢复业务默认值。
- **表格全屏**：CSS class 方案（非 Fullscreen API，保证弹窗可用），ESC 退出；手动点击刷新才转圈（自动请求不转）。
- **移动端**：≤800px 侧栏（aside 整体）转 fixed 抽屉 + 收起态 `translateX` 离场；进入移动视口/菜单导航后自动收起；top/top-left 的顶部菜单窄屏不可用，回退全菜单树抽屉（dual-menu 保持 rail+第二列整体抽屉）。

## 5. 修改样式的工作规则

1. 分工三原则（CLAUDE.md §5）：一次性 → utility；≥3 处复用 → shortcut；antd 深覆盖/伪元素/keyframes → less。
2. 颜色/圆角引用 §1 token；新增语义色先加 `--hooks-*` 变量 + uno theme 映射，再在 JSX 用语义类。
3. 视觉调整须亮/暗两档 + 四 menuType 核对（历史教训：暗色硬编码、模式间数值漂移是常见回归源）。
4. art-design-pro 是历史视觉来源；本文档已提炼其全部落地规则，**不要求本地持有 art 源码**。若需考古某规则出处，TODO.md 阶段三/七各条目录有原始 commit 与扒取位置。
