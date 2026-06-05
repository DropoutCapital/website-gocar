/**
 * True si el HTML no tiene contenido visible: '', solo tags vacíos (<br>, <p></p>),
 * &nbsp; o espacios. Se usa para colapsar sub-elementos (título/subtítulo/botón)
 * cuando el usuario los borra en el builder, en vez de dejar el hueco con su margen.
 */
export const isBlankHtml = (html?: string | null): boolean => {
  if (html == null) return true;
  const text = String(html)
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, '');
  return text.length === 0;
};

export const mapFuelTypeToSpanish = (
  fuelType: 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric' | 'Gas'
): string => {
  const fuelTypeMap = {
    Gasoline: 'Gasolina',
    Diesel: 'Diésel',
    Hybrid: 'Híbrido',
    Electric: 'Eléctrico',
    Gas: 'Gas',
  };

  return fuelTypeMap[fuelType];
};

export const mapTransmissionTypeToSpanish = (
  transmissionType: string
): string => {
  if (transmissionType?.toLowerCase()?.includes('auto')) {
    return 'Automático';
  }

  const transmissionTypeMap: { [key: string]: string } = {
    Automatic: 'Automático',
    Manual: 'Manual',
  };

  return transmissionTypeMap[transmissionType] || transmissionType;
};

export const mapConditionTypeToSpanish = (
  conditionType: 'New' | 'Used' | 'Certified Pre-Owned'
): string => {
  const conditionTypeMap = {
    New: 'Nuevo',
    Used: 'Usado',
    'Certified Pre-Owned': 'Certificado Pre-Vendido',
  };

  return conditionTypeMap[conditionType];
};

import { buildWhatsAppUrl } from './contact-utils';

/**
 * Wrapper de compatibilidad. Si el número no es válido devuelve '#' para que el
 * `<a href>` no abra una conversación rota. Preferí `buildWhatsAppUrl` en código
 * nuevo: te devuelve `null` y podés decidir esconder el botón.
 */
export const contactByWhatsApp = (phone: string, message?: string): string => {
  return buildWhatsAppUrl(phone, message) || '#';
};

/**
 * Normalizes builder links: converts hash-based anchors like "#contact"
 * to proper routes like "/contact". Leaves absolute URLs and already
 * correct paths unchanged.
 */
export const normalizeBuilderLink = (link: string): string => {
  if (!link) return link;
  // Already a proper path or external URL
  if (link.startsWith('/') || link.startsWith('http')) return link;
  // Convert #section to /section
  if (link.startsWith('#')) return `/${link.slice(1)}`;
  return link;
};
