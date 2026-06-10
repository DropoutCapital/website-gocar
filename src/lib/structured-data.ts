/**
 * Builders de datos estructurados schema.org (JSON-LD).
 * Funciones puras (sin React): reciben datos del tenant/vehículo y devuelven
 * objetos planos listos para serializar. Todo es defensivo: si falta un dato,
 * la clave simplemente se omite (nunca emitimos null/undefined/"").
 */
import type { Vehicle } from '@/utils/types';

// ───────────────────────── Tipos (flexibles, vienen de JSONB) ─────────────────────────

export interface SeoClient {
  id?: number | string;
  name?: string;
  logo?: string;
  favicon?: string;
  domain?: string;
  custom_domain?: string | null;
  currency?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    google_site_verification?: string;
    /** Mapa { instagram, facebook, ... } o arreglo de URLs. Alimenta sameAs. */
    social_links?: Record<string, string> | string[] | null;
  };
  contact?: { email?: string; phone?: string; address?: string };
  location?: { lat?: number | string | null; lng?: number | string | null };
}

export interface SeoDealership {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  location?: { lat?: number | string | null; lng?: number | string | null } | null;
  /** { monday: { open, close } | { closed: true }, ... } */
  opening_hours?: Record<string, { open?: string; close?: string; closed?: boolean }> | null;
}

// ───────────────────────────────── Helpers ─────────────────────────────────

/** Quita claves undefined/null/"" (conserva 0 y false). */
function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

function toNum(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : undefined;
}

function vehicleName(vehicle: Pick<Vehicle, 'brand' | 'model' | 'year'>): string {
  return [vehicle.brand?.name, vehicle.model?.name, vehicle.year]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function conditionToSchema(conditionName?: string): string {
  const c = (conditionName || '').toLowerCase();
  const isNew = /nuevo|0\s?km|0km|new/.test(c);
  return isNew ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition';
}

const DAY_MAP: Record<string, string> = {
  monday: 'https://schema.org/Monday',
  tuesday: 'https://schema.org/Tuesday',
  wednesday: 'https://schema.org/Wednesday',
  thursday: 'https://schema.org/Thursday',
  friday: 'https://schema.org/Friday',
  saturday: 'https://schema.org/Saturday',
  sunday: 'https://schema.org/Sunday',
};

function buildOpeningHours(
  hours?: SeoDealership['opening_hours']
): Array<Record<string, unknown>> | undefined {
  if (!hours || typeof hours !== 'object') return undefined;
  const specs: Array<Record<string, unknown>> = [];
  for (const [day, val] of Object.entries(hours)) {
    const dayOfWeek = DAY_MAP[day.toLowerCase()];
    if (!dayOfWeek || !val || val.closed || !val.open || !val.close) continue;
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek,
      opens: val.open,
      closes: val.close,
    });
  }
  return specs.length ? specs : undefined;
}

function normalizeSocial(
  social?: Record<string, string> | string[] | null
): string[] {
  if (!social) return [];
  const values = Array.isArray(social) ? social : Object.values(social);
  return values
    .filter((v): v is string => typeof v === 'string' && /^https?:\/\//.test(v.trim()))
    .map((v) => v.trim());
}

// ──────────────────────────────── Builders ────────────────────────────────

/** schema.org Car + Offer para la página de detalle de un vehículo. */
export function buildVehicleJsonLd(
  vehicle: Vehicle,
  baseUrl: string,
  currency = 'CLP'
): Record<string, unknown> {
  const url = `${baseUrl}/vehicles/${vehicle.id}`;
  const images = [vehicle.main_image, ...(vehicle.gallery || [])].filter(Boolean);
  const itemCondition = conditionToSchema(vehicle.condition?.name);

  const offer =
    vehicle.price > 0
      ? clean({
          '@type': 'Offer',
          price: vehicle.price,
          priceCurrency: currency,
          availability: 'https://schema.org/InStock',
          itemCondition,
          url,
        })
      : undefined;

  return clean({
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: vehicleName(vehicle),
    url,
    brand: vehicle.brand?.name
      ? { '@type': 'Brand', name: vehicle.brand.name }
      : undefined,
    model: vehicle.model?.name,
    vehicleModelDate: vehicle.year ? String(vehicle.year) : undefined,
    mileageFromOdometer:
      vehicle.mileage != null
        ? { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'KMT' }
        : undefined,
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuel_type?.name,
    color: vehicle.color?.name,
    bodyType: vehicle.category?.name,
    itemCondition,
    image: images.length ? images : undefined,
    description: vehicle.description,
    offers: offer,
  });
}

/** BreadcrumbList: Inicio → Vehículos → vehículo. */
export function buildBreadcrumbJsonLd(
  baseUrl: string,
  vehicle: Vehicle
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Vehículos', item: `${baseUrl}/vehicles` },
      {
        '@type': 'ListItem',
        position: 3,
        name: vehicleName(vehicle),
        item: `${baseUrl}/vehicles/${vehicle.id}`,
      },
    ],
  };
}

/** AutoDealer (LocalBusiness) para el home: NAP, geo, horarios y redes. */
export function buildDealerJsonLd(
  client: SeoClient,
  dealerships: SeoDealership[] | undefined,
  baseUrl: string
): Record<string, unknown> {
  const main = dealerships?.[0];
  const contact = client.contact || {};

  const lat = toNum(client.location?.lat ?? main?.location?.lat);
  const lng = toNum(client.location?.lng ?? main?.location?.lng);

  const address = clean({
    '@type': 'PostalAddress',
    streetAddress: contact.address || main?.address,
    addressLocality: main?.city,
    addressRegion: main?.state,
    addressCountry: client.currency === 'USD' ? 'US' : 'CL',
  });

  const sameAs = normalizeSocial(client.seo?.social_links);

  return clean({
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: client.name,
    url: baseUrl,
    logo: client.logo,
    image: client.logo,
    telephone: contact.phone || main?.phone,
    email: contact.email || main?.email,
    // address solo si tiene algo más que el @type
    address: Object.keys(address).length > 1 ? address : undefined,
    geo:
      lat !== undefined && lng !== undefined
        ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }
        : undefined,
    openingHoursSpecification: buildOpeningHours(main?.opening_hours),
    sameAs: sameAs.length ? sameAs : undefined,
  });
}

/** WebSite del tenant (nombre + url). */
export function buildWebsiteJsonLd(
  client: SeoClient,
  baseUrl: string
): Record<string, unknown> {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: client.seo?.title || client.name,
    url: baseUrl,
  });
}
