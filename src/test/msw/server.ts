import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Single MSW server instance shared across the suite (started in setupTests).
 * Individual tests override behavior with `server.use(...)`.
 */
export const server = setupServer(...handlers);
