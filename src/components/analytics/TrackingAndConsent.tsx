'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

type ConsentState = 'unknown' | 'accepted' | 'rejected';
const CONSENT_STORAGE_KEY = 'goauto_cookie_consent_v1';

export type TrackingAndConsentProps = {
  pixelId?: string;
  gtmId?: string;
  ga4Id?: string;
  vambeClientId?: string;
  vambeChannelId?: string;
  requireConsent: boolean;
};

function readStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === 'accepted' || raw === 'rejected') return raw;
  } catch {}
  return 'unknown';
}

export default function TrackingAndConsent({
  pixelId,
  gtmId,
  ga4Id,
  vambeClientId,
  vambeChannelId,
  requireConsent,
}: TrackingAndConsentProps) {
  const [consent, setConsent] = useState<ConsentState>('unknown');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(readStoredConsent());
  }, []);

  const persistConsent = (value: 'accepted' | 'rejected') => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {}
    setConsent(value);
  };

  const hasAnyTracker = Boolean(pixelId || gtmId || ga4Id);
  const canLoadScripts =
    hasAnyTracker && (!requireConsent || consent === 'accepted');
  const showBanner =
    mounted && hasAnyTracker && requireConsent && consent === 'unknown';

  return (
    <>
      {canLoadScripts && pixelId && (
        <>
          <Script id='meta-pixel' strategy='afterInteractive'>
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height='1'
              width='1'
              style={{ display: 'none' }}
              alt=''
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {canLoadScripts && gtmId && (
        <Script id='gtm' strategy='afterInteractive'>
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      )}

      {canLoadScripts && ga4Id && (
        <>
          <Script
            id='ga4-loader'
            strategy='afterInteractive'
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <Script id='ga4-init' strategy='afterInteractive'>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `}
          </Script>
        </>
      )}

      {/* Vambe webchat: widget funcional (chat), no tracking. No se gatea por
          consentimiento de cookies — se carga siempre que esté configurado.
          El config inline va ANTES del script externo: webchat.js lee
          window.embeddedWebchatConfig una sola vez al ejecutar y si no existe
          aborta sin reintentar. next/script respeta el orden con misma estrategia. */}
      {vambeClientId && vambeChannelId && (
        <>
          <Script id='vambe-config' strategy='afterInteractive'>
            {`window.embeddedWebchatConfig = { clientId: ${JSON.stringify(
              vambeClientId
            )}, channelId: ${JSON.stringify(vambeChannelId)} };`}
          </Script>
          <Script
            id='vambe-webchat'
            src='https://vambeai.com/webchat.js'
            strategy='afterInteractive'
          />
        </>
      )}

      {showBanner && (
        <div
          role='dialog'
          aria-live='polite'
          aria-label='Consentimiento de cookies'
          className='fixed bottom-4 left-4 right-4 z-[9999] sm:left-auto sm:right-4 sm:max-w-md rounded-xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl p-4 text-gray-800 dark:bg-neutral-900/95 dark:border-neutral-700 dark:text-gray-100'
        >
          <p className='text-sm font-semibold mb-1'>
            Usamos cookies para mejorar tu experiencia
          </p>
          <p className='text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3'>
            Utilizamos cookies de terceros (Meta, Google) para medir el tráfico
            y mostrarte contenido más relevante. Puedes aceptar o rechazar su
            uso en cualquier momento.
          </p>
          <div className='flex gap-2'>
            <button
              onClick={() => persistConsent('rejected')}
              className='flex-1 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors dark:text-gray-200 dark:border-neutral-700 dark:hover:bg-neutral-800'
            >
              Rechazar
            </button>
            <button
              onClick={() => persistConsent('accepted')}
              className='flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors'
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
