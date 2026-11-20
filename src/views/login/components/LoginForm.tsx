import { Button, Form, Input } from 'antd';
import md5 from 'md5';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ReqLogin } from '@/apis/interface';
import { fetchLogin } from '@/apis/modules/login';
import { Icon } from '@/components/Icon';
import { HOME_URL } from '@/config';
import { message, notification } from '@/hooks/useMessage';
import { initPermissions } from '@/routers/helper/initPermissions';
import { useTabsStore, useUserStore } from '@/stores';
import { getTimeState } from '@/utils';

const LOGIN_LOADING_KEY = 'login-loading';

const LoginForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<ReqLogin>();
  const setToken = useUserStore(state => state.setToken);
  const setRefreshToken = useUserStore(state => state.setRefreshToken);
  const setTabsList = useTabsStore(state => state.setTabsList);

  const [loading, setLoading] = useState(false);

  async function onFinish(values: ReqLogin) {
    if (loading) return;
    try {
      setLoading(true);
      message.open({ key: LOGIN_LOADING_KEY, type: 'loading', content: '登录中...' });

      const data = await fetchLogin({ ...values, password: md5(values.password) });
      const accessToken = data.access_token || data.accessToken || '';
      setToken(accessToken);
      setRefreshToken(data.refreshToken || '');

      // clear last account tabs
      setTabsList([]);

      // init permissions
      await initPermissions(accessToken);

      notification.success({
        title: getTimeState(),
        description: `欢迎登录 ${import.meta.env.VITE_GLOB_APP_TITLE}`,
        icon: <Icon icon='ri:checkbox-circle-fill' className='text-success' />
      });

      navigate(HOME_URL);
    } catch (error) {
      // HTTP 层与 initPermissions 已提示业务错误；开发期保留日志便于排查代码异常
      if (import.meta.env.DEV) console.error(error);
    } finally {
      setLoading(false);
      message.destroy(LOGIN_LOADING_KEY);
    }
  }

  function onReset() {
    form.resetFields();
  }

  return (
    <div className='login-form-content'>
      <Form form={form} name='login' size='large' autoComplete='off' onFinish={onFinish}>
        <Form.Item name='username' rules={[{ required: true, message: '请输入用户名' }]}>
          <Input prefix={<Icon icon='ri:user-line' />} placeholder='用户名：admin / user' />
        </Form.Item>
        <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password prefix={<Icon icon='ri:lock-line' />} placeholder='密码：123456' />
        </Form.Item>
        <Form.Item className='login-form-button'>
          <Button shape='round' icon={<Icon icon='ri:close-circle-line' />} onClick={onReset}>
            重置
          </Button>
          <Button type='primary' shape='round' icon={<Icon icon='ri:user-line' />} loading={loading} htmlType='submit'>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
