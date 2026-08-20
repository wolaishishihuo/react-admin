import { useEffect, useRef, useState } from 'react';

/** 延迟多久才显示 */
const SHOW_DELAY = 10;
/** 一旦显示至少停留多久 */
const MIN_VISIBLE = 500;

/**
 * 加载指示器防闪烁：pending 持续超过 delay 才显示，显示后至少停留 minVisible
 *
 * 两段必须配套：只加最短时长会把 30ms 的加载硬拖成 500ms，只加延迟则挡不住"闪一下就消失"。
 */
const useDelayedVisible = (pending: boolean, delay: number = SHOW_DELAY, minVisible: number = MIN_VISIBLE) => {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (pending) {
      timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delay);
    } else {
      const rest = shownAt.current ? minVisible - (Date.now() - shownAt.current) : 0;
      timer = setTimeout(
        () => {
          shownAt.current = 0;
          setVisible(false);
        },
        Math.max(rest, 0)
      );
    }

    return () => clearTimeout(timer);
  }, [pending, delay, minVisible]);

  return visible;
};

export default useDelayedVisible;
