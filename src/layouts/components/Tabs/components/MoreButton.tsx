import {
  CloseCircleOutlined,
  ColumnWidthOutlined,
  ExpandOutlined,
  ReloadOutlined,
  SwitcherOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import { CSSProperties, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconFont } from '@/components/Icon';
import { HOME_URL } from '@/config';
import { RefreshContext } from '@/context/Refresh';
import { useGlobalStore, useTabsStore } from '@/stores';

interface MoreButtonProps {
  path: string;
}

const style: CSSProperties = { fontSize: '14px' };

const MoreButton: React.FC<MoreButtonProps> = ({ path }) => {
  const navigate = useNavigate();
  const setGlobalState = useGlobalStore(state => state.setGlobalState);
  const { removeTab, closeTabsOnSide, closeMultipleTab } = useTabsStore(state => ({
    removeTab: state.removeTab,
    closeTabsOnSide: state.closeTabsOnSide,
    closeMultipleTab: state.closeMultipleTab
  }));

  const { refresh } = useContext(RefreshContext);

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span>刷新</span>,
      icon: <ReloadOutlined style={style} />,
      onClick: refresh
    },
    {
      key: '2',
      label: <span>最大化</span>,
      icon: <ExpandOutlined style={style} />,
      onClick: () => setGlobalState('maximize', true)
    },
    {
      type: 'divider'
    },

    {
      key: '3',
      label: <span>关闭当前</span>,
      icon: <CloseCircleOutlined style={style} />,
      onClick: () => removeTab({ path, isCurrent: true })
    },
    {
      key: '4',
      label: <span>关闭左侧</span>,
      icon: <VerticalRightOutlined style={style} />,
      onClick: () => closeTabsOnSide({ path, type: 'left' })
    },
    {
      key: '5',
      label: <span>关闭右侧</span>,
      icon: <VerticalLeftOutlined style={style} />,
      onClick: () => closeTabsOnSide({ path, type: 'right' })
    },
    {
      type: 'divider'
    },
    {
      key: '6',
      label: <span>关闭其它</span>,
      icon: <ColumnWidthOutlined style={style} />,
      onClick: () => closeMultipleTab({ path })
    },
    {
      key: '7',
      label: <span>关闭所有</span>,
      icon: <SwitcherOutlined style={style} />,
      onClick: () => {
        closeMultipleTab({});
        navigate(HOME_URL);
      }
    }
  ];

  return (
    <div className='more-button'>
      <Dropdown menu={{ items }} placement='bottomRight' arrow={true} trigger={['click']}>
        <div className='more-button-item'>
          <IconFont style={{ fontSize: 22 }} type='icon-xiala' />
        </div>
      </Dropdown>
    </div>
  );
};

export default MoreButton;
