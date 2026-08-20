import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { HOME_PATH } from '@/features/navigation/menu-normalize';
import { isSafeRedirect } from '@/router/safe-redirect';

const loginSearchSchema = z
  .object({
    redirect: z.string().optional()
  })
  .transform(search => ({
    redirect: search.redirect && isSafeRedirect(search.redirect) ? search.redirect : undefined
  }));

export const Route = createFileRoute('/(auth)/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isLoggedIn) {
      const redirectTo = search.redirect ?? HOME_PATH;
      throw redirect({ href: redirectTo });
    }
  },
  component: LoginLayout,
  staticData: {
    title: '登录'
  }
});

function LoginLayout() {
  return <Outlet />;
}
