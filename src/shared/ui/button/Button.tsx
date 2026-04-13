'use client';

interface ButtonProps {
  text: string;
  type?: 'button' | 'reset' | 'submit';
  children?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  /** @deprecated style 사용 권장 */
  addStyle?: React.CSSProperties;
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
  addStyle,
  className = '',
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={style ?? addStyle}
      className={[
        'flex w-full items-center justify-center',
        'min-[390px]:w-[342px]',
        'h-12 rounded-[40px]',
        'cursor-pointer px-5 py-[10px] text-lg',
        'border-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-keycolor)] focus-visible:ring-offset-2',
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
