import { Watermark } from 'antd';
import type { ReactNode } from 'react';

import { useGlobalStore, useUserStore } from '@/stores';

interface LayoutWatermarkProps {
  /** 受水印包裹的布局内容 */
  children: ReactNode;
}

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE || 'React Admin';

/**
 * antd 6 Watermark crashes with InvalidStateError when `content` is empty
 * (`drawImage` on a 0×0 canvas). Skip the component when the watermark is off,
 * and pin mark size so measureText cannot produce a zero canvas.
 */
const LayoutWatermark = (props: LayoutWatermarkProps) => {
  const { children } = props;
  const watermark = useGlobalStore(state => state.watermark);
  const userName = useUserStore(state => state.userInfo.name);

  if (!watermark) {
    return <div className='watermark-content'>{children}</div>;
  }

  const content = userName ? [APP_TITLE, userName] : [APP_TITLE];

  return (
    <Watermark
      className='watermark-content'
      zIndex={1001}
      inherit={false}
      width={120}
      height={64}
      content={content}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      {children}
    </Watermark>
  );
};

export default LayoutWatermark;
