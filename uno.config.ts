import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss';

/**
 * Wind4 + Ant Design: reset off so antd/dist/reset.css and native CSS stay in charge.
 * Theme colors point at runtime `--hooks-*` tokens from useTheme (aligned with art-design-pro).
 */
export default defineConfig({
  presets: [
    presetWind4({
      dark: 'class',
      preflights: {
        reset: false
      }
    })
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      primary: 'var(--hooks-colorPrimary, #B40006)',
      canvas: 'var(--hooks-colorBgContent)',
      surface: 'var(--hooks-colorBgBox)',
      regular: 'var(--hooks-colorTextRegular)',
      header: 'var(--hooks-colorBgHeader)',
      sider: 'var(--hooks-colorBgSider)',
      login: 'var(--hooks-colorBgLoginContainer)',
      icon: 'var(--hooks-colorTextSecondaryHeader)',
      'content-pale': 'var(--hooks-colorTextPale)',
      hover: 'var(--hooks-colorTextHoverHeader, var(--hooks-colorLayoutHover))',
      active: 'var(--hooks-colorActive)',
      'line-box': 'var(--hooks-colorBorderBox)',
      'border-subtle': 'var(--hooks-colorBorderSubtle)',
      'card-border': 'var(--hooks-colorCardBorder)',
      warning: 'var(--hooks-colorWarning)',
      success: 'var(--hooks-colorSuccess)',
      'g-100': 'var(--hooks-gray-100)',
      'g-200': 'var(--hooks-gray-200)',
      'g-300': 'var(--hooks-gray-300)',
      'g-400': 'var(--hooks-gray-400)',
      'g-500': 'var(--hooks-gray-500)',
      'g-600': 'var(--hooks-gray-600)',
      'g-700': 'var(--hooks-gray-700)',
      'g-800': 'var(--hooks-gray-800)',
      'g-900': 'var(--hooks-gray-900)'
    },
    shadow: {
      analysis: 'var(--hooks-boxShadowAnalysis)',
      login: 'var(--hooks-boxShadowLoginForm)'
    }
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-y-center': 'flex items-center',
    'flex-x-center': 'flex justify-center',
    sle: 'truncate',
    mle: 'line-clamp-2',
    card: 'box-border p-24px text-14px bg-surface border-solid border-1 border-card-border rounded-[calc(var(--hooks-borderRadius)*1px_+_4px)]',
    'icon-btn':
      'text-icon relative flex-center h-34px w-34px shrink-0 cursor-pointer rounded-[8px] text-20px leading-none transition-colors hover:bg-hover'
  },
  rules: [
    [
      'mask-image',
      {
        'padding-right': '50px',
        'mask-image': 'linear-gradient(90deg, #000 0%, #000 calc(100% - 50px), transparent)'
      }
    ]
  ]
});
