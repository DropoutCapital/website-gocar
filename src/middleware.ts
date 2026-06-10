import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface Client {
  id: string;
  name: string;
  logo: string;
  favicon: string;
  domain: string;
  custom_domain?: string | null;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    google_site_verification?: string;
    // Redes sociales del negocio (Instagram/Facebook/...) → sameAs del AutoDealer.
    social_links?: Record<string, string> | string[] | null;
  };
  // Necesarios para los datos estructurados (AutoDealer / Offer) del sitio público.
  contact?: { email?: string; phone?: string; address?: string };
  location?: { lat?: number | string | null; lng?: number | string | null };
  currency?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

// Configuración de rutas que necesitan SEO dinámico
export const config = {
  matcher: [
    '/',
    '/vehicles/:path*',
    '/contact',
    '/about',
    '/favicon.ico',
    '/((?!api|_next/static|_next/image).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const isFaviconRequest = request.nextUrl.pathname === '/favicon.ico';

  const isCrawler =
    userAgent.includes('bot') ||
    userAgent.includes('crawler') ||
    userAgent.includes('spider') ||
    userAgent.includes('whatsapp') ||
    userAgent.includes('facebook') ||
    userAgent.includes('twitter');

  const requestHeaders = new Headers(request.headers);

  try {
    // Guard the lookup with a hard timeout. Supabase lives in us-west-1 while
    // this middleware runs from gru1 (São Paulo); a network hiccup on that
    // cross-region hop used to leave the await hanging until Vercel killed the
    // whole invocation at ~25s (MIDDLEWARE_INVOCATION_TIMEOUT → 504). If the
    // lookup doesn't resolve fast, we abort and fall through to next() so the
    // page still renders (with default SEO) instead of erroring.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    let client: Client | null = null;
    try {
      // Resuelve el tenant por el subdominio *.goauto.cl (domain) o por el
      // dominio propio que el cliente haya conectado (custom_domain).
      const { data } = (await supabase
        .from('clients')
        .select(
          'id, name, logo, favicon, seo, domain, custom_domain, contact, location, currency'
        )
        .or(`domain.eq.${hostname},custom_domain.eq.${hostname}`)
        .abortSignal(controller.signal)
        .maybeSingle()) as { data: Client | null };
      client = data;
    } finally {
      clearTimeout(timeout);
    }

    if (!client) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    if (isFaviconRequest && client.favicon) {
      return NextResponse.redirect(new URL(client.favicon, request.url));
    }

    requestHeaders.set('x-client-data', JSON.stringify(client));
    if (isCrawler) {
      requestHeaders.set('x-is-crawler', '1');
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}
