import { getVehicleById, getDealershipsByClientId } from '@/lib/vehicles';
import { getClient } from '@/hooks/useClient';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildVehicleJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';
import VehicleDetailsPageClient from './VehicleDetailsPageClient';

function formatPrice(price?: number, currency = 'CLP'): string {
  if (!price || price <= 0) return '';
  try {
    return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-CL', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `$${price.toLocaleString('es-CL')}`;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';
  const baseUrl = `https://${host}`;

  const vehicle = await getVehicleById(id).catch(() => null);

  if (!vehicle) {
    return {
      title: 'Vehículo no encontrado',
      description: 'Este vehículo no existe.',
    };
  }

  const client = await getClient();
  const baseName = `${vehicle.brand?.name || ''} ${vehicle.model?.name || ''} ${vehicle.year || ''}`.trim();

  // Title enriquecido: nombre · condición · precio (la moneda viene del tenant).
  const price = formatPrice(vehicle.price, client?.currency || 'CLP');
  const newTitle = [baseName, vehicle.condition?.name, price]
    .filter(Boolean)
    .join(' · ');

  // Description: la del vehículo si existe; si no, una armada con sus specs + ciudad.
  let description = vehicle.description;
  if (!description) {
    const dealerships = client?.id
      ? await getDealershipsByClientId(client.id)
      : [];
    const city = (dealerships[0] as any)?.city || '';
    const specs = [
      vehicle.mileage ? `${vehicle.mileage.toLocaleString('es-CL')} km` : '',
      vehicle.transmission === 'Automatic' ? 'Automático' : vehicle.transmission === 'Manual' ? 'Manual' : '',
      vehicle.fuel_type?.name,
    ].filter(Boolean).join(' · ');
    description = [`${baseName} en venta`, specs, city && `en ${city}`]
      .filter(Boolean)
      .join('. ') + '.';
  }

  // Use vehicle's main image directly for fast OG previews
  // The dynamic ImageResponse API was too slow (3-5s) causing WhatsApp timeouts
  const ogImageUrl = vehicle.main_image || `${baseUrl}/api/og/${id}`;

  return {
    title: newTitle,
    description,
    alternates: {
      canonical: `/vehicles/${id}`,
    },
    openGraph: {
      title: newTitle,
      description,
      type: 'article',
      url: `${baseUrl}/vehicles/${id}`,
      images: [{
        url: ogImageUrl,
        alt: newTitle,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: newTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function VehicleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const host =
    headersList.get('host') || headersList.get('x-forwarded-host') || '';
  const baseUrl = `https://${host}`;

  const [vehicle, client] = await Promise.all([
    getVehicleById(id).catch(() => null), // cacheado: comparte fetch con generateMetadata
    getClient(),
  ]);

  return (
    <>
      {vehicle && (
        <JsonLd
          data={[
            buildVehicleJsonLd(vehicle, baseUrl, client?.currency || 'CLP'),
            buildBreadcrumbJsonLd(baseUrl, vehicle),
          ]}
        />
      )}
      <VehicleDetailsPageClient />
    </>
  );
}
