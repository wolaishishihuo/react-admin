import { Watermark } from 'antd';
import type { ReactNode } from 'react';

import { useGlobalStore } from '@/stores';

interface LayoutWatermarkProps {
  /** 受水印包裹的布局内容 */
  children: ReactNode;
}

const WATERMARK_CONTENT = ['React Admin', 'wolaishishihuo'];

/**
 * antd 6 Watermark crashes with InvalidStateError when `content` is empty
 * (`drawImage` on a 0×0 canvas). Skip the component when the watermark is off,
 * and pin mark size so measureText cannot produce a zero canvas.
 */
const LayoutWatermark = (props: LayoutWatermarkProps) => {
  const { children } = props;
  const watermark = useGlobalStore(state => state.watermark);

  if (!watermark) {
    return <div className='watermark-content'>{children}</div>;
  }

  return (
    <Watermark
      className='watermark-content'
      zIndex={1001}
      inherit={false}
      width={120}
      height={64}
      content={WATERMARK_CONTENT}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      {children}
    </Watermark>
  );
};

export default LayoutWatermark;
