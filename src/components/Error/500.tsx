import './index.css';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

import { HOME_URL } from '@/config';

const NotNetwork = () => {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate(HOME_URL, { replace: true });
  }

  return (
    <Result
      className='error-page'
      status='500'
      title='500'
      subTitle='抱歉，服务器出了点问题。'
      extra={
        <Button type='primary' onClick={handleBack}>
          返回
        </Button>
      }
    />
  );
};

export default NotNetwork;
