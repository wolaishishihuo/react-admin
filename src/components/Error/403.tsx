import './index.css';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

import { HOME_URL } from '@/config';

const NotAuth = () => {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else navigate(HOME_URL, { replace: true });
  }

  return (
    <Result
      className='error-page'
      status='403'
      title='403'
      subTitle='抱歉，您没有权限访问该页面。'
      extra={
        <Button type='primary' onClick={handleBack}>
          返回
        </Button>
      }
    />
  );
};

export default NotAuth;
