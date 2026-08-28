import { createFileRoute, redirect } from '@tanstack/react-router';

/** 访问 /list 时落到列表页。不要写 staticData，否则侧边栏会多出一项空菜单。 */
export const Route = createFileRoute('/(admin)/list/')({
  beforeLoad: () => {
    throw redirect({ to: '/list/useProTable' });
  }
});
