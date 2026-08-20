import { createFileRoute } from '@tanstack/react-router';
import loginIllustration from '@/assets/images/login_illustration.svg';
import logo from '@/assets/images/logo.svg';
import ThemeToggle from '@/components/ThemeToggle';
import LoginForm from './components/LoginForm';
import './index.less';

export const Route = createFileRoute('/(auth)/login/')({
  component: LoginPage,
  staticData: {
    title: '登录'
  }
});

function LoginPage() {
  return (
    <div className='login-container bg-login-canvas flex-center h-full min-h-570px'>
      <div className='login-content px-20px rd-10px bg-login-panel flex h-[94%] w-[96.5%] items-center box-border justify-around relative'>
        <ThemeToggle className='switch-dark' />
        <div className='mr-20px w-750px -ml-35px lt-xl:hidden'>
          <img className='wh-full' src={loginIllustration} alt='illustration' />
        </div>
        <div className='login-form px-50px pb-22px pt-40px rd-10px bg-surface shadow-login lt-sm:w-full'>
          <div className='mb-40px flex-center'>
            <img className='h-73px w-73px' src={logo} alt='logo' />
            <span className='text-45px text-logo font-bold ml-24px whitespace-nowrap'>Hooks-Admin</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
