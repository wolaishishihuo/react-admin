import { App } from 'antd';
import { registerFeedback } from './feedback';

export default function AntdBridge() {
  const staticFunction = App.useApp();
  registerFeedback({
    message: staticFunction.message,
    notification: staticFunction.notification,
    modal: staticFunction.modal
  });
  return null;
}
