import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.prospectName || !body.results) {
    throw createError({ statusCode: 400, message: 'Datos insuficientes para el análisis' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet'; 
  const siteUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
  const siteName = 'Inspira Mkt';

  // Si no hay API Key de OpenRouter, usamos un mock temporal para no romper la app en desarrollo
  if (!apiKey) {
    console.warn("Falta OPENROUTER_API_KEY. Usando datos simulados (mock).");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const criticalPoints = Object.entries(body.results)
      .filter(([_, data]: any) => data.score <= 4)
      .map(([q, data]: any) => `- **${q}**: Calif (${data.score}/10). Obs: *${data.observation || 'Sin observaciones'}*`);

    return { 
      report: `# Informe de Auditoría Operativa (Simulado)\n**Prospecto:** ${body.prospectName}\n\n### Áreas Críticas Detectadas\n${criticalPoints.length > 0 ? criticalPoints.join('\n') : 'No se detectaron puntos críticos severos.'}\n\n*Nota: Para generar un reporte real con Inteligencia Artificial, debes configurar la variable OPENROUTER_API_KEY en tu entorno.*` 
    };
  }

  const prompt = `
    Actúa como un auditor experto en clínicas. Genera un informe profesional 
    para el prospecto ${body.prospectName}. Estos son los resultados de su evaluación operativa:
    ${JSON.stringify(body.results, null, 2)}
    
    Menciona los puntos críticos (calificación menor a 5) y sugiere un plan de acción para solucionarlos.
    Devuelve tu respuesta formateada en Markdown puro. No incluyas saludos iniciales ni texto innecesario, ve directo al informe.
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error de OpenRouter:', errorData);
      throw createError({ statusCode: response.status, message: 'Error al generar el diagnóstico con IA' });
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return { report: generatedText };

  } catch (error: any) {
    console.error("Error en API de Diagnóstico:", error);
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Error interno al comunicarse con la IA' 
    });
  }
});