'use client';

interface ReportButtonProps {
  isOpen: boolean;
  reportClickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
  reportText?: string;
}

const ReportButton = ({
  isOpen,
  reportClickHandler,
  reportText = '신고하기',
}: ReportButtonProps) => {
  return (
    <div
      className={[
        'flex h-[52px] flex-col items-center rounded-[20px] bg-[#f0f0f0]',
        'transition-transform duration-500 ease-in-out',
        isOpen ? '-translate-y-[5%]' : 'translate-y-[20%]',
      ].join(' ')}
    >
      <button
        onClick={reportClickHandler}
        className={[
          'flex h-full w-full cursor-pointer items-center justify-center',
          'min-[390px]:w-[342px]',
          'rounded-b-[20px] border-none',
          'text-base font-semibold text-[var(--color-like)]',
          'active:rounded-b-[20px] active:bg-[var(--color-muted3)]',
        ].join(' ')}
      >
        {reportText}
      </button>
    </div>
  );
};

export default ReportButton;
