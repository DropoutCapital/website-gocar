import { supabase } from './supabase';

export const BUILDER_PAGES = [
  { slug: 'home', label: 'Inicio', route: '/' },
  { slug: 'financing', label: 'Financiamiento', route: '/financing' },
  { slug: 'consignments', label: 'Consignaciones', route: '/consignments' },
  { slug: 'buy-direct', label: 'Compra Directa', route: '/buy-direct' },
  { slug: 'we-search-for-you', label: 'Buscamos por Ti', route: '/we-search-for-you' },
  { slug: 'contact', label: 'Contacto', route: '/contact' },
  { slug: 'about', label: 'Nosotros', route: '/about' },
] as const;

export type PageSlug = typeof BUILDER_PAGES[number]['slug'];

export interface CustomPageSeo {
  title: string;
  seo_title: string | null;
  seo_description: string | null;
}

/**
 * SEO de una página custom del builder (client_custom_pages) por slug.
 * Devuelve null si no existe o no está publicada. Recibe clientId para no
 * acoplar este módulo (también importado por componentes cliente) a next/headers.
 */
export async function getCustomPageBySlug(
  clientId: string | number,
  slug: string
): Promise<CustomPageSeo | null> {
  try {
    const { data, error } = await supabase
      .from('client_custom_pages')
      .select('title, seo_title, seo_description')
      .eq('client_id', clientId)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();
    if (error) throw error;
    return (data as CustomPageSeo) || null;
  } catch (error) {
    console.error('Error fetching custom page SEO:', error);
    return null;
  }
}
