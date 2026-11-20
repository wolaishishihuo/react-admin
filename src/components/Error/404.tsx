import './index.css';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

import { HOME_URL } from '@/config';

const NotFound = () => {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate(HOME_URL, { replace: true });
  }

  return (
    <Result
      className='error-page'
      status='404'
      title='404'
      subTitle='抱歉，您访问的页面不存在。'
      extra={
        <Button type='primary' onClick={handleBack}>
          返回
        </Button>
      }
    />
  );
};

export default NotFound;
