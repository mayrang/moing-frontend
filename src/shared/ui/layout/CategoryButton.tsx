'use client';
import { cn } from '@/shared/lib/cn';

interface CategoryButtonProps {
  text?: string;
  id: number;
  addStyle?: {
    backgroundColor?: string;
    color?: string;
    height?: string;
    border?: string;
  };
  active?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const CategoryButton = ({
  text = '항목',
  id,
  active = false,
  addStyle = {
    backgroundColor: 'var(--color-search-bg)',
    color: 'var(--color-text-base)',
    height: '42px',
    border: '1px solid var(--color-search-bg)',
  },
  onClick,
}: CategoryButtonProps) => {
  const activeStyle = {
    border: '1px solid rgba(62, 141, 0, 1)',
    height: '42px',
    color: 'var(--color-keycolor)',
    backgroundColor: 'var(--color-keycolor-bg)',
    fontWeight: 600,
  };

  return (
    <button
      type="button"
      id={`${id}`}
      onClick={onClick}
      className="px-5 py-[10px] rounded-[30px] box-border flex text-[rgba(52,52,52,1)] text-base font-medium w-max justify-center items-center"
      style={active ? activeStyle : addStyle}
    >
      {text}
    </button>
  );
};

export default CategoryButton;
