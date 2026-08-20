import { Icon as SvgIcon } from '@iconify/react/offline';
import { type MenuProps, Dropdown, Avatar } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import avatar from '@/assets/images/avatar.png';
import { modal, message } from '@/app/feedback';
import { logoutSession } from '@/features/auth/session';
import { authUserQueryOptions } from '@/features/auth/queries';
import { HOME_PATH } from '@/features/navigation/menu-normalize';
import { navigateTo } from '@/router/router-ref';
import { getToken } from '@/stores/modules/session.store';
import InfoModal, { type InfoModalRef } from './InfoModal';
import PasswordModal, { type PasswordModalRef } from './PasswordModal';

export default function AvatarIcon() {
  const { data: userInfo } = useQuery({
    ...authUserQueryOptions(),
    enabled: Boolean(getToken())
  });
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
        await logoutSession();
        message.success('退出登录成功！');
      }
    });
  };

  const items: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className='dropdown-user'>
          <img className='dropdown-user-avatar' src={avatar} alt='avatar' />
          <span className='dropdown-user-name'>{userInfo?.name}</span>
        </div>
      ),
      disabled: true
    },
    { type: 'divider' },
    {
      key: '1',
      label: <span>首页</span>,
      icon: <SvgIcon className='text-16px' icon='ri:home-smile-2-line' />,
      onClick: () => void navigateTo(HOME_PATH)
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
    { type: 'divider' },
    {
      key: '4',
      label: <span>退出登录</span>,
      icon: <SvgIcon className='text-16px' icon='ri:logout-box-r-line' />,
      onClick: logout
    }
  ];

  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} placement='bottomRight' arrow classNames={{ root: 'avatar-dropdown' }}>
        <Avatar className='cursor-pointer' size={34} src={avatar} />
      </Dropdown>
      <InfoModal ref={infoRef} />
      <PasswordModal ref={passRef} />
    </>
  );
}
