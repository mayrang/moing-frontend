'use client';

interface RoundedImageProps {
  size: number;
  src: string;
}

/**
 * 원형 프로필 이미지.
 * src가 빈 문자열이면 회색 배경(muted3) 표시.
 *
 * Refactoring notes:
 * - Emotion styled.div → Tailwind + inline style (동적 size/src)
 * - NOTE (Phase 1.5): div + background-image → img 태그 전환 시 접근성 개선 가능
 */
const RoundedImage = ({ size, src }: RoundedImageProps) => {
  return (
    <div
      className="rounded-full bg-cover"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundColor: src === '' ? 'rgba(217, 217, 217, 1)' : undefined,
      }}
    />
  );
};

export default RoundedImage;
