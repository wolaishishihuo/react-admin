import { createFileRoute, redirect } from '@tanstack/react-router';
import { HOME_PATH } from '@/features/navigation/menu-normalize';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: HOME_PATH });
  }
});
