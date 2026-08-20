/**
 * Vite 同源 API mock：提供登录、菜单和用户管理的本地开发/预览闭环。
 * 插件必须先于 proxy 注册，使本地 /api 请求优先由 mock 中间件处理。
 */
import { readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import type { Connect, Plugin } from 'vite';

interface Envelope<T> {
  code: number;
  msg: string;
  data: T;
}

interface UserItem {
  id: string;
  username: string;
  gender: number;
  mobile: string;
  icon: string;
  status: number;
  createTime: string;
}

const MENU_FILE = resolve(process.cwd(), 'src/features/navigation/mock/menu.json');
const ICONS = ['ri:user-3-line', 'ri:star-line', 'ri:apps-line', 'ri:home-smile-2-line', 'ri:table-line'];

function envelope<T>(data: T, code = 200, msg = '成功'): Envelope<T> {
  return { code, msg, data };
}

function sendJson(res: ServerResponse, body: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseJsonBody(raw: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function formatTime(offsetDays = 0) {
  const date = new Date(Date.now() - offsetDays * 86400000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function createSeedUsers(): UserItem[] {
  return Array.from({ length: 46 }, (_, i) => ({
    id: String(i + 1),
    username: `user_${String(i + 1).padStart(2, '0')}`,
    gender: i % 3,
    mobile: `138${String(10000000 + i * 137137).slice(-8)}`,
    icon: ICONS[i % ICONS.length],
    status: i % 5 === 0 ? 0 : 1,
    createTime: formatTime(i)
  }));
}

let users = createSeedUsers();
let nextId = 1000;

function resetUsers() {
  users = createSeedUsers();
  nextId = 1000;
}

function pathnameOf(url = '/') {
  const parsed = new URL(url, 'http://127.0.0.1');
  return parsed.pathname.replace(/\/+$/, '') || '/';
}

function queryOf(url = '/') {
  return new URL(url, 'http://127.0.0.1').searchParams;
}

async function mockMiddleware(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) {
  const method = req.method ?? 'GET';
  const pathname = pathnameOf(req.url);

  if (!pathname.startsWith('/api/')) {
    next();
    return;
  }

  const route = pathname.slice('/api'.length);

  try {
    if (method === 'POST' && route === '/login') {
      await sleep(300);
      const body = parseJsonBody(await readBody(req));
      const username = String(body.username ?? '');
      sendJson(res, envelope({ token: `mock-token-${username}` }));
      return;
    }

    if (method === 'GET' && route === '/user/info') {
      await sleep(300);
      const token = String(req.headers['x-access-token'] ?? '');
      if (!token) {
        sendJson(res, envelope(null, 401, '未授权访问，请重新登录'));
        return;
      }
      const name = token.replace(/^mock-token-/, '');
      const users: Record<string, { id: string; name: string }> = {
        admin: { id: '1', name: 'admin' },
        user: { id: '2', name: 'user' }
      };
      const user = users[name] ?? (name ? { id: name, name } : null);
      sendJson(res, envelope(user, user ? 200 : 401, user ? '成功' : '会话已失效'));
      return;
    }

    if (method === 'GET' && route === '/menu/list') {
      await sleep(600);
      const menu = JSON.parse(readFileSync(MENU_FILE, 'utf8')) as Envelope<unknown>;
      sendJson(res, menu);
      return;
    }

    if (method === 'POST' && route === '/logout') {
      await sleep(200);
      sendJson(res, envelope(null));
      return;
    }

    if (method === 'POST' && route === '/__test__/reset-users') {
      resetUsers();
      sendJson(res, envelope(true));
      return;
    }

    if (method === 'GET' && route === '/user/list') {
      await sleep(300);
      const query = queryOf(req.url);
      const page = Number(query.get('page') ?? 1);
      const limit = Number(query.get('limit') ?? 10);
      const username = query.get('username') ?? '';
      const gender = query.get('gender');
      const status = query.get('status');
      const filtered = users.filter(item => {
        if (username && !item.username.includes(username)) return false;
        if (gender !== null && gender !== '' && item.gender !== Number(gender)) return false;
        if (status !== null && status !== '' && item.status !== Number(status)) return false;
        return true;
      });
      sendJson(res, envelope({ list: filtered.slice((page - 1) * limit, page * limit), total: filtered.length }));
      return;
    }

    if (method === 'GET' && route === '/user/detail') {
      await sleep(300);
      const id = queryOf(req.url).get('id') ?? '';
      sendJson(res, envelope(users.find(item => item.id === id) ?? null));
      return;
    }

    if (method === 'POST' && route === '/user') {
      await sleep(200);
      const body = parseJsonBody(await readBody(req));
      const created: UserItem = {
        id: String(nextId++),
        username: String(body.username ?? ''),
        gender: Number(body.gender ?? 2),
        mobile: String(body.mobile ?? ''),
        icon: String(body.icon ?? ICONS[0]),
        status: Number(body.status ?? 1),
        createTime: formatTime()
      };
      users = [created, ...users];
      sendJson(res, envelope(created));
      return;
    }

    if (method === 'PUT' && route === '/user') {
      await sleep(200);
      const body = parseJsonBody(await readBody(req));
      const id = String(body.id ?? '');
      users = users.map(item => (item.id === id ? { ...item, ...(body as Partial<UserItem>), id } : item));
      sendJson(res, envelope(users.find(item => item.id === id) ?? null));
      return;
    }

    if (method === 'DELETE' && route === '/user') {
      await sleep(200);
      const body = parseJsonBody(await readBody(req));
      const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
      users = users.filter(item => !ids.includes(item.id));
      sendJson(res, envelope(true));
      return;
    }

    next();
  } catch (error) {
    sendJson(res, envelope(null, 500, error instanceof Error ? error.message : 'mock error'), 500);
  }
}

/** 同源闭环 mock，必须挂在 Vite proxy 之前 */
export function createMockPlugin(): Plugin {
  return {
    name: 'hooks-admin-mock',
    configureServer(server) {
      server.middlewares.use(mockMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(mockMiddleware);
    }
  };
}
