import { createRoot, type Root } from 'react-dom/client';

import { Loading } from './index';

let needLoadingRequestCount = 0;
let loadingRoot: Root | null = null;
let loadingDom: HTMLDivElement | null = null;

/**
 * @description Show Loading
 */
export const showFullScreenLoading = () => {
  if (needLoadingRequestCount === 0) {
    const dom = document.createElement('div');
    dom.setAttribute('id', 'loading');
    document.body.appendChild(dom);
    loadingDom = dom;
    loadingRoot = createRoot(dom);
    loadingRoot.render(<Loading />);
  }
  needLoadingRequestCount++;
};

/**
 * @description Hide Loading
 */
export const tryHideFullScreenLoading = () => {
  if (needLoadingRequestCount <= 0) return;
  needLoadingRequestCount--;
  if (needLoadingRequestCount === 0) {
    loadingRoot?.unmount();
    loadingRoot = null;
    loadingDom?.remove();
    loadingDom = null;
  }
};
