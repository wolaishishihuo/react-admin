import React from 'react';

import ThemeDrawer from '@/layouts/components/ThemeDrawer';
import { useGlobalStore } from '@/stores';

import LayoutWatermark from './components/LayoutWatermark';
import LayoutClassic from './LayoutClassic';
import LayoutColumns from './LayoutColumns';
import LayoutTransverse from './LayoutTransverse';
import LayoutVertical from './LayoutVertical';

const LayoutIndex: React.FC = () => {
  const layout = useGlobalStore(state => state.layout);

  const LayoutComponents = {
    vertical: <LayoutVertical />,
    classic: <LayoutClassic />,
    transverse: <LayoutTransverse />,
    columns: <LayoutColumns />
  };

  return (
    <LayoutWatermark>
      {LayoutComponents[layout]}
      <ThemeDrawer />
    </LayoutWatermark>
  );
};

export default LayoutIndex;
