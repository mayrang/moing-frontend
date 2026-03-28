import { FieldValues, Resolver } from 'react-hook-form';
import { ZodSchema } from 'zod';

/**
 * @hookform/resolvers 없이 zod schema를 react-hook-form resolver로 변환.
 * 네트워크 미사용 환경에서 직접 구현.
 */
export function zodResolver<T extends FieldValues>(schema: ZodSchema<T>): Resolver<T> {
  return async (data) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { values: result.data as T, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root';
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {} as T, errors };
  };
}
