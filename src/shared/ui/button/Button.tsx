'use client';

interface ButtonProps {
  text: string;
  type?: 'button' | 'reset' | 'submit';
  children?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * 기본 버튼 컴포넌트.
 * FilterButton, ApplyListButton은 이 컴포넌트를 내부적으로 조합합니다.
 */
const Button = ({
  text = '다음',
  type = 'submit',
  disabled = false,
  children,
  style,
  className = '',
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={[
        'flex w-full items-center justify-center',
        'min-[390px]:w-[342px]',
        'h-12 rounded-[40px]',
        'cursor-pointer px-5 py-[10px] text-lg',
        'border-none',
        disabled
          ? 'cursor-not-allowed bg-[rgba(220,220,220,1)] text-[var(--color-text-muted)]'
          : 'bg-[var(--color-keycolor)] text-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {text}
      {children}
    </button>
  );
};

export default Button;
