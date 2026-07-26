import { format } from 'date-fns-tz';
import { toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

export const LIMA_TIMEZONE = 'America/Lima';

/**
 * Formatea una fecha asegurando que se evalúe en la zona horaria de Lima, Perú.
 */
export function formatDateLima(date: Date | string | number, formatStr: string = 'dd/MM/yyyy'): string {
  const zonedDate = toZonedTime(new Date(date), LIMA_TIMEZONE);
  return format(zonedDate, formatStr, { locale: es, timeZone: LIMA_TIMEZONE });
}

/**
 * Devuelve la fecha actual en Lima en formato YYYY-MM-DD
 */
export function getCurrentDateLimaISO(): string {
  const zonedDate = toZonedTime(new Date(), LIMA_TIMEZONE);
  return format(zonedDate, 'yyyy-MM-dd', { timeZone: LIMA_TIMEZONE });
}

/**
 * Formatea una cadena de fecha local (YYYY-MM-DD o YYYY-MM) de forma segura,
 * evitando que la fecha salte un día hacia atrás al inicializarse en zonas horarias negativas.
 */
export function formatLocalDateString(dateString: string, formatStr: string): string {
  // Añadir horas de mediodía UTC para evitar el desfase de días en la conversión
  const suffix = dateString.length === 7 ? '-01T12:00:00Z' : 'T12:00:00Z';
  const safeDate = new Date(`${dateString}${suffix}`);
  return formatDateLima(safeDate, formatStr);
}