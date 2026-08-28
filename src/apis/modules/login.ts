import { ReqLogin, ResLogin, ResultData } from '@/apis/interface/index';
import authButtonList from '@/assets/json/authButtonList.json';
import authMenuList from '@/assets/json/authMenuList.json';

/** md5('123456') — matches the login form hash */
export const MOCK_LOGIN_PASSWORD_MD5 = 'e10adc3949ba59abbe56e057f20f883e';
export const MOCK_LOGIN_USERS = ['admin', 'user'] as const;

const wait = (ms = 200) =>
  import.meta.env.MODE === 'test' ? Promise.resolve() : new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * @name AuthModule
 */
export const loginApi = async (params: ReqLogin): Promise<ResultData<ResLogin>> => {
  await wait();
  const isValidUser = (MOCK_LOGIN_USERS as readonly string[]).includes(params.username);
  if (!isValidUser || params.password !== MOCK_LOGIN_PASSWORD_MD5) {
    return Promise.reject({ code: 500, msg: '用户名或密码错误' });
  }
  return {
    code: 200,
    data: { access_token: `mock_token_${params.username}` },
    msg: '成功'
  };
};

export const getAuthMenuListApi = () => {
  return authMenuList;
};

export const getAuthButtonListApi = () => {
  return authButtonList;
};

export const logoutApi = async (): Promise<ResultData<null>> => {
  await wait(100);
  return { code: 200, data: null, msg: '成功' };
};
