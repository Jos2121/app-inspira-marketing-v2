import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { requirements, partners, clients } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { content, requesterId, assigneeId, deadline, clientId } = body;

  if (!content || !requesterId || !assigneeId || !deadline) {
    throw createError({ statusCode: 400, message: 'Faltan campos requeridos' });
  }

  // 1. Insertar el requerimiento en la BD
  const [newRequirement] = await db.insert(requirements).values({
    content,
    requesterId,
    assigneeId,
    clientId: clientId || null,
    deadline,
    status: 'Pendiente'
  }).returning();

  // 2. Obtener los nombres para el mensaje de Telegram
  const requester = await db.query.partners.findFirst({ where: eq(partners.id, requesterId) });
  const assignee = await db.query.partners.findFirst({ where: eq(partners.id, assigneeId) });
  
  let clientName = 'Interno / No asignado';
  if (clientId) {
    const clientRecord = await db.query.clients.findFirst({ where: eq(clients.id, clientId) });
    if (clientRecord) {
      clientName = clientRecord.name;
    }
  }

  // 3. Enviar mensaje a Telegram si las variables están configuradas
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    const reqName = requester?.name || 'Desconocido';
    const assignName = assignee?.name || 'Desconocido';

    const message = `🔔 <b>Nuevo Requerimiento</b>\n\n🏢 <b>Cliente:</b> ${clientName}\n👤 <b>De:</b> ${reqName}\n👥 <b>Para:</b> ${assignName}\n📅 <b>Fecha Límite:</b> ${deadline}\n\n💬 <b>Detalle:</b> ${content}`;

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
                { text: '✅ Realizado', callback_data: `reqdone_${newRequirement.id}` },
                { text: '📝 Enviar observaciones', callback_data: `reqobs_${newRequirement.id}` }
              ]
            ]
          }
        })
      });

      const responseData: any = await response.json();
      
      if (!response.ok) {
        console.error("Error de Telegram al enviar requerimiento:", responseData);
      } else if (responseData?.result?.message_id) {
        // Actualizamos la base de datos con el messageId de Telegram
        await db.update(requirements)
          .set({ telegramMessageId: responseData.result.message_id.toString() })
          .where(eq(requirements.id, newRequirement.id));
      }
    } catch (error) {
      console.error("Error enviando requerimiento a Telegram:", error);
    }
  }

  return newRequirement;
});