'use client';

import XIcon from '@/shared/ui/icons/XIcon';

const RemoveButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      type="button"
      aria-label="삭제"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center justify-center border-none outline-none bg-transparent w-[18px] h-[18px]"
    >
      <XIcon />
    </button>
  );
};

export default RemoveButton;
