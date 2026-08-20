import { Input, Space } from 'antd';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { convertToSixDigitHexColor, isHexColor } from '@/utils/color';
import { setPrimary, useThemeStore } from '@/stores/modules/theme.store';
import './index.less';

const presetColors = [
  '#B40006',
  '#00B96B',
  '#E0282E',
  '#DAA96E',
  '#0C819F',
  '#409EFF',
  '#FF5C93',
  '#E74C3C',
  '#27AE60',
  '#FD726D',
  '#F39C12',
  '#9B59B6'
];

const ColorPicker = () => {
  const primary = useThemeStore(state => state.primary);
  const [inputPrimary, setInputPrimary] = useState(primary);

  const changePrimary = (value: string) => {
    setPrimary(value);
  };

  return (
    <div className='color-picker'>
      <HexColorPicker
        color={primary}
        onChange={e => {
          changePrimary(e.toLocaleUpperCase());
          setInputPrimary(e.toLocaleUpperCase());
        }}
      />
      <Space.Compact className='picker-input'>
        <Space.Addon>HEX</Space.Addon>
        <Input
          value={inputPrimary}
          onChange={e => setInputPrimary(e.target.value)}
          onBlur={e => {
            if (isHexColor(e.target.value)) {
              let value = e.target.value;
              if (e.target.value[0] !== '#') value = `#${e.target.value}`;
              changePrimary(convertToSixDigitHexColor(value));
              setInputPrimary(convertToSixDigitHexColor(value));
            }
          }}
        />
      </Space.Compact>
      <div className='picker-swatches'>
        {presetColors.map(presetColor => (
          <button
            className='picker-swatch'
            key={presetColor}
            style={{ background: presetColor }}
            onClick={() => {
              changePrimary(presetColor);
              setInputPrimary(presetColor);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
