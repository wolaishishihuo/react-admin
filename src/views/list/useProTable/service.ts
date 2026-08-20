import dayjs from 'dayjs';
import { type ReqUserList, type ResPage, type UserItem } from '@/types';

/** 模拟网络延迟 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ICONS = ['ri:user-3-line', 'ri:star-line', 'ri:apps-line', 'ri:home-smile-2-line', 'ri:table-line'];

/** 本地 mock 数据源（内存增删改查；刷新页面重置） */
let mockUsers: UserItem[] = Array.from({ length: 46 }, (_, i) => ({
  id: String(i + 1),
  username: `user_${String(i + 1).padStart(2, '0')}`,
  gender: i % 3,
  mobile: `138${String(10000000 + i * 137137).slice(-8)}`,
  icon: ICONS[i % ICONS.length],
  status: i % 5 === 0 ? 0 : 1,
  createTime: dayjs().subtract(i, 'day').format('YYYY-MM-DD HH:mm:ss')
}));

let nextId = 1000;

/** 分页查询（对齐后端 { page, limit } → { list, total } 契约） */
export async function fetchUserList({ page = 1, limit = 10, username, gender, status }: ReqUserList): Promise<ResPage<UserItem>> {
  await sleep(300);
  const filtered = mockUsers.filter(
    item =>
      (!username || item.username.includes(username)) &&
      (gender === undefined || item.gender === gender) &&
      (status === undefined || item.status === status)
  );
  return { list: filtered.slice((page - 1) * limit, page * limit), total: filtered.length };
}

/** 按 id 查详情，未命中返回 null */
export async function fetchUserDetail(id: string): Promise<UserItem | null> {
  await sleep(300);
  return mockUsers.find(item => item.id === id) ?? null;
}

export async function createUser(data: Omit<UserItem, 'id' | 'createTime'>) {
  await sleep(200);
  mockUsers = [{ ...data, id: String(nextId++), createTime: dayjs().format('YYYY-MM-DD HH:mm:ss') }, ...mockUsers];
}

export async function updateUser(data: UserItem) {
  await sleep(200);
  mockUsers = mockUsers.map(item => (item.id === data.id ? { ...item, ...data } : item));
}

export async function deleteUsers(ids: string[]) {
  await sleep(200);
  mockUsers = mockUsers.filter(item => !ids.includes(item.id));
}
