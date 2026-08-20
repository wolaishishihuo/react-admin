import { createFileRoute } from '@tanstack/react-router';
import AdminLayout from '@/layouts/AdminLayout';
import { guardAdminRoute } from '@/router/guard';

export const Route = createFileRoute('/(admin)')({
  beforeLoad: async options => {
    await guardAdminRoute(options);
  },
  component: AdminLayout
});
