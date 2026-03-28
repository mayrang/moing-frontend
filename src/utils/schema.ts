import { z } from 'zod';

// ── 단일 필드 스키마 ────────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email('이메일 주소를 정확하게 입력해주세요.');

export const passwordSchema = z
  .string()
  .min(8, '영문 대문자, 특수문자 포함 8~20자')
  .max(20, '영문 대문자, 특수문자 포함 8~20자')
  .refine((v) => /[A-Z]/.test(v), '영문 대문자, 특수문자 포함 8~20자')
  .refine((v) => /[!@#$%^&*(),.?":{}|<>]/.test(v), '영문 대문자, 특수문자 포함 8~20자');

export const nameSchema = z
  .string()
  .min(1, '이름을 입력해주세요.')
  .regex(/^[ㄱ-ㅎ가-힣]+$/, '한글만 입력 가능합니다.')
  .max(10, '최대 10자까지 입력 가능합니다.');

// ── 폼 스키마 ───────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerEmailSchema = z.object({
  email: emailSchema,
});
export type RegisterEmailFormData = z.infer<typeof registerEmailSchema>;

export const registerPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, '비밀번호를 다시 입력해주세요.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });
export type RegisterPasswordFormData = z.infer<typeof registerPasswordSchema>;

export const nameFormSchema = z.object({
  name: nameSchema,
});
export type NameFormData = z.infer<typeof nameFormSchema>;

export const verifyCurrentPasswordSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});
export type VerifyCurrentPasswordFormData = z.infer<typeof verifyCurrentPasswordSchema>;

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, '비밀번호를 다시 입력해주세요.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export const commentSchema = z.object({
  content: z.string().min(1),
});
export type CommentFormData = z.infer<typeof commentSchema>;
