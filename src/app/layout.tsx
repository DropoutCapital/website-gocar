import { Poppins } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { getClient } from '../hooks/useClient';
import { HeroUIProvider } from '@/providers/HeroUIProvider';
import { ClientProvider } from '@/providers/ClientProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import ConditionalNavbar from '@/components/layout/ConditionalNavbar';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { VisitTracker } from '@/components/analytics/VisitTracker';
import TrackingAndConsent from '@/components/analytics/TrackingAndConsent';
import RoutePrefetcher from '@/components/routing/RoutePrefetcher';
import { ToastContainer } from 'react-toastify';
import DebugPropGuard from './DebugPropGuard';
import { headers } from 'next/headers';
import { getWebsiteConfig } from '@/lib/website-config';
import { getDealershipsByClientId } from '@/lib/vehicles';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildDealerJsonLd, buildWebsiteJsonLd } from '@/lib/structured-data';
import { BUILDER_FONTS_HREF } from '@/lib/builder-fonts';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export async function generateMetadata() {
  const client = await getClient();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  const baseUrl = `https://${host}`;

  const title = client?.seo?.title || 'Automotora';
  const description = client?.seo?.description || 'Descripción por defecto';
  const keywords = client?.seo?.keywords || [];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords,
    alternates: {
      canonical: '/',
    },
    icons: client?.favicon
      ? {
          icon: [
            { url: client.favicon, sizes: 'any', type: 'image/x-icon' },
            { url: client.favicon, sizes: '32x32', type: 'image/png' },
          ],
        }
      : undefined,
    // Verificación de Search Console por tenant (cada automotora tiene su
    // propia propiedad). Se configura desde el admin en clients.seo.
    verification: client?.seo?.google_site_verification
      ? { google: client.seo.google_site_verification }
      : undefined,
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: title,
      images: (client?.logo || client?.favicon)
        ? [{ url: client.logo || client.favicon, width: 800, height: 600, alt: title }]
        : [],
      type: 'website',
      locale: 'es_CL',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: (client?.logo || client?.favicon) ? [client.logo || client.favicon] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await getClient();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  const baseUrl = `https://${host}`;

  const [websiteConfig, dealerships] = await Promise.all([
    client?.id ? getWebsiteConfig(client.id) : Promise.resolve(null),
    client?.id ? getDealershipsByClientId(client.id) : Promise.resolve([]),
  ]);
  const integrations = websiteConfig?.integrations ?? {
    google_reviews_enabled: false,
    pixel_id: '',
    gtm_id: '',
  };

  // Datos estructurados a nivel de sitio (AutoDealer + WebSite). Google los
  // dedupe entre páginas, así que van en el layout y no en cada page.
  const orgJsonLd = client
    ? [
        buildDealerJsonLd(client, dealerships, baseUrl),
        buildWebsiteJsonLd(client, baseUrl),
      ]
    : [];

  return (
    <html lang='es' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme_mode');
                  var theme = stored ? JSON.parse(stored).state?.theme : null;
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.backgroundColor = '#141414';
                    document.body.style.backgroundColor = '#141414';
                  } else {
                    document.documentElement.style.backgroundColor = '#ffffff';
                    document.body.style.backgroundColor = '#ffffff';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Fuentes curadas del builder (selector inline de tipo de fuente).
            Un solo request combinado; el navegador descarga cada binario sólo
            cuando una fuente se usa realmente. Lista en @/lib/builder-fonts. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={BUILDER_FONTS_HREF} />
        {orgJsonLd.length > 0 && <JsonLd data={orgJsonLd} />}
      </head>
      <body className={`${poppins.variable} antialiased bg-white dark:bg-dark-bg`}>
        {process.env.NODE_ENV !== 'production' && <DebugPropGuard />}
        <HeroUIProvider>
          <ClientProvider>
            <I18nProvider>
              <ThemeProvider>
                <div className='min-h-screen bg-white dark:bg-dark-bg transition-colors'>
                  <ToastContainer
                    position='top-right'
                    autoClose={2000}
                    hideProgressBar={false}
                    closeOnClick
                    pauseOnHover
                  />
                  <VisitTracker />
                  <TrackingAndConsent
                    pixelId={integrations.pixel_id || undefined}
                    gtmId={integrations.gtm_id || undefined}
                    ga4Id={integrations.ga4_id || undefined}
                    requireConsent={integrations.require_cookie_consent ?? true}
                  />
                  <RoutePrefetcher routes={['/', '/financing', '/consignments', '/buy-direct', '/we-search-for-you', '/contact', '/about', '/vehicles']} />
                  <ConditionalNavbar />
                  {children}
                  <ConditionalFooter />
                </div>
              </ThemeProvider>
            </I18nProvider>
          </ClientProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
