// 이 파일은 하위 호환성을 위해 유지됩니다.
// 실제 구현은 @/shared/ui/button/CloseButton 에 있습니다.
// API 변경: setIsOpen → onClick으로 리팩토링됨
import CloseButton from '@/shared/ui/button/CloseButton';
import React from 'react';

interface LegacyCloseButtonProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LegacyCloseButton({ setIsOpen }: LegacyCloseButtonProps) {
  return <CloseButton onClick={() => setIsOpen(false)} />;
}
