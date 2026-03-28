import { useCallback, useEffect, useRef } from 'react';
import { UseFormTrigger, FieldPath, FieldValues } from 'react-hook-form';

/**
 * react-hook-form Controller와 함께 사용하는 NFC 정규화 + 디바운싱 훅.
 *
 * - onChange: 입력값을 즉시 NFC 정규화한 뒤 field.onChange에 전달
 * - 검증(trigger)은 debounceMs(기본 300ms) 후 실행 → onChange마다 검증 실행 방지
 *
 * 적용 대상: 한글 이름, 댓글, 커뮤니티 본문 등 자연어 입력 필드
 * 비밀번호/이메일은 ASCII only이므로 NFC 불필요 → 이 훅 미사용
 *
 * 사용 예)
 * const { makeNfcOnChange } = useNfcField(trigger);
 * <Controller render={({ field }) => (
 *   <input {...field} onChange={makeNfcOnChange('name', field.onChange)} />
 * )} />
 */
export function useNfcField<T extends FieldValues>(
  trigger: UseFormTrigger<T>,
  debounceMs = 300
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const makeNfcOnChange = useCallback(
    (
      fieldName: FieldPath<T>,
      fieldOnChange: (value: string) => void
    ) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const normalized = e.target.value.normalize('NFC');
        fieldOnChange(normalized);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          trigger(fieldName);
        }, debounceMs);
      },
    [trigger, debounceMs]
  );

  return { makeNfcOnChange };
}
