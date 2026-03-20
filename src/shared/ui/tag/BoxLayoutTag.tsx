'use client';

import { forwardRef } from 'react';

interface BoxLayoutTagProps {
  text: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  addStyle?: {
    backgroundColor?: string;
    color?: string;
    height?: string;
    border?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    fontWeight?: string;
    margin?: string;
  };
}

const SIZE_STYLES: Record<'small' | 'medium' | 'large', React.CSSProperties> = {
  large: { padding: '14px 24px', fontSize: '16px', height: '48px', borderRadius: '30px' },
  medium: { padding: '10px 20px', fontSize: '16px', height: '42px', borderRadius: '30px' },
  small: { padding: '8px 14px', fontSize: '14px', height: '33px', borderRadius: '16px' },
};

const DEFAULT_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(240, 240, 240, 1)',
  padding: '4px 10px',
  color: 'rgba(132, 132, 132, 1)',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '400',
  margin: '0 8px 0 0',
};

const BoxLayoutTag = forwardRef<HTMLDivElement, BoxLayoutTagProps>(
  ({ text, size, addStyle = DEFAULT_STYLE }, ref) => {
    const style = size
      ? { ...addStyle, ...SIZE_STYLES[size] }
      : addStyle;

    return (
      <div
        ref={ref}
        className="flex items-center justify-center transition-all duration-100 ease-in-out"
        style={style}
      >
        {text}
      </div>
    );
  }
);

export default BoxLayoutTag;
