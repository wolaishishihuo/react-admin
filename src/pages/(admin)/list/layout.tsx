import { Outlet, createFileRoute } from '@tanstack/react-router';

/** 侧边栏「列表页面」分组。没有这份 staticData，子页面不会出现在菜单里。 */
export const Route = createFileRoute('/(admin)/list')({
  component: ListLayout,
  staticData: {
    title: '列表页面',
    menu: { icon: 'ri:table-line', order: 2 }
  }
});

function ListLayout() {
  return <Outlet />;
}
