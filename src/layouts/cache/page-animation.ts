import type { Transition, Variants } from 'motion/react';
import type { PageAnimateMode } from '@/stores/modules/admin-layout.store';

export const PAGE_ANIMATE_MODE_OPTIONS: Array<{ label: string; value: PageAnimateMode }> = [
  { value: 'fade-slide', label: '渐隐滑动' },
  { value: 'fade', label: '渐隐' },
  { value: 'fade-bottom', label: '底部渐入' },
  { value: 'fade-scale', label: '渐隐缩放' },
  { value: 'zoom-fade', label: '缩放渐隐' },
  { value: 'zoom-out', label: '缩放进入' },
  { value: 'none', label: '无动画' }
];

export const pageAnimationVariants: Record<PageAnimateMode, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  'fade-slide': {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 }
  },
  'fade-bottom': {
    initial: { opacity: 0, y: '-10%' },
    animate: { opacity: 1, y: 0 }
  },
  'fade-scale': {
    initial: { opacity: 0, scale: 1.2 },
    animate: { opacity: 1, scale: 1 }
  },
  'zoom-fade': {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 }
  },
  'zoom-out': {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 }
  },
  none: {
    initial: {},
    animate: {}
  }
};

export const pageAnimationTransitions: Record<PageAnimateMode, Transition> = {
  fade: { duration: 0.3, ease: 'easeInOut' },
  'fade-slide': { duration: 0.3, ease: 'easeInOut' },
  'fade-bottom': { duration: 0.3, ease: 'easeInOut' },
  'fade-scale': { duration: 0.28, ease: 'easeInOut' },
  'zoom-fade': { duration: 0.3, ease: 'easeOut' },
  'zoom-out': { duration: 0.15, ease: 'easeOut' },
  none: { duration: 0 }
};

export function resolvePageAnimationMode(options: {
  pageAnimate: boolean;
  pageAnimateMode: PageAnimateMode;
  prefersReducedMotion: boolean | null;
}): PageAnimateMode {
  if (!options.pageAnimate || options.prefersReducedMotion || options.pageAnimateMode === 'none') {
    return 'none';
  }
  return options.pageAnimateMode;
}
