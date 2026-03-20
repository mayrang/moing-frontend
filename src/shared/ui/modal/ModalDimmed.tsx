'use client';

/**
 * 모달 배경 딤드 레이어 (공통).
 * 3곳에서 동일하게 반복되던 DarkWrapper styled-component를 추출.
 * 440px 이상에서 390px 고정 너비로 중앙 정렬.
 */
const ModalDimmed = ({ onClick }: { onClick?: React.MouseEventHandler<HTMLDivElement> }) => (
  <div
    onClick={onClick}
    className={[
      'pointer-events-auto absolute inset-0 h-svh w-full opacity-80',
      'bg-[rgba(26,26,26,0.3)] z-1001',
      'min-[440px]:w-97.5 min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 min-[440px]:overflow-x-hidden',
    ].join(' ')}
  />
);

export default ModalDimmed;
