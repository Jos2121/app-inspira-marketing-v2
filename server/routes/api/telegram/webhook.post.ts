import { defineHandler } from 'nitro';
import { readBody } from 'nitro/h3';
import { db } from '../../../utils/db';
import { taskUpdates } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const body = await readBody(event);

  if (body.callback_query) {
    const callbackQuery = body.callback_query;
    const data = callbackQuery.data; // ej: "approve_12345"
    const message = callbackQuery.message;
    
    const [action, updateId] = data.split('_');

    if (updateId && (action === 'approve' || action === 'reject')) {
      const newStatus = action === 'approve' ? 'Aprobado' : 'Con Cambios';
      
      // Actualizar estado en la BD
      await db.update(taskUpdates)
        .set({ status: newStatus })
        .where(eq(taskUpdates.id, updateId));

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (botToken) {
        // 1. Responder al click para que el botón deje de cargar
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: `Avance ${newStatus}`
          })
        }).catch(console.error);

        // 2. Editar el mensaje original para quitar los botones y mostrar el resultado
        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: message.chat.id,
            message_id: message.message_id,
            text: `${message.text}\n\n*Estado Actualizado:* ${newStatus === 'Aprobado' ? '✅ Aprobado' : '❌ Requiere Cambios'}`,
            parse_mode: 'Markdown'
          })
        }).catch(console.error);
      }
    }
  }

  return { ok: true };
});