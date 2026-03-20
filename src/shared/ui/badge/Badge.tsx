'use client';

interface BadgeProps {
  daysLeft?: number;
  text: React.ReactNode;
  isDueDate?: boolean;
  width?: string;
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  height?: string;
  fontWeight?: string;
  isClose?: boolean;
  padding?: string;
}

/**
 * D-day 및 레이블 배지 컴포넌트.
 * 기존 isDueDate 분기로 인한 중복 렌더링을 단일 JSX로 통합.
 */
const Badge = ({
  daysLeft,
  text,
  isClose = false,
  isDueDate = true,
  width = 'max-content',
  backgroundColor = 'rgba(62, 141, 0, 1)',
  color = 'rgba(255, 255, 255, 1)',
  borderRadius = '20px',
  height = '23px',
  fontWeight = '700',
}: BadgeProps) => {
  const bgColor = isClose ? 'rgba(171, 171, 171, 1)' : backgroundColor;
  const textColor = isClose ? 'white' : color;

  const content = isDueDate
    ? isClose
      ? '마감'
      : <>{text}&nbsp;D-{daysLeft}</>
    : text;

  return (
    <div
      className="flex min-w-max items-center justify-center gap-[10px] text-center text-xs leading-[14px]"
      style={{
        width,
        backgroundColor: bgColor,
        color: textColor,
        borderRadius,
        height,
        fontWeight,
        padding: '4px 10px',
      }}
    >
      {content}
    </div>
  );
};

export default Badge;
