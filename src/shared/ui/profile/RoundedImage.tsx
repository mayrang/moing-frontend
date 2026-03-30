'use client';

import Image from 'next/image';

interface RoundedImageProps {
  size: number;
  src: string;
  alt?: string;
}

/**
 * 원형 프로필 이미지.
 * src가 빈 문자열이면 회색 배경(muted3) 표시.
 *
 * Refactoring notes:
 * - Phase 1: Emotion styled.div → Tailwind + inline style
 * - Phase 6: div + background-image → next/image (WebP 자동 변환, lazy loading, CLS 방지)
 */
const RoundedImage = ({ size, src, alt = '' }: RoundedImageProps) => {
  if (!src) {
    return (
      <div
        className="rounded-full flex-shrink-0"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: 'rgba(217, 217, 217, 1)',
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover flex-shrink-0"
    />
  );
};

export default RoundedImage;
