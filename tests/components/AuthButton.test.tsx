import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import AuthButton from '@/components/AuthButton';
import { useAuthStore } from '@/stores';

describe('AuthButton', () => {
  afterEach(() => {
    useAuthStore.setState({ authButtons: [] });
  });

  it('renders children when the user has the code', () => {
    useAuthStore.setState({ authButtons: ['sys:user:create'] });
    render(
      <AuthButton authority='sys:user:create'>
        <button type='button'>新增</button>
      </AuthButton>
    );

    expect(screen.getByRole('button', { name: '新增' })).toBeInTheDocument();
  });

  it('hides children without the code', () => {
    useAuthStore.setState({ authButtons: [] });
    render(
      <AuthButton authority='sys:user:create'>
        <button type='button'>新增</button>
      </AuthButton>
    );

    expect(screen.queryByRole('button', { name: '新增' })).not.toBeInTheDocument();
  });

  it('requires every code when authority is an array', () => {
    useAuthStore.setState({ authButtons: ['sys:user:create'] });
    render(
      <AuthButton authority={['sys:user:create', 'sys:user:update']}>
        <button type='button'>操作</button>
      </AuthButton>
    );

    expect(screen.queryByRole('button', { name: '操作' })).not.toBeInTheDocument();
  });
});
