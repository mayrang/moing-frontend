/**
 * 서버 제출 직전에만 적용하는 sanitize 유틸.
 * - NFC 정규화: 한글 등 유니코드 문자를 정규형으로 통일
 * - HTML 태그 제거: XSS 방지
 * - 앞뒤 공백 제거
 *
 * onChange마다 호출하지 말 것 — 제출(onSubmit) 시점에만 사용.
 */
export function sanitizeText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).map(([key, val]) => [
      key,
      typeof val === 'string' ? sanitizeText(val) : val,
    ])
  ) as T;
}
