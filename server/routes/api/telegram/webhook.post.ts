import { defineHandler } from 'nitro';
import { readBody } from 'nitro/h3';
import { db } from '../../../utils/db';
import { taskUpdates, requirements } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // 1. MANEJAR CLICS EN LOS BOTONES
  if (body.callback_query) {
    const callbackQuery = body.callback_query;
    const data = callbackQuery.data; // ej: "approve_12345" o "reqdone_12345"
    const message = callbackQuery.message;
    
    const [action, recordId] = data.split('_');

    // Lógica para Avances de Tareas
    if (recordId && (action === 'approve' || action === 'reject')) {
      const newStatus = action === 'approve' ? 'Aprobado' : 'Con Cambios';
      
      // Actualizar estado en la BD
      await db.update(taskUpdates)
        .set({ status: newStatus })
        .where(eq(taskUpdates.id, recordId));

      if (botToken) {
        // Responder al click
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQuery.id, text: `Avance ${newStatus}` })
        }).catch(console.error);

        // Editar el mensaje original
        let newText = `${message.text}\n\n<b>Estado Actualizado:</b> ${newStatus === 'Aprobado' ? '✅ Aprobado' : '❌ Requiere Cambios'}`;
        
        if (action === 'reject') {
          newText += `\n\n💬 <b>Por favor, responde a este mensaje escribiendo los cambios que solicitas.</b>`;
        }

        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: message.chat.id,
            message_id: message.message_id,
            text: newText,
            parse_mode: 'HTML'
          })
        }).catch(console.error);
      }
    }

    // Lógica para Requerimientos
    if (recordId && (action === 'reqdone' || action === 'reqobs')) {
      const newStatus = action === 'reqdone' ? 'Realizado' : 'Con Observaciones';

      // Actualizar estado en la BD
      await db.update(requirements)
        .set({ status: newStatus })
        .where(eq(requirements.id, recordId));

      if (botToken) {
        // Responder al click
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQuery.id, text: `Requerimiento ${newStatus}` })
        }).catch(console.error);

        // Editar el mensaje original
        let newText = `${message.text}\n\n✅ <b>Estado:</b> Realizado`;
        
        if (action === 'reqobs') {
          newText = `${message.text}\n\n💬 <b>Por favor, responde a este mensaje escribiendo tus observaciones.</b>`;
        }

        await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: message.chat.id,
            message_id: message.message_id,
            text: newText,
            parse_mode: 'HTML'
          })
        }).catch(console.error);
      }
    }
  }

  // 2. MANEJAR RESPUESTAS DE TEXTO (FEEDBACK)
  if (body.message && body.message.reply_to_message && body.message.text) {
    const replyToMessageId = body.message.reply_to_message.message_id.toString();
    const feedbackText = body.message.text;

    // A) Buscar si el mensaje al que respondieron existe en Avances de Tareas
    const updateRecord = await db.query.taskUpdates.findFirst({
      where: eq(taskUpdates.telegramMessageId, replyToMessageId)
    });

    if (updateRecord && botToken) {
      await db.update(taskUpdates)
        .set({ feedbackMessage: feedbackText, status: 'Con Cambios' })
        .where(eq(taskUpdates.id, updateRecord.id));

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: body.message.chat.id,
          reply_to_message_id: body.message.message_id,
          text: `✅ Feedback recibido y guardado en la plataforma.`,
          parse_mode: 'HTML'
        })
      }).catch(console.error);
    } else {
      // B) Si no es un avance, buscar si existe en Requerimientos
      const reqRecord = await db.query.requirements.findFirst({
        where: eq(requirements.telegramMessageId, replyToMessageId)
      });

      if (reqRecord && botToken) {
        await db.update(requirements)
          .set({ feedbackMessage: feedbackText, status: 'Con Observaciones' })
          .where(eq(requirements.id, reqRecord.id));

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: body.message.chat.id,
            reply_to_message_id: body.message.message_id,
            text: `✅ Observación del requerimiento guardada con éxito.`,
            parse_mode: 'HTML'
          })
        }).catch(console.error);
      }
    }
  }

  return { ok: true };
});