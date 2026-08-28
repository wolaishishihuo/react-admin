import { useContext } from 'react';
import { RefreshContext } from '@/context/Refresh';
import IconButton from './IconButton';

const RefreshButton: React.FC = () => {
  const { refresh } = useContext(RefreshContext);

  return <IconButton icon='ri:refresh-line' className='refresh-btn lt-sm:!hidden' onClick={refresh} />;
};

export default RefreshButton;
