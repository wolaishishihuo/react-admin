import { Icon as SvgIcon } from '@iconify/react/offline';
import { Button, Form, Input } from 'antd';
import type { FormInstance, FormProps } from 'antd/es/form';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { type ReqLogin } from '@/types';
import { loginApi } from '@/api/modules/login';
import { HOME_URL } from '@/config';
import { message, notification } from '@/hooks/useMessage';
import { setToken, setTabsList } from '@/stores';
import { getTimeState, isSafeRedirect } from '@/utils';
import { initPermissions } from '@/utils/auth';

/** 上次登录身份，用于判断是否换了人 */
const LAST_LOGIN_USER_KEY = 'lastLoginUser';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const formRef = React.useRef<FormInstance>(null);
  const [loading, setLoading] = useState(false);

  const key = 'loading';

  const onFinish = async (values: ReqLogin) => {
    try {
      // 加载中
      setLoading(true);
      message.open({ key, type: 'loading', content: '登录中...' });

      // 用户登录（api 已解包，直接拿业务 data）
      // 只落 token，userInfo 由 initPermissions 统一向后端取，避免两个写入点给出不同快照
      const data = await loginApi(values);
      setToken(data.token);

      // 同一账号重登保留标签与 redirect；换人则清标签且强制回首页，不能把上个账号的页面带过来
      // 接真实后端时把身份换成 userId
      const isSameUser = localStorage.getItem(LAST_LOGIN_USER_KEY) === data.userInfo.name;
      if (!isSameUser) {
        setTabsList([]);
        localStorage.setItem(LAST_LOGIN_USER_KEY, data.userInfo.name);
      }

      // 先把地址切到目标页：此刻 LoginForm 与静态路由仍挂载，navigate 有效，URL 立即变更。
      // 否则 setToken 后路由 gate 会渲染 Loading 并卸载 LoginForm，待权限加载完动态 router 会落在 /login，
      // 闪一帧登录页（react-router v7 下 RouterProvider 首挂即锁定 URL，故必须在卸载前完成跳转）。
      const redirect = searchParams.get('redirect');
      navigate(isSameUser && isSafeRedirect(redirect) ? redirect : HOME_URL);

      // 初始化权限（菜单到位后路由就绪，动态 router 首挂即落在首页）
      await initPermissions(data.token);

      // 登录成功提示
      notification.success({
        title: getTimeState(),
        description: '欢迎登录 Hooks Admin',
        icon: <SvgIcon icon='ri:checkbox-circle-fill' className='text-success' />
      });
    } catch {
      // 失败提示由 http 层/路由 gate 兜底
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
};

export default LoginForm;
