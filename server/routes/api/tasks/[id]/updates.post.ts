import { defineHandler } from 'nitro';
import { getRouterParam, readBody, createError } from 'nitro/h3';
import { db } from '../../../../utils/db';
import { taskUpdates, tasks } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const taskId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { content } = body;

  if (!taskId || !content) {
    throw createError({ statusCode: 400, message: 'Faltan datos requeridos' });
  }

  // 1. Guardar el avance en la base de datos
  const [newUpdate] = await db.insert(taskUpdates).values({
    taskId,
    content,
    status: 'Pendiente'
  }).returning();

  // 2. Obtener la tarea junto con su cliente y responsable (partner)
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      client: true,
      partner: true
    }
  });

  // 3. Configurar y enviar a Telegram
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    const clientName = task?.client?.name || 'No especificado';
    const partnerName = task?.partner?.name || 'Sin asignar';

    const message = `📋 *Nuevo Avance de Tarea*\n\n📌 *Tarea:* ${task?.title || 'Sin título'}\n👤 *Cliente:* ${clientName}\n👥 *Asignado a:* ${partnerName}\n\n💬 *Avance:* ${content}\n\n¿Apruebas este avance?`;

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    try {
      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Aprobar', callback_data: `approve_${newUpdate.id}` },
                { text: '❌ Solicitar Cambios', callback_data: `reject_${newUpdate.id}` }
              ]
            ]
          }
        })
      });

      const responseData: any = await response.json();

      // Guardar el ID del mensaje de Telegram
      if (responseData && responseData.result) {
        await db.update(taskUpdates)
          .set({ telegramMessageId: responseData.result.message_id.toString() })
          .where(eq(taskUpdates.id, newUpdate.id));
      }
    } catch (error) {
      console.error("Error enviando a Telegram:", error);
    }
  }

  return newUpdate;
});