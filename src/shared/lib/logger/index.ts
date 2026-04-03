import type { ILogger } from './types';
import { NoopLogger } from './adapters/NoopLogger';
import { ConsoleLogger } from './adapters/ConsoleLogger';
import { SentryLogger } from './adapters/SentryLogger';

function createLogger(): ILogger {
  if (process.env.NODE_ENV === 'test') return new NoopLogger();
  if (process.env.NODE_ENV === 'production') return new SentryLogger();
  return new ConsoleLogger();
}

export const logger: ILogger = createLogger();
export type { ILogger } from './types';
