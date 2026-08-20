import { Button, Result } from 'antd';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { HOME_PATH } from '@/features/navigation/menu-normalize';
import { navigateTo } from '@/router/router-ref';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** 页面级错误边界（Main 按 cacheKey 包裹各路由页） */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleBackHome = () => {
    this.setState({ error: null });
    navigateTo(HOME_PATH);
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <Result
          status='error'
          title='页面出错了'
          subTitle={error.message || String(error)}
          extra={[
            <Button key='retry' type='primary' onClick={this.handleRetry}>
              重试
            </Button>,
            <Button key='home' onClick={this.handleBackHome}>
              返回首页
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
