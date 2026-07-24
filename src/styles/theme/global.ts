/** 全局主题 CSS 变量 */
const globalTheme = {
  light: {
    '--hooks-colorBgContent': '#fafbfc',
    '--hooks-colorIconText': '#7987a1',
    '--hooks-colorHover': '#edeff0',
    '--hooks-colorActive': '#f2f4f5',
    '--hooks-colorBorderChip': 'rgba(0, 0, 0, 0.08)',
    '--hooks-colorBorderBox': '#dbdfe1',
    '--hooks-colorMenuPopupActiveBg': '#f2f4f5',
    '--hooks-colorTextPale': '#949eb7',
    '--hooks-colorLogoText': '#475768',
    '--hooks-colorTextRegular': '#606266',
    '--hooks-boxShadowAnalysis': '0 5px 20px 0 rgb(50 50 50 / 54%)',
    '--hooks-scrollbarThumb': 'rgba(0, 0, 0, 0.1)',

    '--hooks-colorBgLoginContainer': '#eeeeee',
    '--hooks-colorBgLoginMain': 'rgb(255 255 255 / 80%)',
    '--hooks-boxShadowLoginForm': '0 2px 10px 2px rgb(0 0 0 / 10%)'
  },
  dark: {
    // 画布色比卡面更深，形成 elevation
    '--hooks-colorBgContent': '#070707',
    '--hooks-colorIconText': '#c7c7d1',
    '--hooks-colorHover': '#252530',
    '--hooks-colorActive': '#202226',
    '--hooks-colorBorderChip': 'rgba(255, 255, 255, 0.08)',
    '--hooks-colorBorderBox': '#505062',
    '--hooks-colorMenuPopupActiveBg': '#292a2e',
    '--hooks-colorTextPale': '#73738c',
    '--hooks-colorLogoText': '#f1f1f1',
    '--hooks-colorTextRegular': '#CFD3DC',
    '--hooks-boxShadowAnalysis': '0 3px 20px 0 rgb(255 255 255 / 35%)',
    '--hooks-scrollbarThumb': 'rgba(255, 255, 255, 0.1)',

    '--hooks-colorBgLoginContainer': '#191919',
    '--hooks-colorBgLoginMain': 'rgb(0 0 0 / 80%)',
    '--hooks-boxShadowLoginForm': '0 2px 10px 2px rgb(255 255 255 / 12%)'
  }
};

export default globalTheme;
