'use client';

type SpacingProps = {
  size: number | string;
  direction?: 'vertical' | 'horizontal';
};

const Spacing = ({ size, direction = 'vertical' }: SpacingProps) => {
  const value = typeof size === 'string' ? size : `${size}px`;
  return (
    <div
      style={direction === 'vertical' ? { height: value } : { width: value }}
      aria-hidden="true"
    />
  );
};

export default Spacing;
