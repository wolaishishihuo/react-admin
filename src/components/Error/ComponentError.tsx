import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import './index.less';

/** 菜单 element 未匹配视图时的兜底页 */
const ComponentError = ({ element }: { element: string }) => {
  const navigate = useNavigate();

  return (
    <Result
      className='error-page'
      status='error'
      title='组件未找到'
      subTitle={`菜单 element「${element}」未匹配到 src/views 下的视图，请检查菜单配置`}
      extra={
        <Button type='primary' onClick={() => navigate(-1)}>
          Go Back
        </Button>
      }
    />
  );
};

export default ComponentError;
