import { defineHandler } from 'nitro';
import { toWebRequest } from 'h3';
import { auth } from '../../../utils/auth';

export default defineHandler(async (event) => {
  return auth.handler(toWebRequest(event));
});