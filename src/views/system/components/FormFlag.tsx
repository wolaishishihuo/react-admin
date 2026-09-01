import type { FormItemProps } from 'antd';
import { Form, Switch } from 'antd';

interface FormFlagProps {
  name: string;
  label: string;
  itemProps?: Pick<FormItemProps, 'valuePropName' | 'getValueFromEvent' | 'getValueProps'>;
}

const FormFlag = (props: FormFlagProps) => {
  const { name, label, itemProps } = props;

  return (
    <div className='system-form-flag'>
      <span>{label}</span>
      <Form.Item name={name} noStyle valuePropName='checked' {...itemProps}>
        <Switch size='small' />
      </Form.Item>
    </div>
  );
};

export default FormFlag;
