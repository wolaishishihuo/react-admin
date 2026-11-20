import { afterEach, describe, expect, it } from 'vitest';

import { showFullScreenLoading, tryHideFullScreenLoading } from '@/components/Loading/fullScreen';

describe('fullScreen loading lifecycle', () => {
  afterEach(() => {
    tryHideFullScreenLoading();
    tryHideFullScreenLoading();
    document.getElementById('loading')?.remove();
  });

  it('mounts once for concurrent requests and cleanly unmounts when all finish', () => {
    showFullScreenLoading();
    showFullScreenLoading();

    expect(document.querySelectorAll('#loading')).toHaveLength(1);

    tryHideFullScreenLoading();
    expect(document.getElementById('loading')).not.toBeNull();

    tryHideFullScreenLoading();
    expect(document.getElementById('loading')).toBeNull();
  });

  it('ignores extra hide calls without throwing', () => {
    expect(() => tryHideFullScreenLoading()).not.toThrow();
    showFullScreenLoading();
    tryHideFullScreenLoading();
    expect(() => tryHideFullScreenLoading()).not.toThrow();
  });
});
