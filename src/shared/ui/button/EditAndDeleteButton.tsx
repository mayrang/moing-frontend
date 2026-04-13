'use client';

interface EditAndDeleteButtonProps {
  isOpen: boolean;
  isMyApplyTrip?: boolean;
  editClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
  deleteClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
  deleteText?: string;
}

/**
 * 수정/삭제 팝업 버튼.
 * isMyApplyTrip=true이면 수정 버튼 없이 단일 액션 버튼으로 동작.
 */
const EditAndDeleteButton = ({
  isOpen,
  isMyApplyTrip = false,
  editClickHandler,
  deleteClickHandler,
  deleteText = '삭제하기',
}: EditAndDeleteButtonProps) => {
  return (
    <div
      className={[
        'flex flex-col items-center rounded-[20px] bg-[#f0f0f0]',
        isMyApplyTrip ? 'h-[52px]' : 'h-[104px]',
        'transition-transform duration-500 ease-in-out',
        isOpen ? '-translate-y-[5%]' : 'translate-y-[20%]',
      ].join(' ')}
    >
      {!isMyApplyTrip && (
        <button
          type="button"
          onClick={editClickHandler}
          className={[
            'flex h-1/2 w-full cursor-pointer items-center justify-center',
            'min-[390px]:w-[342px]',
            'rounded-t-[20px] border-none border-b border-[#e2e2e2]',
            'text-base font-semibold text-[var(--color-text-base)]',
            'active:rounded-t-[20px] active:bg-[var(--color-muted3)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-keycolor)] focus-visible:ring-inset',
          ].join(' ')}
        >
          수정하기
        </button>
      )}
      <button
        type="button"
        onClick={deleteClickHandler}
        className={[
          'flex cursor-pointer items-center justify-center',
          'w-full min-[390px]:w-[342px]',
          isMyApplyTrip ? 'h-full rounded-[20px]' : 'h-1/2 rounded-b-[20px]',
          'border-none text-base font-semibold text-[var(--color-like)]',
          isMyApplyTrip
            ? 'active:rounded-[20px] active:bg-[var(--color-muted3)]'
            : 'active:rounded-b-[20px] active:bg-[var(--color-muted3)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-keycolor)] focus-visible:ring-inset',
        ].join(' ')}
      >
        {deleteText}
      </button>
    </div>
  );
};

export default EditAndDeleteButton;
