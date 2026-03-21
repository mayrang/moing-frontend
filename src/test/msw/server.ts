import { setupServer } from 'msw/node';
import { authHandlers, searchHandlers } from './handlers';

export const server = setupServer(...authHandlers, ...searchHandlers);
