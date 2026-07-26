import { defineHandler } from 'nitro';
import { auth } from '../../../utils/auth';
import { toNodeHandler } from 'better-auth/node';

export default defineHandler(async (event) => {
  const handler = toNodeHandler(auth);
  return handler(event.node.req, event.node.res);
});