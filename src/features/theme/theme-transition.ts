import { flushSync } from 'react-dom';

/** 主题切换过渡动画 */
export const themeTransition = (apply: () => void) => {
  const disable = document.createElement('style');
  disable.textContent = '* { transition: none !important; }';
  document.head.appendChild(disable);
  const cleanup = () => setTimeout(() => disable.remove(), 300);

  if (!document.startViewTransition) {
    apply();
    cleanup();
    return;
  }

  const transition = document.startViewTransition(async () => {
    flushSync(apply);
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  transition.finished.finally(cleanup);
};
