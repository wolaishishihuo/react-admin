import './form-modal.less';

import type { CSSProperties } from 'react';

export const formModalClassName = 'system-form-modal';

export const formModalStyles: Record<'container' | 'header' | 'body' | 'footer', CSSProperties> = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  header: { flexShrink: 0 },
  body: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto'
  },
  footer: { flexShrink: 0 }
};
