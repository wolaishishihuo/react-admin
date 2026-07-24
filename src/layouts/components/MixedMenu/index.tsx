import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon as SvgIcon } from '@iconify/react/offline';
import { useThrottleFn } from 'ahooks';
import { Icon } from '@/components/Icon';
import { type RouteObjectType } from '@/routers/interface';
import { useAuthStore } from '@/stores';
import { getRootMenuPath } from '@/utils';
import './index.less';

/** 递归取第一个可导航叶子 */
const findFirstLeaf = (item: RouteObjectType): RouteObjectType => {
  return item.children?.length ? findFirstLeaf(item.children[0]) : item;
};

// 横向滚动步进/节流参数
const BUTTON_SCROLL_DISTANCE = 200;
const WHEEL_SLOW_STEP = 30;
const WHEEL_FAST_STEP = 35;
const WHEEL_FAST_THRESHOLD = 100;

const MixedMenu: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showMenuList = useAuthStore(state => state.showMenuList);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  // 一级选中项（菜单树顶层祖先）
  const activePath = useMemo(() => getRootMenuPath(showMenuList, pathname), [pathname, showMenuList]);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll({ left: el.scrollLeft > 0, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
  };

  // 容器或菜单变化时刷新滚动按钮显隐
  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => observer.disconnect();
  }, [showMenuList]);

  const scrollBy = (distance: number) => scrollRef.current?.scrollBy({ left: distance, behavior: 'smooth' });

  const { run: handleWheel } = useThrottleFn(
    (e: React.WheelEvent) => {
      const step = Math.abs(e.deltaY) > WHEEL_FAST_THRESHOLD ? WHEEL_FAST_STEP : WHEEL_SLOW_STEP;
      scrollBy(e.deltaY > 0 ? step : -step);
    },
    { wait: 16 }
  );

  const handleClick = (item: RouteObjectType) => {
    const target = findFirstLeaf(item);
    if (target.meta?.isLink) window.open(target.meta.isLink, '_blank');
    navigate(target.path!);
  };

  return (
    <div className='mixed-menu'>
      {canScroll.left && (
        <div className='scroll-btn toolbar-icon-btn' onClick={() => scrollBy(-BUTTON_SCROLL_DISTANCE)}>
          <SvgIcon icon='ri:arrow-left-s-line' />
        </div>
      )}
      <div className='menu-scroll scrollbar-hide' ref={scrollRef} onScroll={updateScrollState} onWheel={handleWheel}>
        {showMenuList.map(item => (
          <div
            key={item.path}
            className={`menu-item ${activePath === item.path ? 'menu-item-active' : ''}`}
            onClick={() => handleClick(item)}
          >
            <Icon name={item.meta!.icon!} />
            <span className='title'>{item.meta?.title}</span>
          </div>
        ))}
      </div>
      {canScroll.right && (
        <div className='scroll-btn toolbar-icon-btn' onClick={() => scrollBy(BUTTON_SCROLL_DISTANCE)}>
          <SvgIcon icon='ri:arrow-right-s-line' />
        </div>
      )}
    </div>
  );
};

export default MixedMenu;
