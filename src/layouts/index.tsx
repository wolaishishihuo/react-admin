import ThemeDrawer from '@/layouts/components/ThemeDrawer';
import { useGlobalStore } from '@/stores';

import LayoutWatermark from './components/LayoutWatermark';
import LayoutClassic from './LayoutClassic';
import LayoutColumns from './LayoutColumns';
import LayoutTransverse from './LayoutTransverse';
import LayoutVertical from './LayoutVertical';

const LAYOUT_COMPONENTS = {
  vertical: LayoutVertical,
  classic: LayoutClassic,
  transverse: LayoutTransverse,
  columns: LayoutColumns
};

const LayoutIndex = () => {
  const layout = useGlobalStore(state => state.layout);
  const ActiveLayout = LAYOUT_COMPONENTS[layout];

  return (
    <LayoutWatermark>
      <ActiveLayout />
      <ThemeDrawer />
    </LayoutWatermark>
  );
};

export default LayoutIndex;
