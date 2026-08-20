import { Icon as SvgIcon } from '@iconify/react/offline';
import { Button, Form, Input } from 'antd';
import type { FormInstance, FormProps } from 'antd/es/form';
import { useEffect, useRef, useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import { loginApi } from '@/features/auth/api';
import { establishSession } from '@/features/auth/session';
import { type ReqLogin } from '@/features/auth/types';
import { HOME_PATH } from '@/features/navigation/menu-normalize';
import { message, notification } from '@/app/feedback';
import { isSafeRedirect } from '@/router/safe-redirect';
import { navigateTo } from '@/router/router-ref';
import { getTimeState } from '../modules/greeting';

export default function LoginForm() {
  const search = useSearch({ strict: false }) as { redirect?: string };

  const formRef = useRef<FormInstance>(null);
  const [loading, setLoading] = useState(false);

  const key = 'loading';

  const onFinish = async (values: ReqLogin) => {
    try {
      setLoading(true);
      message.open({ key, type: 'loading', content: '登录中...' });

      const data = await loginApi(values);
      const user = await establishSession(data);
      if (!user) return;

      const redirect = search.redirect;
      await navigateTo(isSafeRedirect(redirect) ? redirect : HOME_PATH);

      notification.success({
        title: getTimeState(),
        description: '欢迎登录 Hooks Admin',
        icon: <SvgIcon icon='ri:checkbox-circle-fill' className='text-success' />
      });
    } catch {
      // 失败提示由 http 层/路由 errorComponent 兜底
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
      document.onkeydown = () => undefined;
    };
  }, []);

  return (
    <div className='login-form-content'>
      <Form size='large' autoComplete='off' ref={formRef} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item name='username' rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input prefix={<SvgIcon icon='ri:user-line' />} placeholder='User：admin / user' />
        </Form.Item>
        <Form.Item name='password' rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password prefix={<SvgIcon icon='ri:lock-line' />} placeholder='Password：123456' />
        </Form.Item>
        <Form.Item className='login-form-button'>
          <Button shape='round' icon={<SvgIcon icon='ri:close-circle-line' />} onClick={onReset}>
            Reset
          </Button>
          <Button type='primary' shape='round' icon={<SvgIcon icon='ri:user-line' />} loading={loading} htmlType='submit'>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
