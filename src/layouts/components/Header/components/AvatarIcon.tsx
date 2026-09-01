import { Avatar, Dropdown, type MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';

import { fetchLogout } from '@/apis/modules/login';
import { queryClient } from '@/apis/query';
import avatar from '@/assets/images/avatar.png';
import { Icon } from '@/components/Icon';
import { LOGIN_URL } from '@/config';
import { message, modal } from '@/hooks/useMessage';
import { useAuthStore, useUserStore } from '@/stores';

const AvatarIcon = () => {
  const navigate = useNavigate();
  const setToken = useUserStore(state => state.setToken);
  const setRefreshToken = useUserStore(state => state.setRefreshToken);
  const setAuthMenuList = useAuthStore(state => state.setAuthMenuList);
  const setAuthButtons = useAuthStore(state => state.setAuthButtons);

  const logout = () => {
    modal.confirm({
      title: '温馨提示 🧡',
      icon: <Icon icon='ri:error-warning-line' className='anticon text-22px text-warning' />,
      content: '是否确认退出登录？',
      okText: '确认',
      cancelText: '取消',
      mask: { closable: true },
      onOk: async () => {
        await fetchLogout();
        queryClient.clear();
        setToken('');
        setRefreshToken('');
        setAuthMenuList([]);
        setAuthButtons([]);
        navigate(LOGIN_URL, { replace: true });
        message.success('退出登录成功！');
      }
    });
  };

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: <span className='dropdown-item'>退出登录</span>,
      icon: <Icon className='text-14px' icon='ri:logout-box-r-line' />,
      onClick: logout
    }
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement='bottom' arrow>
      <Avatar className='avatar' size={34} src={avatar} />
    </Dropdown>
  );
};

export default AvatarIcon;
