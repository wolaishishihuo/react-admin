import { defineConfig, presetWind4, symbols } from 'unocss';

// @see https://unocss.dev/guide/config-file
export default defineConfig({
  presets: [
    // Tailwind / Windi CSS 兼容的工具类预设
    presetWind4({
      // antd 已提供全局 reset（antd/dist/reset.css），关闭 UnoCSS preflight 避免覆盖其基础样式
      preflight: false
    })
  ],
  content: {
    pipeline: {
      include: [/\.tsx($|\?)/],
      exclude: ['node_modules', 'dist']
    }
  },
  // 跨模块稳定复用的语义快捷类。页面私有样式留在页面内，不放入全局配置。
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'wh-full': 'w-full h-full',
    // TableToolbar 右侧图标按钮（32×32 圆角灰底、hover 加深）
    'toolbar-icon-btn':
      'flex-center h-32px w-32px cursor-pointer rd-6px text-16px transition-colors text-icon bg-hover/55 hover:bg-hover',
    // 卡片表面（bg + border + radius，不含间距——padding 由使用方自给，避免出现 !p-0 反向抵消）
    'app-card': 'box-border text-14px bg-surface border border-line-secondary rd-lg',
    'icon-btn':
      'relative flex-center shrink-0 w-34px h-34px text-20px leading-1 text-icon cursor-pointer rd-4px transition-all duration-300 hover:bg-hover',
    // chip 基底（标签芯片 tabs-item 与图标芯片共用：32px 高、卡面同色、chip 边框、token 圆角）
    chip: 'flex items-center h-32px cursor-pointer bg-surface border border-line-chip rd-base transition-colors',
    'chip-btn': 'chip w-32px justify-center hover:bg-hover'
  },
  rules: [
    // 静态规则的对象位只接受纯 CSSObject，symbols 控制符必须走数组形式（每项一条选择器）
    [
      'scrollbar-hide',
      [
        { 'scrollbar-width': 'none' },
        { [symbols.selector]: (selector: string) => `${selector}::-webkit-scrollbar`, display: 'none' }
      ]
    ]
  ],
  theme: {
    // antd 圆角/阴影 token 的 uno 别名：rd-base / rd-lg、shadow-login / shadow-analysis
    radius: {
      base: 'calc(var(--hooks-borderRadius) * 1px)',
      lg: 'calc(var(--hooks-borderRadiusLG) * 1px)'
    },
    shadow: {
      login: 'var(--hooks-boxShadowLoginForm)',
      analysis: 'var(--hooks-boxShadowAnalysis)'
    },
    colors: {
      // 复用 useTheme 注入的 antd token 与项目自定义 CSS 变量，避免在 JSX 中反复写任意值。
      primary: 'var(--hooks-colorPrimary, #1677ff)',
      'primary-text': 'var(--hooks-colorPrimaryText)',
      'primary-bg': 'var(--hooks-colorPrimaryBg)',
      'primary-border': 'var(--hooks-colorPrimaryBorder)',
      content: 'var(--hooks-colorText)',
      'content-secondary': 'var(--hooks-colorTextSecondary)',
      'content-tertiary': 'var(--hooks-colorTextTertiary)',
      'content-pale': 'var(--hooks-colorTextPale)',
      icon: 'var(--hooks-colorIconText)',
      'floating-icon': 'var(--hooks-colorIcon)',
      'floating-icon-hover': 'var(--hooks-colorIconHover)',
      hover: 'var(--hooks-colorHover)',
      active: 'var(--hooks-colorActive)',
      surface: 'var(--hooks-colorBgContainer)',
      canvas: 'var(--hooks-colorBgContent)',
      'login-canvas': 'var(--hooks-colorBgLoginContainer)',
      'login-panel': 'var(--hooks-colorBgLoginMain)',
      logo: 'var(--hooks-colorLogoText)',
      line: 'var(--hooks-colorBorder)',
      'line-box': 'var(--hooks-colorBorderBox)',
      'line-chip': 'var(--hooks-colorBorderChip)',
      'line-secondary': 'var(--hooks-colorBorderSecondary)',
      danger: 'var(--hooks-colorError)',
      warning: 'var(--hooks-colorWarning)',
      success: 'var(--hooks-colorSuccess)'
    }
  }
});
