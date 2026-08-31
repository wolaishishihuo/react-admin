import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss';

const spacingDir: Record<string, string> = {
  t: 'top',
  r: 'right',
  b: 'bottom',
  l: 'left'
};

/**
 * Wind4 + Ant Design: reset off so antd/dist/reset.css and Less stay in charge.
 * Theme colors point at runtime `--hooks-*` tokens from useTheme.
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
      'line-box': 'var(--hooks-colorBorderBox)',
      warning: 'var(--hooks-colorWarning)',
      success: 'var(--hooks-colorSuccess)'
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
    'flx-center': 'flex-center',
    'flx-align-center': 'flex items-center',
    'flx-justify-between': 'flex items-center justify-between',
    sle: 'truncate',
    mle: 'line-clamp-2',
    'content-box': 'flex flex-col items-center h-full',
    card: 'box-border p-24px text-14px bg-[var(--hooks-colorBgContainer)] border-solid border-1 border-[var(--hooks-colorBorderSecondary)] rounded-[calc(var(--hooks-borderRadiusLG)*1px)]',
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
    ],
    // Former common.less loop: mb20 / pt60 → 20px / 60px
    [
      /^([mp])([trbl])(\d+)$/,
      ([, kind, dir, n]) => ({
        [`${kind === 'm' ? 'margin' : 'padding'}-${spacingDir[dir]}`]: `${n}px !important`
      })
    ]
  ]
});
