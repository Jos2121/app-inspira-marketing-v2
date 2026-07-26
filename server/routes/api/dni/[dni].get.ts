import { defineHandler } from 'nitro';
import { createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const dni = getRouterParam(event, 'dni');
  
  if (!dni || dni.length !== 8) {
    throw createError({ statusCode: 400, message: 'DNI inválido' });
  }

  // Se utilizan variables de entorno, con un fallback por defecto para desarrollo
  const baseUrl = process.env.APIS_PERU_BASE_URL || 'https://dniruc.apisperu.com/api/v1/dni';
  const token = process.env.APIS_PERU_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImNvYXF1aXJhXzIwMTJAaG90bWFpbC5jb20ifQ.1Yrd6W28ZZhpdUbX6Gx06pua0HwoJdAlCSYGUSNVgdc';

  try {
    const response = await fetch(`${baseUrl}/${dni}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
         throw createError({ statusCode: 404, message: 'DNI no encontrado' });
      }
      throw createError({ statusCode: response.status, message: 'Error al consultar la API de DNI' });
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Error interno al procesar el DNI' 
    });
  }
});