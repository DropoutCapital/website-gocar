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

/**
 * Resuelve un link del builder distinguiendo internos vs externos.
 *
 * El bug que arregla: un link como `instagram.com/foo` o `www.cliente.cl`
 * (sin `https://`) lo tomaba el navegador / el <Link> de Next como ruta
 * RELATIVA, así que le pegaba el dominio de la web adelante
 * (`carssale.cl/instagram.com/foo`). Acá detectamos dominios "pelados" y los
 * tratamos como externos agregándoles `https://`.
 *
 * - `https://`, `http://`, `mailto:`, `tel:` → externo, tal cual.
 * - `//host` (protocol-relative) → externo con `https:`.
 * - `/ruta`, `#ancla` → interno (lo maneja el <Link> de Next).
 * - `dominio.tld/...` (tiene un punto antes de la primera `/`) → externo,
 *   se le antepone `https://`.
 * - cualquier otra cosa → interno bajo `/`.
 */
export const resolveNavLink = (
  raw?: string | null
): { href: string; isExternal: boolean } => {
  const link = (raw || '').trim();
  if (!link) return { href: '#', isExternal: false };
  if (/^(https?:\/\/|mailto:|tel:)/i.test(link)) return { href: link, isExternal: true };
  if (link.startsWith('//')) return { href: `https:${link}`, isExternal: true };
  if (link.startsWith('/') || link.startsWith('#')) return { href: link, isExternal: false };
  // ¿dominio pelado? p.ej. "instagram.com/x" o "www.cliente.cl"
  const firstSegment = link.split(/[/?#]/)[0];
  if (firstSegment.includes('.')) return { href: `https://${link}`, isExternal: true };
  return { href: `/${link}`, isExternal: false };
};

/**
 * Navegación del botón primario de los Heros (típicamente "Ver vehículos").
 *
 * Bug que arregla: los Heros hacían scroll a CUALQUIER `[class*="vehicle"]`
 * de la página e IGNORABAN el link que el cliente ponía en el builder, así que
 * "/vehicles" o una URL completa nunca navegaban. Solo el `#ancla` debe hacer
 * scroll a una sección de la misma página; una ruta o URL real debe navegar.
 *
 * - `#seccion` → scroll suave a esa sección si existe (comportamiento legacy).
 * - `/ruta` → navega en la misma pestaña.
 * - `http…` / dominio pelado → navega en pestaña nueva.
 * - vacío → no hace nada y devuelve false (el Hero puede usar su fallback).
 *
 * Devuelve true si manejó el click. Llamar SOLO fuera del editor.
 */
export const navigateBuilderCta = (rawLink?: string | null): boolean => {
  const link = (rawLink || '').trim();
  if (!link) return false;
  // Ancla (#seccion): scroll a esa sección de la misma página.
  if (link.startsWith('#')) {
    const id = link.slice(1);
    const el =
      document.getElementById(id) ||
      document.querySelector(`[data-section="${id}"]`) ||
      document.querySelector('[data-section="vehicles"]') ||
      document.getElementById('vehicles-section') ||
      document.querySelector('[class*="vehicle"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  // Ruta interna o URL externa: navegar respetando el link del builder.
  const { href, isExternal } = resolveNavLink(link);
  if (isExternal) {
    window.open(href, '_blank');
  } else {
    window.location.href = href;
  }
  return true;
};
