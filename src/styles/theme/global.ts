/**
 * @description Global theme config
 */
const globalTheme = {
  light: {
    // Customize global CSS variables
    '--hooks-colorBgContent': '#fafbfc',
    '--hooks-colorBgBox': '#ffffff',
    '--hooks-colorCardBorder': 'rgba(0, 0, 0, 0.08)',
    '--hooks-colorLayoutHover': '#edeff0',
    '--hooks-colorTabText': '#7987a1',
    '--hooks-colorLogoText': '#475768',
    '--hooks-colorTextRegular': '#606266',
    '--hooks-boxShadowAnalysis': '0 5px 20px 0 rgb(50 50 50 / 54%)',
    '--hooks-scrollbarThumb': 'rgba(0, 0, 0, 0.1)',

    // Customize login CSS variables
    '--hooks-colorBgLoginContainer': '#eeeeee',
    '--hooks-colorBgLoginMain': 'rgb(255 255 255 / 80%)',
    '--hooks-boxShadowLoginForm': '0 2px 10px 2px rgb(0 0 0 / 10%)'
  },
  dark: {
    // Customize global CSS variables
    '--hooks-colorBgContent': '#070707',
    '--hooks-colorBgBox': '#161618',
    '--hooks-colorCardBorder': 'rgba(255, 255, 255, 0.08)',
    '--hooks-colorLayoutHover': '#252530',
    '--hooks-colorTabText': '#8f8fa3',
    '--hooks-colorLogoText': '#f1f1f1',
    '--hooks-colorTextRegular': '#CFD3DC',
    '--hooks-boxShadowAnalysis': '0 3px 20px 0 rgb(255 255 255 / 35%)',
    '--hooks-scrollbarThumb': 'rgba(255, 255, 255, 0.1)',

    // Customize login CSS variables
    '--hooks-colorBgLoginContainer': '#191919',
    '--hooks-colorBgLoginMain': 'rgb(0 0 0 / 80%)',
    '--hooks-boxShadowLoginForm': '0 2px 10px 2px rgb(255 255 255 / 12%)'
  }
};

export default globalTheme;
