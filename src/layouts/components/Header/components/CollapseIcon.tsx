import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import React from 'react';

import { useGlobalStore } from '@/stores';

const CollapseIcon: React.FC = () => {
  const isCollapse = useGlobalStore(state => state.isCollapse);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  return (
    <React.Fragment>
      {React.createElement(isCollapse ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'collapsed',
        onClick: () => setGlobalState('isCollapse', !isCollapse)
      })}
    </React.Fragment>
  );
};

export default CollapseIcon;
