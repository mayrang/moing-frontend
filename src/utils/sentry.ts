import { logger } from '@/shared/lib/logger';

/** @deprecated logger.error()를 직접 사용하세요 */
export function sendLogToSentry(error: Error) {
  logger.error(error.message, error);
}
