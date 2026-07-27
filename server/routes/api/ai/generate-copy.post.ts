import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';

export default defineHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { driveUrl, whatsappLink, phoneNumber } = body;

    if (!driveUrl) {
      throw createError({ statusCode: 400, statusMessage: 'El enlace de Drive es obligatorio.' });
    }

    const driveRegex = /(?:d\/|id=)([a-zA-Z0-9_-]{25,})/;
    const match = driveUrl.match(driveRegex);
    
    if (!match) {
      throw createError({ statusCode: 400, statusMessage: 'Enlace de Google Drive no válido.' });
    }
    
    const fileId = match[1];
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const imageRes = await fetch(downloadUrl);
    
    if (!imageRes.ok) {
      throw createError({ statusCode: 400, statusMessage: 'No se pudo descargar la imagen. Asegúrate de que el enlace sea público.' });
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const systemPrompt = `Eres un copywriter experto y persuasivo especializado en el sector salud/médico. 
Analiza la imagen adjunta y crea un copy muy persuasivo. 
DEBES seguir EXACTAMENTE esta estructura y no agregar texto extra al inicio ni al final:

[Texto persuasivo del copy basado en la imagen, máximo 2 párrafos que conecten con la necesidad del paciente]

Si tienes dudas sobre cuál podría ser el estudio indicado para tu caso, podemos orientarte.

Escríbenos hoy mismo haciendo clic aquí: ${whatsappLink || '[TU_LINK_DE_WHATSAPP]'}

Y consulta nuestras tarifas y promociones vigentes.
O llámanos al siguiente número:
${phoneNumber || '[TU_NUMERO_DE_TELEFONO]'}

Nuestra prioridad es cuidar tu salud.
.
.
.
[9 hashtags relevantes basados en la imagen]`;

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const model = 'meta-llama/llama-3.2-11b-vision-instruct:free'; 

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: [{ type: 'text', text: systemPrompt }, { type: 'image_url', image_url: { url: dataUrl } }] }]
      })
    });

    if (!response.ok) throw createError({ statusCode: 500, statusMessage: 'Error al comunicarse con la IA.' });
    const data = await response.json();
    return { copy: data.choices[0].message.content };

  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.statusMessage || 'Error interno del servidor' });
  }
});