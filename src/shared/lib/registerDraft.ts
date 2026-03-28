/**
 * 회원가입 이메일 임시 저장 (localStorage)
 * - 비밀번호 등 민감 정보는 절대 저장하지 않음
 * - TTL 1시간: 만료된 데이터는 자동 무시
 * - 회원가입 완료 시 명시적으로 삭제
 */

const KEY = 'register_email_draft';
const TTL_MS = 60 * 60 * 1000; // 1시간

interface EmailDraft {
  email: string;
  savedAt: number;
}

export const registerDraft = {
  save(email: string) {
    if (typeof window === 'undefined') return;
    const draft: EmailDraft = { email, savedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(draft));
  },

  load(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const draft: EmailDraft = JSON.parse(raw);
      if (Date.now() - draft.savedAt > TTL_MS) {
        localStorage.removeItem(KEY);
        return null;
      }
      return draft.email;
    } catch {
      localStorage.removeItem(KEY);
      return null;
    }
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY);
  },
};
