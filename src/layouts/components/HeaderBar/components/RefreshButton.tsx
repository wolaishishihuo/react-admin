import { useLocation } from 'react-router-dom';
import { refreshKeepAlive } from '@/utils/keepAlive';
import IconButton from './IconButton';

const RefreshButton: React.FC = () => {
  const location = useLocation();

  return (
    <IconButton
      icon='ri:refresh-line'
      className='refresh-btn lt-sm:!hidden'
      onClick={() => refreshKeepAlive(location.pathname + location.search)}
    />
  );
};

export default RefreshButton;
