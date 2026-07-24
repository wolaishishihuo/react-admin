import { addCollection } from '@iconify/react/offline';
import riLocal from './ri-local.json';

/** ri 离线图标子集注册（main.tsx 首行加载，全项目统一 offline 入口） */
addCollection(riLocal as Parameters<typeof addCollection>[0]);
