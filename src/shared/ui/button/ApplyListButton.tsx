'use client';

import EmptyHeartIcon from '@/shared/ui/icons/EmptyHeartIcon';
import FullHeartIcon from '@/shared/ui/icons/FullHeartIcon';
import Button from './Button';

interface ApplyListButtonProps {
  nowEnrollmentCount: number;
  text: string;
  type?: 'button' | 'reset' | 'submit';
  children?: React.ReactNode;
  disabled?: boolean;
  bookmarked: boolean;
  hostUserCheck: boolean;
  style?: React.CSSProperties;
  /** @deprecated style 사용 권장 */
  addStyle?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  bookmarkOnClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * 신청 목록 버튼 (북마크 아이콘 + 메인 버튼).
 * Button 컴포넌트를 내부에서 재사용.
 */
const ApplyListButton = ({
  text = '다음',
  type = 'submit',
  disabled = false,
  children,
  style,
  addStyle,
  onClick,
  bookmarkOnClick,
  nowEnrollmentCount,
  bookmarked = false,
  hostUserCheck,
}: ApplyListButtonProps) => {
  return (
    <div className="flex w-full items-center justify-center gap-4">
      {!hostUserCheck && (
        <button
          type="button"
          onClick={bookmarkOnClick}
          className="border-none bg-transparent"
        >
          {bookmarked ? (
            <FullHeartIcon width={24} />
          ) : (
            <EmptyHeartIcon width={24} stroke="rgba(26, 26, 26, 1)" />
          )}
        </button>
      )}
      <Button
        text={text}
        type={type}
        disabled={disabled}
        onClick={onClick}
        style={style ?? addStyle}
      >
        {!disabled && nowEnrollmentCount > 0 && hostUserCheck && (
          <span
            className={[
              'ml-2 flex h-4 min-w-4 items-center justify-center',
              'rounded-[20px] px-1.25 py-px',
              'bg-bg text-xs font-semibold text-keycolor',
            ].join(' ')}
          >
            {nowEnrollmentCount}
          </span>
        )}
        {children}
      </Button>
    </div>
  );
};

export default ApplyListButton;
