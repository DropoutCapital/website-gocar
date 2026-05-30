import { supabase } from '@/lib/supabase';
import { ClientWebsiteConfig } from '@/utils/types';

export async function getWebsiteConfig(
  clientId: string
): Promise<ClientWebsiteConfig | null> {
  if (!clientId) return null;

  try {
    // Only select what the root layout actually consumes (integrations).
    // A plain select('*') drags down elements_structure — the LZ-compressed
    // builder JSON — which can reach 45 MB for a single client. Because the
    // layout is force-dynamic, that payload was being fetched server-side
    // (cross-region) on EVERY navigation, blocking the HTML and occasionally
    // tripping Vercel's MIDDLEWARE/render timeout (504). ClientProvider already
    // excludes elements_structure from its client-side fetch for the same reason.
    const { data, error } = await supabase
      .from('client_website_config')
      .select('id, client_id, integrations')
      .eq('client_id', clientId)
      .single();

    if (error) {
      console.error('Error loading website configuration:', error);
      return null;
    }

    return data as ClientWebsiteConfig;
  } catch (error) {
    console.error('Failed to fetch website configuration:', error);
    return null;
  }
}
