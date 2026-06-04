'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  Button,
} from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useReducedMotion, MotionConfig } from 'framer-motion';
import lz from 'lzutf8';

import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import ThemeToggle from '../ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from '@/i18n/hooks/useTranslation';

// Extract logo from builder config as fallback when client.logo is null
export function extractBuilderLogo(client: any): string | null {
  try {
    const config = client?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;
    const raw = cfg?.elements_structure;
    if (!raw) return null;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    // Try to find the home page light data (base64 encoded Craft.js JSON)
    const pageData = parsed?.pages?.home?.light;
    if (!pageData) return null;
    const decoded = atob(pageData);
    // Search for logoUrl in the decoded string without full JSON parse (can be huge)
    const match = decoded.match(/"logoUrl"\s*:\s*"([^"]+)"/);
    return match?.[1] || null;
  } catch {
    return null;
  }
}

// Iconos para el menú móvil. Los links del builder no traen icono, así que lo
// derivamos de la URL (mismos iconos que el navbar por defecto) con fallback.
const NAV_ICON_BY_URL: Record<string, string> = {
  '/': 'solar:home-line-duotone',
  '/financing': 'solar:card-2-line-duotone',
  '/consignments': 'solar:bag-5-line-duotone',
  '/buy-direct': 'solar:cart-5-line-duotone',
  '/we-search-for-you': 'solar:compass-line-duotone',
  '/vehicles': 'solar:wheel-line-duotone',
  '/about': 'solar:users-group-rounded-line-duotone',
  '/contact': 'solar:chat-round-dots-line-duotone',
};
const iconForUrl = (url: string): string =>
  NAV_ICON_BY_URL[url] || 'solar:link-line-duotone';

interface ExtractedNav {
  links: { name: string; href: string; icon: string }[];
  cta: { name: string; href: string } | null;
}

/**
 * Extrae el navbar que el cliente configuró en el builder (links + CTA) leyendo
 * la página `home` guardada en elements_structure. Se usa SOLO cuando el builder
 * está activo (en /vehicles y /embed, donde el navbar real del builder no se
 * renderiza). Devuelve null si el builder está apagado, la estructura aún no se
 * hidrató, o no se encuentra un nodo navbar → el caller cae al navbar por defecto
 * (mismo comportamiento de hoy, sin regresión para clientes tradicionales).
 *
 * Descompresión auto-contenida con lzutf8 a propósito: importar getPageBuilderData
 * arrastraría BuilderRenderer (los ~60 componentes del builder) al bundle de /vehicles.
 */
function extractBuilderNav(
  client: any,
  theme: 'light' | 'dark',
  translations: Record<string, string> | null
): ExtractedNav | null {
  try {
    const config = client?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;
    if (!cfg?.is_enabled || !cfg?.elements_structure) return null;

    // Resolver el blob comprimido de la home desde el envelope (v3/v2/legacy).
    const structure = cfg.elements_structure;
    let compressed: string | null = null;
    if (typeof structure === 'object' && structure !== null) {
      const env: any = structure;
      if (env.v === 3) compressed = env.pages?.home?.[theme] || env.pages?.home?.light || env.pages?.home?.dark;
      else if (env.v === 2) compressed = env[theme] || env.light || env.dark;
    } else {
      const raw = String(structure);
      let env: any = null;
      try { env = JSON.parse(raw); } catch { env = null; }
      if (env?.v === 3) compressed = env.pages?.home?.[theme] || env.pages?.home?.light || env.pages?.home?.dark;
      else if (env?.v === 2) compressed = env[theme] || env.light || env.dark;
      else compressed = raw; // legacy single-theme (la home es el blob directo)
    }
    if (!compressed) return null;

    let parsed: any = lz.decompress(lz.decodeBase64(compressed));
    while (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { break; }
    }
    if (!parsed || typeof parsed !== 'object') return null;

    const nodes = parsed.nodes && typeof parsed.nodes === 'object' ? parsed.nodes : parsed;

    // Buscar el nodo navbar (BuilderNavbar o NavbarSimple).
    let navNodeId: string | null = null;
    let navNode: any = null;
    for (const [id, node] of Object.entries(nodes) as [string, any][]) {
      const rn = node?.type?.resolvedName;
      if (rn === 'BuilderNavbar' || rn === 'NavbarSimple') {
        navNodeId = id;
        navNode = node;
        break;
      }
    }
    if (!navNode) return null;

    const props = navNode.props || {};
    const rawLinks: any[] = Array.isArray(props.links) ? props.links : [];
    const links = rawLinks
      .filter((l) => l && typeof l.url === 'string' && l.url && typeof l.text === 'string')
      .map((l, i) => {
        let text = l.text as string;
        const key = `home::${navNodeId}::link_${i}`;
        if (translations && key in translations && translations[key]) text = translations[key];
        return { name: text, href: l.url as string, icon: iconForUrl(l.url) };
      });

    // El CTA solo existe en BuilderNavbar (NavbarSimple no tiene).
    let cta: { name: string; href: string } | null = null;
    if (navNode.type?.resolvedName === 'BuilderNavbar' && props.ctaUrl && props.ctaText) {
      let ctaText = props.ctaText as string;
      const ctaKey = `home::${navNodeId}::ctaText`;
      if (translations && ctaKey in translations && translations[ctaKey]) ctaText = translations[ctaKey];
      cta = { name: ctaText, href: props.ctaUrl as string };
    }

    return { links, cta };
  } catch {
    return null;
  }
}

const Navbar = () => {
  const { client } = useClientStore();
  const { theme, setTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { t, currentLanguage } = useTranslation();
  const prefersReduced = useReducedMotion();

  // Navbar por defecto (hardcodeado). Se usa cuando el builder está apagado,
  // aún no cargó la estructura, o no hay nodo navbar configurado.
  const defaultNavigation = useMemo(
    () => [
      { name: t('navigation.links.home'), href: '/', icon: 'solar:home-line-duotone' },
      { name: t('navigation.links.financing'), href: '/financing', icon: 'solar:card-2-line-duotone' },
      { name: t('navigation.links.consignments'), href: '/consignments', icon: 'solar:bag-5-line-duotone' },
      { name: t('navigation.links.buyDirect'), href: '/buy-direct', icon: 'solar:cart-5-line-duotone' },
      { name: t('navigation.links.weSearchForYou'), href: '/we-search-for-you', icon: 'solar:compass-line-duotone' },
    ],
    [t]
  );

  // Contenido builder siempre en español; las traducciones son es→en.
  const needsTranslation = !!(client as any)?.has_language_selector && currentLanguage === 'en';
  const translations = useMemo(() => {
    if (!needsTranslation) return null;
    const config = (client as any)?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;
    if (!cfg?.translations) return null;
    try {
      return typeof cfg.translations === 'object' ? cfg.translations : JSON.parse(cfg.translations);
    } catch {
      return null;
    }
  }, [needsTranslation, client]);

  // Si el builder está activo, usar los links/CTA que el cliente dejó en SU navbar
  // (en /vehicles y /embed el navbar real del builder no se renderiza). Si no se
  // puede determinar, builderNav es null y caemos al navbar por defecto.
  const builderNav = useMemo(
    () => extractBuilderNav(client, theme === 'dark' ? 'dark' : 'light', translations),
    [client, theme, translations]
  );

  const navigation = builderNav ? builderNav.links : defaultNavigation;
  const cta = builderNav ? builderNav.cta : { name: t('navigation.links.contact'), href: '/contact' };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const config = (client as any)?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;
    if (cfg?.is_enabled) {
      setTheme(cfg?.color_scheme === 'LIGHT' ? 'light' : 'dark');
    }
  }, [client, setTheme]);

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === href : pathname.startsWith(href)),
    [pathname]
  );

  // Fallback: if client has no logo, try to extract from builder config
  const builderLogo = useMemo(
    () => (!client?.logo && !client?.logo_dark) ? extractBuilderLogo(client) : null,
    [client]
  );

  const logoSrc = theme === 'dark'
    ? (client?.logo_dark || client?.logo || builderLogo)
    : (client?.logo || client?.logo_dark || builderLogo);

  const shouldShowThemeToggle = !!client?.has_dark_mode;
  const shouldShowLanguageSelector = !!client?.has_language_selector;

  // Transiciones globales más baratas si el usuario pide menos motion
  const transition = prefersReduced
    ? { type: false as const, duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.5 };

  return (
    <MotionConfig transition={transition}>
      <NextUINavbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className={`transition-all duration-300 fixed top-0 z-50 ${
          isScrolled
            ? 'bg-white/90 dark:bg-black/90 shadow-sm supports-[backdrop-filter]:backdrop-blur-md'
            : 'bg-transparent'
        }`}
        maxWidth="xl"
      >
        {/* Brand */}
        <NavbarContent justify="start">
          <NavbarBrand>
            <Link href="/" className="flex items-center gap-2" prefetch={false}>
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={client?.name || 'Logo'}
                  className="h-10 w-auto object-contain"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <div className="h-10 w-24" />
              )}
            </Link>
          </NavbarBrand>
        </NavbarContent>

        {/* Desktop nav (simple, sin Framer por item) */}
        <NavbarContent className="hidden sm:flex" justify="center">
          {navigation.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary font-semibold dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* Right side */}
        <NavbarContent justify="end" className="gap-3">
          {shouldShowLanguageSelector && (
            <NavbarItem className="hidden sm:flex">
              <LanguageSelector variant="minimal" className="rounded-full" />
            </NavbarItem>
          )}
          {shouldShowThemeToggle && (
            <NavbarItem className="hidden sm:flex">
              <ThemeToggle />
            </NavbarItem>
          )}
          {cta && (
            <NavbarItem className="hidden sm:flex">
              <Button
                as={Link}
                href={cta.href}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md px-4"
                variant="solid"
                prefetch={false}
              >
                {cta.name}
              </Button>
            </NavbarItem>
          )}
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="sm:hidden text-gray-700 dark:text-white"
          />
        </NavbarContent>

        {/* Mobile Menu (panel único animado; items con CSS) */}
        <NavbarMenu className="bg-transparent p-0" onClick={() => setIsMenuOpen(false)}>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                key="panel"
                initial={{ y: prefersReduced ? 0 : -12, opacity: prefersReduced ? 1 : 0.001 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: prefersReduced ? 0 : -12, opacity: prefersReduced ? 1 : 0 }}
                className="
                  mx-3 mt-3 mb-4 rounded-2xl border border-black/5 dark:border-white/10
                  bg-white/90 dark:bg-black/70
                  supports-[backdrop-filter]:backdrop-blur-xl
                  shadow-xl
                  overflow-hidden
                "
              >
                {/* Header panel */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    {shouldShowLanguageSelector && <LanguageSelector variant="minimal" className="rounded-full" />}
                    {shouldShowThemeToggle && <ThemeToggle />}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[50%]">
                    {client?.name}
                  </span>
                </div>

                {/* Lista */}
                <ul className="px-1 py-1">
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.href} className="list-none">
                        <Link
                          href={item.href}
                          prefetch={false}
                          onClick={() => setIsMenuOpen(false)}
                          className={`group block w-full select-none rounded-xl px-4 py-3 transition
                            ${active
                              ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid place-items-center rounded-lg size-9 bg-black/[0.03] dark:bg-white/[0.06]">
                              <Icon icon={item.icon} className="text-xl" />
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-base leading-none">{item.name}</span>
                                <Icon
                                  icon="solar:alt-arrow-right-linear"
                                  className={`text-lg transition-transform duration-200 group-hover:translate-x-0.5 ${
                                    active ? 'opacity-100' : 'opacity-60'
                                  }`}
                                />
                              </div>
                              <div
                                className={`mt-2 h-[2px] rounded-full transition-all duration-200 ${
                                  active
                                    ? 'w-14 bg-primary'
                                    : 'w-0 bg-transparent group-hover:w-10 group-hover:bg-white/40 dark:group-hover:bg-white/30'
                                }`}
                              />
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Footer acciones */}
                {cta && (
                  <div className="p-3 border-t border-black/5 dark:border-white/10">
                    <Button
                      as={Link}
                      href={cta.href}
                      prefetch={false}
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl h-11"
                      variant="solid"
                      startContent={<Icon icon="solar:chat-round-dots-line-duotone" className="text-xl" />}
                    >
                      {cta.name}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </NavbarMenu>
      </NextUINavbar>
    </MotionConfig>
  );
};

export default Navbar;
