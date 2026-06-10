import { getClient } from '@/hooks/useClient';
import { getVisibleVehiclesByClientId } from '@/lib/vehicles';

/**
 * Contenido SEO renderizado en el SERVIDOR para el home.
 *
 * El home del builder se renderiza solo en el cliente, así que Googlebot recibía
 * un HTML casi vacío (~8 caracteres). Este bloque emite, ya en el HTML inicial:
 * un H1 con el nombre/propuesta, la descripción, enlaces a las secciones y la
 * lista de vehículos disponibles (enlaces internos a /vehicles/[id]).
 *
 * Va en `sr-only` (presente en el DOM y rastreable, pero sin alterar el diseño
 * visual de ningún tenant). El mayor valor son el texto real + los enlaces
 * internos que permiten a Google descubrir e indexar las fichas de cada auto.
 */
export default async function HomeSeoContent() {
  const client = await getClient();
  if (!client) return null;

  const title = client.seo?.title?.trim() || client.name || 'Automotora';
  const description = client.seo?.description?.trim();
  const vehicles = client.id
    ? await getVisibleVehiclesByClientId(client.id)
    : [];

  const sections = [
    ['/vehicles', 'Vehículos'],
    ['/financing', 'Financiamiento'],
    ['/consignments', 'Consignaciones'],
    ['/buy-direct', 'Compra directa'],
    ['/we-search-for-you', 'Buscamos por ti'],
    ['/contact', 'Contacto'],
    ['/about', 'Nosotros'],
  ];

  return (
    <section className="sr-only">
      <h1>{title}</h1>
      {description && <p>{description}</p>}

      <nav aria-label="Secciones del sitio">
        <ul>
          {sections.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {vehicles.length > 0 && (
        <>
          <h2>Vehículos disponibles en {title}</h2>
          <ul>
            {vehicles.map((v: any) => {
              const name = [v.brand?.name, v.model?.name, v.year]
                .filter(Boolean)
                .join(' ');
              return (
                <li key={v.id}>
                  <a href={`/vehicles/${v.id}`}>{name || `Vehículo ${v.id}`}</a>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
