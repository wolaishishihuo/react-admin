import { addCollection } from '@iconify/react/offline';
import riIcons from '@iconify-json/ri/icons.json';

/** 离线注册完整 Remix Icon。任意 `ri:*` 都可渲染，不走 CDN。 */
addCollection(riIcons as Parameters<typeof addCollection>[0]);
