import './index.less';

import { Divider, Drawer, InputNumber, Popover, Switch, Tooltip } from 'antd';

import { Icon } from '@/components/Icon';
import { useGlobalStore } from '@/stores';

import ColorPicker from './components/ColorPicker';

const ThemeDrawer: React.FC = () => {
  const {
    layout,
    compactAlgorithm,
    borderRadius,
    isDark,
    isGrey,
    isWeak,
    isHappy,
    menuSplit,
    siderInverted,
    headerInverted,
    isCollapse,
    accordion,
    watermark,
    breadcrumb,
    breadcrumbIcon,
    tabs,
    tabsIcon,
    footer,
    themeDrawerVisible,
    setGlobalState
  } = useGlobalStore(state => ({
    layout: state.layout,
    compactAlgorithm: state.compactAlgorithm,
    borderRadius: state.borderRadius,
    isDark: state.isDark,
    isGrey: state.isGrey,
    isWeak: state.isWeak,
    isHappy: state.isHappy,
    menuSplit: state.menuSplit,
    siderInverted: state.siderInverted,
    headerInverted: state.headerInverted,
    isCollapse: state.isCollapse,
    accordion: state.accordion,
    watermark: state.watermark,
    breadcrumb: state.breadcrumb,
    breadcrumbIcon: state.breadcrumbIcon,
    tabs: state.tabs,
    tabsIcon: state.tabsIcon,
    footer: state.footer,
    themeDrawerVisible: state.themeDrawerVisible,
    setGlobalState: state.setGlobalState
  }));

  return (
    <Drawer
      title='主题配置'
      size={290}
      zIndex={999}
      closable={false}
      mask={{ closable: true }}
      open={themeDrawerVisible}
      className='theme-drawer'
      onClose={() => setGlobalState('themeDrawerVisible', false)}
    >
      {/* layout switching */}
      <Divider className='divider'>
        <Icon className='anticon' icon='ri:layout-line' />
        布局样式
      </Divider>
      <div className='layout-box'>
        <Tooltip placement='top' title='纵向' arrow={true} mouseEnterDelay={0.2}>
          <div
            className={`layout-item layout-vertical mb22 ${layout === 'vertical' && 'layout-active'}`}
            onClick={() => setGlobalState('layout', 'vertical')}
          >
            <div className='layout-dark'></div>
            <div className='layout-container'>
              <div className='layout-light'></div>
              <div className='layout-content'></div>
            </div>
            {layout === 'vertical' && <Icon className='anticon' icon='ri:checkbox-circle-fill' />}
          </div>
        </Tooltip>
        <Tooltip placement='top' title='经典' arrow={true} mouseEnterDelay={0.2}>
          <div
            className={`layout-item layout-classic mb22 ${layout === 'classic' && 'layout-active'}`}
            onClick={() => setGlobalState('layout', 'classic')}
          >
            <div className='layout-dark'></div>
            <div className='layout-container'>
              <div className='layout-light'></div>
              <div className='layout-content'></div>
            </div>
            {layout === 'classic' && <Icon className='anticon' icon='ri:checkbox-circle-fill' />}
          </div>
        </Tooltip>
        <Tooltip placement='top' title='横向' arrow={true} mouseEnterDelay={0.2}>
          <div
            className={`layout-item layout-transverse ${layout === 'transverse' && 'layout-active'}`}
            onClick={() => setGlobalState('layout', 'transverse')}
          >
            <div className='layout-dark'></div>
            <div className='layout-content'></div>
            {layout === 'transverse' && <Icon className='anticon' icon='ri:checkbox-circle-fill' />}
          </div>
        </Tooltip>
        <Tooltip placement='top' title='分栏' arrow={true} mouseEnterDelay={0.2}>
          <div
            className={`layout-item layout-columns ${layout === 'columns' && 'layout-active'}`}
            onClick={() => setGlobalState('layout', 'columns')}
          >
            <div className='layout-dark'></div>
            <div className='layout-light'></div>
            <div className='layout-content'></div>
            {layout === 'columns' && <Icon className='anticon' icon='ri:checkbox-circle-fill' />}
          </div>
        </Tooltip>
      </div>
      <div className='theme-item mt30'>
        <span>
          菜单分割
          <Tooltip title='经典模式下生效'>
            <Icon className='anticon' icon='ri:question-line' />
          </Tooltip>
        </span>
        <Switch disabled={layout !== 'classic'} checked={menuSplit} onChange={value => setGlobalState('menuSplit', value)} />
      </div>
      <div className='theme-item'>
        <span>
          侧边栏反转色
          <Tooltip title='侧边栏颜色变为深色模式'>
            <Icon className='anticon' icon='ri:question-line' />
          </Tooltip>
        </span>
        <Switch checked={siderInverted} onChange={value => setGlobalState('siderInverted', value)} />
      </div>
      <div className='theme-item mb35'>
        <span>
          头部反转色
          <Tooltip title='头部颜色变为深色模式'>
            <Icon className='anticon' icon='ri:question-line' />
          </Tooltip>
        </span>
        <Switch checked={headerInverted} onChange={value => setGlobalState('headerInverted', value)} />
      </div>

      {/* theme settings */}
      <Divider className='divider'>
        <Icon className='anticon' icon='ri:fire-line' />
        全局主题
      </Divider>
      <div className='theme-item'>
        <span>主题颜色</span>
        <Popover placement='left' trigger='click' content={ColorPicker}>
          <label className='primary'></label>
        </Popover>
      </div>
      <div className='theme-item'>
        <span>暗黑模式</span>
        <Switch
          checked={isDark}
          checkedChildren={<span className='dark-icon dark-icon-sun'>🌞</span>}
          unCheckedChildren={<span className='dark-icon dark-icon-moon'>🌛</span>}
          onChange={value => setGlobalState('isDark', value)}
        />
      </div>
      <div className='theme-item'>
        <span>灰色模式</span>
        <Switch
          checked={isGrey}
          onChange={value => {
            if (isWeak) setGlobalState('isWeak', false);
            setGlobalState('isGrey', value);
          }}
        />
      </div>
      <div className='theme-item'>
        <span>色弱模式</span>
        <Switch
          checked={isWeak}
          onChange={value => {
            if (isGrey) setGlobalState('isGrey', false);
            setGlobalState('isWeak', value);
          }}
        />
      </div>
      <div className='theme-item'>
        <span>快乐模式</span>
        <Switch checked={isHappy} onChange={value => setGlobalState('isHappy', value)} />
      </div>
      <div className='theme-item'>
        <span>紧凑主题</span>
        <Switch checked={compactAlgorithm} onChange={value => setGlobalState('compactAlgorithm', value)} />
      </div>
      <div className='theme-item mb35'>
        <span>圆角大小</span>
        <InputNumber
          min={1}
          max={20}
          style={{ width: 80 }}
          defaultValue={borderRadius}
          formatter={value => `${value}px`}
          parser={value => (value ? value!.replace('px', '') : 6) as number}
          onChange={value => {
            const newValue = value || 6;
            setGlobalState('borderRadius', newValue);
          }}
        />
      </div>

      {/* interface settings */}
      <Divider className='divider'>
        <Icon className='anticon' icon='ri:settings-line' />
        界面设置
      </Divider>
      <div className='theme-item'>
        <span>菜单折叠</span>
        <Switch checked={isCollapse} onChange={value => setGlobalState('isCollapse', value)} />
      </div>
      <div className='theme-item'>
        <span>菜单手风琴</span>
        <Switch checked={accordion} onChange={value => setGlobalState('accordion', value)} />
      </div>
      <div className='theme-item'>
        <span>水印</span>
        <Switch checked={watermark} onChange={value => setGlobalState('watermark', value)} />
      </div>
      <div className='theme-item'>
        <span>面包屑</span>
        <Switch checked={breadcrumb} onChange={value => setGlobalState('breadcrumb', value)} />
      </div>
      <div className='theme-item'>
        <span>面包屑图标</span>
        <Switch checked={breadcrumbIcon} onChange={value => setGlobalState('breadcrumbIcon', value)} />
      </div>
      <div className='theme-item'>
        <span>标签栏</span>
        <Switch checked={tabs} onChange={value => setGlobalState('tabs', value)} />
      </div>
      <div className='theme-item'>
        <span>标签栏图标</span>
        <Switch checked={tabsIcon} onChange={value => setGlobalState('tabsIcon', value)} />
      </div>
      <div className='theme-item'>
        <span>页脚</span>
        <Switch checked={footer} onChange={value => setGlobalState('footer', value)} />
      </div>
    </Drawer>
  );
};

export default ThemeDrawer;
