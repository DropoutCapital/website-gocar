import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { getHiddenSystemPages } from '@/lib/page-builder-data';

export default async function sitemap(): Promise<MetadataRoute['sitemap']> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  const baseUrl = `https://${host}`;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );

  // Resuelve el tenant por subdominio (*.goauto.cl) o por dominio propio.
  // Antes solo miraba `domain`, dejando los custom domains con sitemap vacío.
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .or(`domain.eq.${host},custom_domain.eq.${host}`)
    .maybeSingle();

  // Static pages
  const staticPages: MetadataRoute['sitemap'] = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/vehicles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/financing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/consignments`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/buy-direct`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/we-search-for-you`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  if (!client) {
    return staticPages;
  }

  // Vehículos visibles en el sitio. La visibilidad real es por el estado del
  // vehículo (clients_vehicles_states.show_in_web), no por un string 'available'.
  // Excluimos Vendido/Reservado (solo se muestran 3 días → serían 404 pronto).
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, updated_at, status:status_id(name, show_in_web)')
    .eq('client_id', client.id);

  const vehiclePages: MetadataRoute['sitemap'] = (vehicles || [])
    .filter((v: any) => {
      const st = Array.isArray(v.status) ? v.status[0] : v.status;
      if (!st) return false;
      const show =
        typeof st.show_in_web === 'boolean'
          ? st.show_in_web
          : st.name === 'Publicado';
      if (!show) return false;
      return st.name !== 'Vendido' && st.name !== 'Reservado';
    })
    .map((vehicle: any) => ({
      url: `${baseUrl}/vehicles/${vehicle.id}`,
      lastModified: vehicle.updated_at ? new Date(vehicle.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // Páginas custom del builder (client_custom_pages) publicadas.
  const { data: customPages } = await supabase
    .from('client_custom_pages')
    .select('slug, updated_at')
    .eq('client_id', client.id)
    .eq('is_published', true);

  const customPagePages: MetadataRoute['sitemap'] = (customPages || []).map(
    (page: any) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })
  );

  // Excluir del sitemap las páginas de sistema que el cliente eliminó en el builder.
  const { data: cfg } = await supabase
    .from('client_website_config')
    .select('elements_structure')
    .eq('client_id', client.id)
    .maybeSingle();
  const hiddenSlugs = getHiddenSystemPages(cfg);
  const visibleStatic = (staticPages || []).filter((p: any) => {
    const slug = String(p.url).replace(baseUrl, '').replace(/^\//, '');
    return !hiddenSlugs.includes(slug);
  });

  return [...visibleStatic, ...vehiclePages, ...customPagePages];
}
