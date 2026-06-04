'use client';

import { useRef, useMemo } from 'react';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { getPageBuilderData } from '@/lib/page-builder-data';
import { useBuilderReady } from '@/hooks/useBuilderReady';
import BuilderRenderer from '@/app/BuilderRenderer';

interface Props {
  slug: string;
  fallback: React.ReactNode;
}

// Global cache — persists across page navigations, no re-parsing on revisit
// Separate caches for default language and translated versions
const pageCacheDefault = new Map<string, { light: any; dark: any }>();
const pageCacheTranslated = new Map<string, { light: any; dark: any }>();

// Loader centrado mientras carga la estructura del builder. Mejor que una pantalla
// en blanco: comunica "está cargando" en vez de parecer que la página está rota.
function BuilderLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="h-9 w-9 rounded-full border-2 border-current border-t-transparent animate-spin text-gray-300 dark:text-neutral-700"
        role="status"
        aria-label="Cargando"
      />
    </div>
  );
}

export default function BuilderPageWrapper({ slug, fallback }: Props) {
  const { client, isLoading } = useClientStore();
  const { theme } = useThemeStore();
  const { currentLanguage } = useTranslation();
  const builderStatus = useBuilderReady();
  const clientIdRef = useRef<any>(null);

  // Invalidate caches if client changes
  if (client?.id && client.id !== clientIdRef.current) {
    clientIdRef.current = client.id;
    pageCacheDefault.clear();
    pageCacheTranslated.clear();
  }

  const cfg = useMemo(() => {
    const config = client?.client_website_config;
    return Array.isArray(config) ? config[0] : config;
  }, [client?.client_website_config]);

  // Determine if we should use AI translations
  // Builder content is always written in Spanish; translations are always es→en.
  // Apply translations when the user is viewing in English, regardless of default_language.
  const hasLanguageSelector = !!(client as any)?.has_language_selector;
  const needsTranslation = hasLanguageSelector && currentLanguage === 'en';

  // Parse translations from config
  const translations = useMemo(() => {
    if (!needsTranslation || !cfg?.translations) return null;
    try {
      return typeof cfg.translations === 'object' ? cfg.translations : JSON.parse(cfg.translations);
    } catch { return null; }
  }, [needsTranslation, cfg?.translations]);

  // Pick the right cache
  const cache = needsTranslation ? pageCacheTranslated : pageCacheDefault;

  // Load & cache current page synchronously
  if (!isLoading && cfg?.is_enabled && cfg?.elements_structure && !cache.has(slug)) {
    cache.set(slug, {
      light: getPageBuilderData(cfg, slug, 'light', translations),
      dark: getPageBuilderData(cfg, slug, 'dark', translations),
    });

    // Pre-cache ALL other pages in background
    const allSlugs = ['home', 'financing', 'consignments', 'buy-direct', 'we-search-for-you', 'contact', 'about'];
    const precache = () => {
      for (const s of allSlugs) {
        if (!cache.has(s)) {
          cache.set(s, {
            light: getPageBuilderData(cfg, s, 'light', translations),
            dark: getPageBuilderData(cfg, s, 'dark', translations),
          });
        }
      }
    };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(precache);
    } else {
      setTimeout(precache, 100);
    }
  }

  if (isLoading || !client?.id) return <BuilderLoading />;

  // elements_structure se carga en background (puede ser 10+ MB para tenants pesados).
  // Mientras llega, no mostrar fallback templates (causaría un cambio de UI completo
  // cuando llegue la config real): mostramos un loader. Si tras el timeout la
  // estructura nunca llegó (status 'fallback'), degradamos al template tradicional
  // para no dejar la página colgada con un spinner infinito.
  const isStructurePending = cfg?.is_enabled && !cfg?.elements_structure;
  if (isStructurePending) {
    return builderStatus === 'fallback' ? <>{fallback}</> : <BuilderLoading />;
  }

  const cached = cache.get(slug);
  if (!cached) return <>{fallback}</>;

  const data = theme === 'dark' ? (cached.dark || cached.light) : (cached.light || cached.dark);
  if (!data) return <>{fallback}</>;

  return <BuilderRenderer data={data} themeKey={`${theme}-${currentLanguage}`} fallback={fallback} />;
}
