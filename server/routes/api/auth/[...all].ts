import { defineHandler } from 'nitro';
import { auth } from '../../../utils/auth';

export default defineHandler(async (event) => {
  return auth.handler(event.request);
});