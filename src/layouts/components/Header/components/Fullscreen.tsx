import { useFullscreen } from 'ahooks';

import IconButton from './IconButton';

const Fullscreen = () => {
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(() => document.body);

  return (
    <IconButton
      icon={isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'}
      className={`${isFullscreen ? 'exit-full-screen-btn' : 'full-screen-btn'} max-md:hidden`}
      onClick={toggleFullscreen}
    />
  );
};

export default Fullscreen;
