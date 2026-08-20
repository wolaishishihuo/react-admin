// import api from '@/utils/http';                   // 切远程后端时与下方注释行一并启用
// import { PORT1 } from '@/api/config/servicePort';
// import { type AuthState } from '@/stores/interface';
import authMenuList from '@/assets/json/authMenuList.json';
import { type LoginUserInfo, type ReqLogin, type ResLogin } from '@/types';

/** 模拟网络延迟 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 用户登录（本地 mock：任意账号密码均可登录；切远程后端改用注释行）
export const loginApi = async (params: ReqLogin): Promise<ResLogin> => {
  await sleep(300);
  return { token: `mock-token-${params.username}`, userInfo: { name: params.username } };
  // return api.post<ResLogin>({ url: PORT1 + `/login`, data: params });
};

// 冷启动会话校验：由后端按 token 回答"我是谁"，返回 null 表示会话已失效
// （DevTools 设 mockUserInfoFail=1 模拟请求失败走重试视图，设 mockSessionExpired=1 模拟会话失效走登出）
// 切远程改用注释行；真实后端从请求头取 token，token 入参仅 mock 用
export const getUserInfoApi = async (token: string): Promise<LoginUserInfo | null> => {
  await sleep(300);
  if (localStorage.getItem('mockUserInfoFail') === '1') throw new Error('模拟用户信息请求失败');
  if (localStorage.getItem('mockSessionExpired') === '1') return null;
  const name = token.replace(/^mock-token-/, '');
  return name ? { name } : null;
  // return api.get<LoginUserInfo>({ url: PORT1 + `/user/info` });
};

// 获取菜单列表（本地数据 + 模拟远程：600ms 延迟 + localStorage 失败开关；切远程改用注释行，返回同为数组，消费点零改）
// （DevTools 设 mockMenuFail=1 刷新即触发失败、删除即恢复），用于验证 loading 门 / 防误登出 / 失败兜底视图
export const getAuthMenuListApi = async () => {
  await sleep(600);
  if (localStorage.getItem('mockMenuFail') === '1') throw new Error('模拟菜单请求失败');
  return authMenuList.data;
  // return api.get<AuthState['authMenuList']>({ url: PORT1 + `/menu/list` });
};

// 用户退出登录（本地 mock 直接生效；切远程改用注释行，服务端失败静默、客户端登出始终生效）
export const logoutApi = async () => {
  await sleep(200);
  // return api.post({ url: PORT1 + `/logout`, showErrorMessage: false });
};
