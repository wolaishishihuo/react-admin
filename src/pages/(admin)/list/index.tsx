import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(admin)/list/')({
  beforeLoad: () => {
    throw redirect({ to: '/list/useProTable' });
  }
});
