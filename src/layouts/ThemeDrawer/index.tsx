import { Icon as SvgIcon } from '@iconify/react/offline';
import { Drawer, Divider, Switch, Popover, InputNumber, Select } from 'antd';
import darkThemeImg from '@/assets/images/theme_styles/dark.png';
import lightThemeImg from '@/assets/images/theme_styles/light.png';
import systemThemeImg from '@/assets/images/theme_styles/system.png';
import dualColumnImg from '@/assets/images/menu_layouts/dual_column.png';
import horizontalImg from '@/assets/images/menu_layouts/horizontal.png';
import mixedImg from '@/assets/images/menu_layouts/mixed.png';
import verticalImg from '@/assets/images/menu_layouts/vertical.png';
import darkMenuImg from '@/assets/images/menu_styles/dark.png';
import designMenuImg from '@/assets/images/menu_styles/design.png';
import lightMenuImg from '@/assets/images/menu_styles/light.png';
import { themeTransition } from '@/features/theme/theme-transition';
import {
  patchAdminLayout,
  useAdminLayoutStore,
  type MenuThemeType,
  type MenuTypeType
} from '@/stores/modules/admin-layout.store';
import { selectIsDark, setThemeMode, useThemeStore, type ThemeModeType } from '@/stores/modules/theme.store';
import { PAGE_ANIMATE_MODE_OPTIONS } from '../cache/page-animation';
import ColorPicker from './components/ColorPicker';
import './index.less';

const themeModeList: { mode: ThemeModeType; name: string; img: string }[] = [
  { mode: 'light', name: '浅色', img: lightThemeImg },
  { mode: 'dark', name: '深色', img: darkThemeImg },
  { mode: 'auto', name: '系统', img: systemThemeImg }
];

const menuTypeList: { type: MenuTypeType; name: string; img: string }[] = [
  { type: 'left', name: '纵向', img: verticalImg },
  { type: 'top', name: '横向', img: horizontalImg },
  { type: 'top-left', name: '混合', img: mixedImg },
  { type: 'dual-menu', name: '分栏', img: dualColumnImg }
];

const menuThemeList: { theme: MenuThemeType; img: string }[] = [
  { theme: 'design', img: designMenuImg },
  { theme: 'dark', img: darkMenuImg },
  { theme: 'light', img: lightMenuImg }
];

export default function ThemeDrawer() {
  const menuType = useAdminLayoutStore(state => state.menuType);
  const menuThemeType = useAdminLayoutStore(state => state.menuThemeType);
  const menuOpenWidth = useAdminLayoutStore(state => state.menuOpenWidth);
  const watermark = useAdminLayoutStore(state => state.watermark);
  const breadcrumb = useAdminLayoutStore(state => state.breadcrumb);
  const breadcrumbIcon = useAdminLayoutStore(state => state.breadcrumbIcon);
  const tabs = useAdminLayoutStore(state => state.tabs);
  const pageAnimate = useAdminLayoutStore(state => state.pageAnimate);
  const pageAnimateMode = useAdminLayoutStore(state => state.pageAnimateMode);
  const themeDrawerVisible = useAdminLayoutStore(state => state.themeDrawerVisible);
  const isDark = useThemeStore(selectIsDark);
  const themeMode = useThemeStore(state => state.themeMode);
  const compactAlgorithm = useThemeStore(state => state.compactAlgorithm);
  const borderRadius = useThemeStore(state => state.borderRadius);
  const isWeak = useThemeStore(state => state.isWeak);
  const isHappy = useThemeStore(state => state.isHappy);
  const menuStyleDisabled = isDark || menuType === 'top' || menuType === 'dual-menu';

  return (
    <Drawer
      title='主题配置'
      styles={{ wrapper: { width: 290 } }}
      zIndex={999}
      closable={false}
      mask={{ closable: true }}
      open={themeDrawerVisible}
      className='theme-drawer'
      onClose={() => patchAdminLayout({ themeDrawerVisible: false })}
    >
      <Divider className='divider'>
        <SvgIcon icon='ri:layout-line' />
        布局样式
      </Divider>
      <div className='theme-style-box'>
        {menuTypeList.map(item => (
          <div key={item.type} className='theme-style-item' onClick={() => patchAdminLayout({ menuType: item.type })}>
            <div className={`box ${item.type === menuType ? 'is-active' : ''}`}>
              <img src={item.img} alt={item.name} />
            </div>
            <p className='name'>{item.name}</p>
          </div>
        ))}
      </div>

      <Divider className='divider'>
        <SvgIcon icon='ri:t-shirt-line' />
        菜单风格
      </Divider>
      <div className='theme-style-box menu-style-box'>
        {menuThemeList.map(item => (
          <div
            key={item.theme}
            className={`theme-style-item ${menuStyleDisabled ? 'is-disabled' : ''}`}
            onClick={() => !menuStyleDisabled && patchAdminLayout({ menuThemeType: item.theme })}
          >
            <div className={`box ${item.theme === menuThemeType ? 'is-active' : ''}`}>
              <img src={item.img} alt='' />
            </div>
          </div>
        ))}
      </div>

      <Divider className='divider'>
        <SvgIcon icon='ri:fire-line' />
        全局主题
      </Divider>
      <div className='theme-style-box'>
        {themeModeList.map(item => (
          <div key={item.mode} className='theme-style-item' onClick={() => themeTransition(() => setThemeMode(item.mode))}>
            <div className={`box ${item.mode === themeMode ? 'is-active' : ''}`}>
              <img src={item.img} alt={item.name} />
            </div>
            <p className='name'>{item.name}</p>
          </div>
        ))}
      </div>
      <div className='theme-item'>
        <span>主题颜色</span>
        <Popover placement='left' trigger='click' content={ColorPicker}>
          <label className='primary'></label>
        </Popover>
      </div>
      <div className='theme-item'>
        <span>色弱模式</span>
        <Switch checked={isWeak} onChange={value => useThemeStore.getState().setIsWeak(value)} />
      </div>
      <div className='theme-item'>
        <span>快乐模式</span>
        <Switch checked={isHappy} onChange={value => useThemeStore.getState().setIsHappy(value)} />
      </div>
      <div className='theme-item'>
        <span>紧凑主题</span>
        <Switch checked={compactAlgorithm} onChange={value => useThemeStore.getState().setCompactAlgorithm(value)} />
      </div>
      <div className='theme-item'>
        <span>圆角大小</span>
        <InputNumber
          min={1}
          max={20}
          className='w-80px'
          defaultValue={borderRadius}
          formatter={value => `${value}px`}
          parser={value => (value ? value.replace('px', '') : 6) as number}
          onChange={value => useThemeStore.getState().setBorderRadius(value || 6)}
        />
      </div>

      <Divider className='divider'>
        <SvgIcon icon='ri:settings-line' />
        界面设置
      </Divider>
      <div className='theme-item'>
        <span>水印</span>
        <Switch checked={watermark} onChange={value => patchAdminLayout({ watermark: value })} />
      </div>
      <div className='theme-item'>
        <span>面包屑</span>
        <Switch checked={breadcrumb} onChange={value => patchAdminLayout({ breadcrumb: value })} />
      </div>
      <div className='theme-item'>
        <span>面包屑图标</span>
        <Switch checked={breadcrumbIcon} onChange={value => patchAdminLayout({ breadcrumbIcon: value })} />
      </div>
      <div className='theme-item'>
        <span>标签栏</span>
        <Switch checked={tabs} onChange={value => patchAdminLayout({ tabs: value })} />
      </div>
      <div className='theme-item'>
        <span>页面动画</span>
        <Switch checked={pageAnimate} onChange={value => patchAdminLayout({ pageAnimate: value })} />
      </div>
      {pageAnimate && (
        <div className='theme-item'>
          <span>动画模式</span>
          <Select
            className='w-120px'
            size='small'
            value={pageAnimateMode}
            options={PAGE_ANIMATE_MODE_OPTIONS}
            onChange={value => patchAdminLayout({ pageAnimateMode: value })}
          />
        </div>
      )}
      <div className='theme-item'>
        <span>菜单宽度</span>
        <InputNumber
          min={180}
          max={320}
          step={10}
          className='w-80px'
          defaultValue={menuOpenWidth}
          formatter={value => `${value}px`}
          parser={value => (value ? value.replace('px', '') : 230) as number}
          onChange={value => patchAdminLayout({ menuOpenWidth: value || 230 })}
        />
      </div>
    </Drawer>
  );
}
