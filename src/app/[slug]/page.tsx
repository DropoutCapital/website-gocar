import { Metadata } from 'next';
import { getClient } from '@/hooks/useClient';
import { getCustomPageBySlug } from '@/lib/builder-pages';
import CustomPageClient from './CustomPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const client = await getClient();
  if (!client?.id) return {};

  const page = await getCustomPageBySlug(client.id, slug);
  if (!page) return {}; // sin fila → hereda el template del layout (no forzar 404 acá)

  const title = page.seo_title || page.title;
  const description = page.seo_description || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title,
      description,
      url: `/${slug}`,
      type: 'website',
    },
  };
}

export default function CustomPage() {
  return <CustomPageClient />;
}
