import { CheckCircleFilled, CloseCircleOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import type { FormInstance, FormProps } from 'antd/es/form';
import md5 from 'md5';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReqLogin } from '@/apis/interface';
import { loginApi } from '@/apis/modules/login';
import { HOME_URL } from '@/config';
import { message, notification } from '@/hooks/useMessage';
import usePermissions from '@/hooks/usePermissions';
import { useTabsStore, useUserStore } from '@/stores';
import { getTimeState } from '@/utils';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useUserStore(state => state.setToken);
  const setTabsList = useTabsStore(state => state.setTabsList);

  const { initPermissions } = usePermissions();

  const formRef = React.useRef<FormInstance>(null);
  const [loading, setLoading] = useState(false);

  const key = 'loading';

  const onFinish = async (values: ReqLogin) => {
    try {
      // loading
      setLoading(true);
      message.open({ key, type: 'loading', content: '登录中...' });

      // user login
      const { data } = await loginApi({ ...values, password: md5(values.password) });
      setToken(data.access_token);

      // clear last account tabs
      setTabsList([]);

      // init permissions
      await initPermissions(data.access_token);

      // prompt for successful login and redirect
      notification.success({
        title: getTimeState(),
        description: '欢迎登录 Hooks-Admin',
        icon: <CheckCircleFilled style={{ color: '#73d13d' }} />
      });

      // navigate to home
      navigate(HOME_URL);
    } catch (error) {
      message.error((error as { msg?: string })?.msg || '登录失败');
    } finally {
      setLoading(false);
      message.destroy(key);
    }
  };

  const onFinishFailed: FormProps['onFinishFailed'] = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  const onReset = () => {
    formRef.current?.resetFields();
  };

  useEffect(() => {
    document.onkeydown = event => {
      if (event.code === 'Enter') {
        event.preventDefault();
        formRef.current?.submit();
      }
    };
    return () => {
      document.onkeydown = () => {};
    };
  }, []);
  return (
    <div className='login-form-content'>
      <Form name='login' size='large' autoComplete='off' ref={formRef} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item name='username' rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input prefix={<UserOutlined />} placeholder='User：admin / user' data-testid='login-username' />
        </Form.Item>
        <Form.Item name='password' rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password prefix={<LockOutlined />} placeholder='Password：123456' data-testid='login-password' />
        </Form.Item>
        <Form.Item className='login-form-button'>
          <Button shape='round' icon={<CloseCircleOutlined />} onClick={onReset}>
            Reset
          </Button>
          <Button
            type='primary'
            shape='round'
            icon={<UserOutlined />}
            loading={loading}
            htmlType='submit'
            data-testid='login-submit'
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
