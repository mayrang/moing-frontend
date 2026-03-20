'use client';

interface CloseButtonProps {
  onClick: () => void;
  text?: string;
  'aria-label'?: string;
}

/**
 * 닫기 버튼.
 * 기존 API(setIsOpen)에서 onClick으로 변경하여 재사용성 향상.
 *
 * Accessibility notes (Phase 1.5):
 * - aria-label 기본값을 text prop과 동일하게 설정 (아이콘 전용 버전 대비)
 */
const CloseButton = ({ onClick, text = '닫기', 'aria-label': ariaLabel }: CloseButtonProps) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? text}
      onClick={onClick}
      className={[
        'mt-4 flex w-full cursor-pointer items-center justify-center',
        'min-[390px]:w-[342px]',
        'h-12 rounded-[40px]',
        'border-none px-5 py-[10px]',
        'bg-[var(--color-bg)] text-lg font-medium text-[var(--color-text-base)]',
        'active:bg-[var(--color-muted3)]',
      ].join(' ')}
    >
      {text}
    </button>
  );
};

export default CloseButton;
