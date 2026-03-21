'use client';

import InfoIcon from '@/shared/ui/icons/InfoIcon';

interface InfoTextProps {
  hasError?: boolean;
  success?: boolean;
  children: React.ReactNode;
  shake?: boolean;
}

const SuccessIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3968_110)">
      <circle cx="7" cy="7" r="7" fill="#3E8D00" />
      <path d="M4 7L6.25 9L10 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_3968_110">
        <rect width="14" height="14" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

/**
 * 안내/에러/성공 상태 텍스트 컴포넌트.
 * shake prop은 globals.css의 @keyframes shake 애니메이션을 사용.
 * 인라인 SVG를 SuccessIcon 컴포넌트로 분리.
 */
const InfoText = ({
  hasError = false,
  success = false,
  children,
  shake = false,
}: InfoTextProps) => {
  const color = hasError ? '#ED1E1E' : success ? '#5DB21B' : '#ABABAB';

  return (
    <div
      className="flex items-center gap-[7px] text-sm font-normal leading-4"
      style={{
        color,
        animation: shake ? 'shake 0.3s' : 'none',
      }}
    >
      {success ? <SuccessIcon /> : <InfoIcon color={color} />}
      <span>{children}</span>
    </div>
  );
};

export default InfoText;
