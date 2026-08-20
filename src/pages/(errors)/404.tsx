import { createFileRoute } from '@tanstack/react-router';
import RouteNotFound from '@/pages/not-found';

export const Route = createFileRoute('/(errors)/404')({
  component: RouteNotFound,
  staticData: { title: '404' }
});
