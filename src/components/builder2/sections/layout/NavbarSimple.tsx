import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useNode, useEditor } from '@craftjs/core';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface NavLink {
  text: string;
  url: string;
}

interface NavbarSimpleProps {
  links?: NavLink[];
  bgColor?: string;
  textColor?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

/** Sun icon */
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

/** Moon icon */
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

/** Hamburger / X icon */
const MenuIcon = ({ open, color }: { open: boolean; color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      <>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    )}
  </svg>
);

const ALIGN_MAP: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export const NavbarSimple = ({
  links = [
    { text: 'Inicio', url: '/' },
    { text: 'Financiamiento', url: '/financing' },
    { text: 'Consignaciones', url: '/consignments' },
    { text: 'Compra directa', url: '/buy-direct' },
  ],
  bgColor = '#ffffff',
  textColor = '#4b5563',
  align = 'center',
  sticky = true,
}: NavbarSimpleProps) => {
  const { connectors } = useNode();
  const { client } = useClientStore();
  const { theme, toggleTheme } = useThemeStore();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Get current path safely (usePathname crashes inside CraftJS Frame)
  const [pathname, setPathname] = useState('/');
  useEffect(() => {
    setPathname(window.location.pathname);
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    setPathname(window.location.pathname);
  });

  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const primaryColor = client?.theme?.light?.primary || '#e05d31';
  const hasDarkMode = !!client?.has_dark_mode;
  const hasLanguageSelector = !!client?.has_language_selector;

  const isDarkBg = (() => {
    const c = bgColor.replace('#', '');
    if (c.length !== 6) return false;
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b < 0.4;
  })();

  const effectiveBg = theme === 'dark' && !isDarkBg ? '#141414' : bgColor;
  const effectiveText = theme === 'dark' && !isDarkBg ? '#d4d4d4' : textColor;

  // Active route detection
  const isActiveLink = useCallback((url: string) => {
    if (url === '/') return pathname === '/';
    return pathname?.startsWith(url);
  }, [pathname]);

  const hasRightControls = hasLanguageSelector || hasDarkMode;

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{
        backgroundColor: effectiveBg,
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 0 : undefined,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
      className="w-full transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Desktop nav links */}
          <div className={`hidden sm:flex flex-1 items-center gap-1 ${ALIGN_MAP[align] || 'justify-center'}`}>
            {links.map((link, i) => (
              <Link
                key={i}
                href={link.url}
                className="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:opacity-80"
                style={{
                  color: isActiveLink(link.url) ? primaryColor : effectiveText,
                  fontWeight: isActiveLink(link.url) ? 600 : 500,
                }}
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* Right side controls (only if client has them) */}
          {hasRightControls && (
            <div className="hidden sm:flex items-center gap-3">
              {hasLanguageSelector && (
                <LanguageSelector variant="minimal" className="rounded-full" />
              )}
              {hasDarkMode && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ color: effectiveText }}
                  aria-label="Cambiar tema"
                >
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
              )}
            </div>
          )}

          {/* Mobile: spacer + hamburger */}
          <div className="flex sm:hidden items-center justify-end flex-1">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-md transition-colors hover:opacity-80"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <MenuIcon open={mobileOpen} color={effectiveText} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div
          className="sm:hidden overflow-hidden"
          style={{ backgroundColor: effectiveBg }}
        >
          <div className="mx-3 mt-1 mb-3 rounded-2xl border overflow-hidden"
            style={{ borderColor: isDarkBg || theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
          >
            {/* Header with toggles */}
            {hasRightControls && (
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                {hasLanguageSelector && <LanguageSelector variant="minimal" className="rounded-full" />}
                {hasDarkMode && (
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full transition-colors hover:opacity-80"
                    style={{ color: effectiveText }}
                    aria-label="Cambiar tema"
                  >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                  </button>
                )}
              </div>
            )}

            {/* Nav links */}
            <ul className="px-1 py-1">
              {links.map((link, i) => {
                const active = isActiveLink(link.url);
                return (
                  <li key={i} className="list-none">
                    <Link
                      href={link.url}
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-xl px-4 py-3 transition-colors"
                      style={{
                        backgroundColor: active ? `${primaryColor}15` : 'transparent',
                        color: active ? primaryColor : effectiveText,
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{link.text}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.4 }}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

NavbarSimple.craft = {
  displayName: 'NavbarSimple',
  props: {
    links: [
      { text: 'Inicio', url: '/' },
      { text: 'Financiamiento', url: '/financing' },
      { text: 'Consignaciones', url: '/consignments' },
      { text: 'Compra directa', url: '/buy-direct' },
    ],
    bgColor: '#ffffff',
    textColor: '#4b5563',
    align: 'center',
    sticky: true,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
