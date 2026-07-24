import ReactDOM from 'react-dom/client';
import { Loading } from './index';

let needLoadingRequestCount = 0;

/** 显示全屏 Loading（计数叠加，配对调用） */
export const showFullScreenLoading = () => {
  if (needLoadingRequestCount === 0) {
    let dom = document.createElement('div');
    dom.setAttribute('id', 'loading');
    document.body.appendChild(dom);
    ReactDOM.createRoot(dom).render(<Loading />);
  }
  needLoadingRequestCount++;
};

/** 隐藏全屏 Loading（计数归零时才移除） */
export const tryHideFullScreenLoading = () => {
  if (needLoadingRequestCount <= 0) return;
  needLoadingRequestCount--;
  if (needLoadingRequestCount === 0) {
    document.body.removeChild(document.getElementById('loading') as HTMLElement);
  }
};
