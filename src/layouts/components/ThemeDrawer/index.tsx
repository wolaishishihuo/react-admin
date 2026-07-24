import { Icon as SvgIcon } from '@iconify/react/offline';
import { Drawer, Divider, Switch, Popover, InputNumber } from 'antd';
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
import {
  setGlobalState,
  setThemeMode,
  useGlobalStore,
  type MenuThemeType,
  type MenuTypeType,
  type ThemeModeType
} from '@/stores';
import { themeTransition } from '@/utils/themeAnimation';
import ColorPicker from './components/ColorPicker';
import './index.less';

// 明暗三档卡片（预览图 + 浅色/深色/系统）
const themeModeList: { mode: ThemeModeType; name: string; img: string }[] = [
  { mode: 'light', name: '浅色', img: lightThemeImg },
  { mode: 'dark', name: '深色', img: darkThemeImg },
  { mode: 'auto', name: '系统', img: systemThemeImg }
];

// 布局缩略图四卡（图片卡 + 底部名字）
const menuTypeList: { type: MenuTypeType; name: string; img: string }[] = [
  { type: 'left', name: '纵向', img: verticalImg },
  { type: 'top', name: '横向', img: horizontalImg },
  { type: 'top-left', name: '混合', img: mixedImg },
  { type: 'dual-menu', name: '分栏', img: dualColumnImg }
];

// 菜单风格三卡（横向/分栏/isDark 时禁用切换）
const menuThemeList: { theme: MenuThemeType; img: string }[] = [
  { theme: 'design', img: designMenuImg },
  { theme: 'dark', img: darkMenuImg },
  { theme: 'light', img: lightMenuImg }
];

const ThemeDrawer: React.FC = () => {
  const menuType = useGlobalStore(state => state.menuType);
  const menuThemeType = useGlobalStore(state => state.menuThemeType);
  const menuOpenWidth = useGlobalStore(state => state.menuOpenWidth);
  const isDark = useGlobalStore(state => state.isDark);
  const themeMode = useGlobalStore(state => state.themeMode);
  const compactAlgorithm = useGlobalStore(state => state.compactAlgorithm);
  const borderRadius = useGlobalStore(state => state.borderRadius);
  const isWeak = useGlobalStore(state => state.isWeak);
  const isHappy = useGlobalStore(state => state.isHappy);
  const watermark = useGlobalStore(state => state.watermark);
  const breadcrumb = useGlobalStore(state => state.breadcrumb);
  const breadcrumbIcon = useGlobalStore(state => state.breadcrumbIcon);
  const tabs = useGlobalStore(state => state.tabs);
  const themeDrawerVisible = useGlobalStore(state => state.themeDrawerVisible);

  // top/dual-menu/isDark 时禁用菜单风格切换
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
      onClose={() => setGlobalState({ key: 'themeDrawerVisible', value: false })}
    >
      {/* 布局切换 */}
      <Divider className='divider'>
        <SvgIcon icon='ri:layout-line' />
        布局样式
      </Divider>
      <div className='theme-style-box'>
        {menuTypeList.map(item => (
          <div key={item.type} className='theme-style-item' onClick={() => setGlobalState({ key: 'menuType', value: item.type })}>
            <div className={`box ${item.type === menuType ? 'is-active' : ''}`}>
              <img src={item.img} alt={item.name} />
            </div>
            <p className='name'>{item.name}</p>
          </div>
        ))}
      </div>

      {/* 菜单风格 */}
      <Divider className='divider'>
        <SvgIcon icon='ri:t-shirt-line' />
        菜单风格
      </Divider>
      <div className='theme-style-box menu-style-box'>
        {menuThemeList.map(item => (
          <div
            key={item.theme}
            className={`theme-style-item ${menuStyleDisabled ? 'is-disabled' : ''}`}
            onClick={() => !menuStyleDisabled && setGlobalState({ key: 'menuThemeType', value: item.theme })}
          >
            <div className={`box ${item.theme === menuThemeType ? 'is-active' : ''}`}>
              <img src={item.img} alt='' />
            </div>
          </div>
        ))}
      </div>

      {/* 主题设置 */}
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
        <Switch checked={isWeak} onChange={value => setGlobalState({ key: 'isWeak', value })} />
      </div>
      <div className='theme-item'>
        <span>快乐模式</span>
        <Switch checked={isHappy} onChange={value => setGlobalState({ key: 'isHappy', value })} />
      </div>
      <div className='theme-item'>
        <span>紧凑主题</span>
        <Switch checked={compactAlgorithm} onChange={value => setGlobalState({ key: 'compactAlgorithm', value })} />
      </div>
      <div className='theme-item'>
        <span>圆角大小</span>
        <InputNumber
          min={1}
          max={20}
          className='w-80px'
          defaultValue={borderRadius}
          formatter={value => `${value}px`}
          parser={value => (value ? value!.replace('px', '') : 6) as number}
          onChange={value => {
            const newValue = value || 6;
            setGlobalState({ key: 'borderRadius', value: newValue });
          }}
        />
      </div>

      {/* 界面设置 */}
      <Divider className='divider'>
        <SvgIcon icon='ri:settings-line' />
        界面设置
      </Divider>
      <div className='theme-item'>
        <span>水印</span>
        <Switch checked={watermark} onChange={value => setGlobalState({ key: 'watermark', value })} />
      </div>
      <div className='theme-item'>
        <span>面包屑</span>
        <Switch checked={breadcrumb} onChange={value => setGlobalState({ key: 'breadcrumb', value })} />
      </div>
      <div className='theme-item'>
        <span>面包屑图标</span>
        <Switch checked={breadcrumbIcon} onChange={value => setGlobalState({ key: 'breadcrumbIcon', value })} />
      </div>
      <div className='theme-item'>
        <span>标签栏</span>
        <Switch checked={tabs} onChange={value => setGlobalState({ key: 'tabs', value })} />
      </div>
      <div className='theme-item'>
        <span>菜单宽度</span>
        <InputNumber
          min={180}
          max={320}
          step={10}
          className='w-80px'
          defaultValue={menuOpenWidth}
          formatter={value => `${value}px`}
          parser={value => (value ? value!.replace('px', '') : 230) as number}
          onChange={value => setGlobalState({ key: 'menuOpenWidth', value: value || 230 })}
        />
      </div>
    </Drawer>
  );
};

export default ThemeDrawer;
