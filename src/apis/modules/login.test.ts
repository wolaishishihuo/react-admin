import md5 from 'md5';
import { describe, expect, it } from 'vitest';

import { loginApi, logoutApi, MOCK_LOGIN_PASSWORD_MD5 } from './login';

describe('loginApi mock', () => {
  it('returns a token for admin / 123456', async () => {
    const res = await loginApi({ username: 'admin', password: md5('123456') });
    expect(res.code).toBe(200);
    expect(res.data.access_token).toBe('mock_token_admin');
    expect(MOCK_LOGIN_PASSWORD_MD5).toBe(md5('123456'));
  });

  it('returns a token for user / 123456', async () => {
    const res = await loginApi({ username: 'user', password: MOCK_LOGIN_PASSWORD_MD5 });
    expect(res.data.access_token).toBe('mock_token_user');
  });

  it('rejects an invalid password', async () => {
    await expect(loginApi({ username: 'admin', password: md5('wrong') })).rejects.toMatchObject({
      code: 500,
      msg: '用户名或密码错误'
    });
  });

  it('rejects an unknown username', async () => {
    await expect(loginApi({ username: 'nobody', password: MOCK_LOGIN_PASSWORD_MD5 })).rejects.toMatchObject({
      msg: '用户名或密码错误'
    });
  });
});

describe('logoutApi mock', () => {
  it('resolves successfully', async () => {
    const res = await logoutApi();
    expect(res.code).toBe(200);
  });
});
