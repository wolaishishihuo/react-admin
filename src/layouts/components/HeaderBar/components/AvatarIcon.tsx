import { Icon as SvgIcon } from '@iconify/react/offline';
import { type MenuProps, Dropdown, Avatar } from 'antd';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutApi } from '@/api/modules/login';
import avatar from '@/assets/images/avatar.png';
import { HOME_URL, LOGIN_URL } from '@/config';
import { modal, message } from '@/hooks/useMessage';
import { setToken, setAuthMenuList, useUserStore } from '@/stores';
import InfoModal, { type InfoModalRef } from './InfoModal';
import PasswordModal, { type PasswordModalRef } from './PasswordModal';

const AvatarIcon: React.FC = () => {
  const navigate = useNavigate();

  const userInfo = useUserStore(state => state.userInfo);

  const passRef = useRef<PasswordModalRef>(null);
  const infoRef = useRef<InfoModalRef>(null);

  const logout = () => {
    modal.confirm({
      title: '温馨提示 🧡',
      icon: <SvgIcon icon='ri:error-warning-line' className='anticon text-22px text-warning' />,
      content: '是否确认退出登录？',
      okText: '确认',
      cancelText: '取消',
      mask: { closable: true },
      onOk: async () => {
        // 登出：接口失败也清本地态并跳登录
        try {
          await logoutApi();
        } finally {
          setToken('');
          setAuthMenuList([]);
          navigate(LOGIN_URL, { replace: true });
          message.success('退出登录成功！');
        }
      }
    });
  };

  const items: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className='dropdown-user'>
          <img className='dropdown-user-avatar' src={avatar} alt='avatar' />
          <span className='dropdown-user-name'>{userInfo.name}</span>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      key: '1',
      label: <span>首页</span>,
      icon: <SvgIcon className='text-16px' icon='ri:home-smile-2-line' />,
      onClick: () => navigate(HOME_URL)
    },
    {
      key: '2',
      label: <span>个人信息</span>,
      icon: <SvgIcon className='text-16px' icon='ri:user-3-line' />,
      onClick: () => infoRef.current?.showModal({ name: 'hooks' })
    },
    {
      key: '3',
      label: <span>修改密码</span>,
      icon: <SvgIcon className='text-16px' icon='ri:lock-password-line' />,
      onClick: () => passRef.current?.showModal({ name: 'hooks' })
    },
    {
      type: 'divider'
    },
    {
      key: '4',
      label: <span>退出登录</span>,
      icon: <SvgIcon className='text-16px' icon='ri:logout-box-r-line' />,
      onClick: logout
    }
  ];

  return (
    <React.Fragment>
      {/* bottomRight：面板固定 240px 且触发器贴视口右缘，bottom 居中对齐会溢出触发 antd 避让位移，箭头（钉在面板中心）随之脱靶 */}
      <Dropdown menu={{ items }} trigger={['click']} placement='bottomRight' arrow classNames={{ root: 'avatar-dropdown' }}>
        <Avatar className='cursor-pointer' size={34} src={avatar} />
      </Dropdown>
      <InfoModal ref={infoRef} />
      <PasswordModal ref={passRef} />
    </React.Fragment>
  );
};

export default AvatarIcon;
