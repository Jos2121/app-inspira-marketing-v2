import { defineHandler } from 'nitro';
import { getRouterParam, readBody, createError } from 'nitro/h3';
import { db } from '../../../../utils/db';
import { taskUpdates, tasks } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const taskId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { content, targetChatId } = body;

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
  // Usar el chat seleccionado o el chat global por defecto
  const chatId = targetChatId || process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    const clientName = task?.client?.name || 'No especificado';
    const partnerName = task?.partner?.name || 'Sin asignar';

    const message = `📋 <b>Nuevo Avance de Tarea</b>\n\n📌 <b>Tarea:</b> ${task?.title || 'Sin título'}\n👤 <b>Cliente:</b> ${clientName}\n👥 <b>Asignado a:</b> ${partnerName}\n\n💬 <b>Avance:</b> ${content}\n\n¿Apruebas este avance?`;

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    try {
      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
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
      
      if (!response.ok) {
        console.error("Error de Telegram al enviar mensaje:", responseData);
      }

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