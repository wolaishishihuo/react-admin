import { useMemo, useState } from 'react';
import { Empty, Input, Popover, Tooltip } from 'antd';
import { Icon as SvgIcon } from '@iconify/react/offline';
import clsx from 'clsx';
import riManifest from '@/assets/icons/ri-manifest.json';

interface IconEntry {
  name: string;
  label: string;
  keywords?: string[];
}

interface IconSelectProps {
  value?: string;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ICONS = riManifest as IconEntry[];

/** 表单图标单选下拉器 */
const IconSelect: React.FC<IconSelectProps> = ({ value, onChange, disabled, placeholder = '请选择图标' }) => {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return ICONS;
    return ICONS.filter(
      item =>
        item.name.includes(kw) || item.label.toLowerCase().includes(kw) || item.keywords?.some(k => k.toLowerCase().includes(kw))
    );
  }, [keyword]);

  const selected = useMemo(() => ICONS.find(item => item.name === value), [value]);

  const handleOpenChange = (next: boolean) => {
    if (disabled) return;
    setOpen(next);
    if (next) setKeyword('');
  };

  const handleSelect = (name: string) => {
    onChange?.(name);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  const panel = (
    <div className='w-286px'>
      <Input
        allowClear
        autoFocus
        placeholder='搜索图标（名称/中文/关键词）'
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      <div className='mt-12px pr-4px gap-8px grid grid-cols-7 max-h-260px overflow-y-auto'>
        {filtered.map(item => (
          <Tooltip key={item.name} title={`${item.label} ${item.name}`}>
            <div
              className={clsx(
                'text-18px border rd-6px border-solid flex-center h-34px cursor-pointer transition-colors',
                item.name === value
                  ? 'text-primary border-primary bg-primary-bg'
                  : 'text-icon border-line-chip hover:text-primary hover:border-primary'
              )}
              onClick={() => handleSelect(item.name)}
            >
              <SvgIcon icon={item.name} />
            </div>
          </Tooltip>
        ))}
      </div>
      {!filtered.length && <Empty className='my-24px' description='无匹配图标' image={Empty.PRESENTED_IMAGE_SIMPLE} />}
    </div>
  );

  return (
    <Popover
      arrow={false}
      content={panel}
      open={disabled ? false : open}
      placement='bottomLeft'
      trigger='click'
      onOpenChange={handleOpenChange}
    >
      <Input
        readOnly
        className='cursor-pointer'
        disabled={disabled}
        placeholder={placeholder}
        prefix={value ? <SvgIcon className='text-16px text-icon' icon={value} /> : undefined}
        value={selected ? `${selected.label} ${selected.name}` : (value ?? '')}
        suffix={
          value && !disabled ? (
            <SvgIcon
              className='text-14px text-icon cursor-pointer transition-colors hover:text-content'
              icon='ri:close-circle-fill'
              onClick={handleClear}
            />
          ) : (
            <SvgIcon className='text-14px text-icon' icon='ri:arrow-down-s-line' />
          )
        }
      />
    </Popover>
  );
};

export default IconSelect;
