'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { resolveNavLink } from '@/utils/functions';

export interface MegaNavbarProps {
  links?: { text: string; url: string }[];
  ctaText?: string;
  ctaUrl?: string;
  logoUrl?: string;       // logo ya resuelto
  showLogo?: boolean;
  logoHeight?: number;
  companyName?: string;
  navTextColor?: string;  // color del texto/logo sobre el hero (transparente)
  ctaBgColor?: string;    // ya resuelto (con fallback al primary)
  ctaTextColor?: string;
  fullWidth?: boolean;
  // hasHero=true: transparente sobre el hero arriba → barra blanca sólida al scroll.
  // hasHero=false (rutas sin hero): barra blanca sólida siempre.
  hasHero?: boolean;
  // isEditor=true: relative (dentro del canvas del builder), sin fixed/scroll.
  isEditor?: boolean;
  onNavClick?: (e: React.MouseEvent) => void;
}

/** Hamburger / X icon */
const MenuIcon = ({ open, color }: { open: boolean; color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

/**
 * Navbar del megacomponente HeroMega, extraído para poder renderizarlo en TODAS
 * las rutas (no solo en la home): así el navbar que el dealer configuró en su home
 * aparece idéntico en el resto del sitio (mismo logo, links, CTA y efecto), sin el
 * chrome del Navbar genérico (toggle de tema / selector de idioma).
 *
 * - En la home (hasHero) lo renderiza HeroMega: transparente sobre el hero →
 *   sólido al scrollear. El logo, si es oscuro, se muestra en blanco arriba.
 * - En el resto de rutas lo renderiza el Navbar del layout (hasHero=false): barra
 *   blanca sólida siempre.
 */
export function MegaNavbar({
  links = [],
  ctaText = 'Contacto',
  ctaUrl = '/contact',
  logoUrl = '',
  showLogo = true,
  logoHeight = 40,
  companyName = 'Automotora',
  navTextColor = '#ffffff',
  ctaBgColor = '#dc2626',
  ctaTextColor = '#ffffff',
  fullWidth = false,
  hasHero = false,
  isEditor = false,
  onNavClick,
}: MegaNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto scroll solo en público con hero: transparente arriba → sólido al scroll.
  useEffect(() => {
    if (isEditor || !hasHero) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isEditor, hasHero]);

  const isFixed = !isEditor;
  // Sólido: rutas sin hero siempre; con hero, al scrollear o con el menú móvil.
  const solid = isFixed && (!hasHero || scrolled || mobileOpen);
  const navText = solid ? '#1f2937' : navTextColor;
  const containerWidth = fullWidth ? 'max-w-full' : 'max-w-7xl';
  const cta = resolveNavLink(ctaUrl);

  const handleClick = (e: React.MouseEvent) => { onNavClick?.(e); };

  return (
    <nav
      className={
        isFixed
          ? 'fixed top-0 left-0 right-0 z-50 transition-colors duration-300'
          : 'relative z-20 w-full'
      }
      style={
        isFixed
          ? {
              backgroundColor: solid ? 'rgba(255,255,255,0.92)' : 'transparent',
              backdropFilter: solid ? 'blur(8px)' : undefined,
              boxShadow: solid ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }
          : undefined
      }
    >
      <div className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            {showLogo && logoUrl ? (
              <Link href="/" onClick={handleClick}>
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="w-auto object-contain"
                  style={{
                    height: `${logoHeight}px`,
                    // Logo oscuro → blanco mientras el navbar es transparente sobre
                    // el hero; color normal cuando la barra es blanca.
                    filter: solid ? undefined : 'brightness(0) invert(1)',
                  }}
                />
              </Link>
            ) : (
              <Link href="/" onClick={handleClick} className="text-xl font-bold" style={{ color: navText }}>
                {companyName}
              </Link>
            )}
          </div>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link, i) => {
              const { href, isExternal } = resolveNavLink(link.url);
              const cls = 'px-3 py-2 text-sm font-semibold rounded-md transition-opacity hover:opacity-70 whitespace-nowrap';
              return isExternal ? (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={cls} style={{ color: navText }}>
                  {link.text}
                </a>
              ) : (
                <Link key={i} href={href} onClick={handleClick} className={cls} style={{ color: navText }}>
                  {link.text}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {ctaText && ctaUrl && (
              <Link
                href={cta.href}
                {...(cta.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={handleClick}
                className="hidden lg:block px-5 py-2.5 text-sm font-semibold rounded-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}
              >
                {ctaText}
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-md transition-opacity hover:opacity-80"
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <MenuIcon open={mobileOpen} color={navText} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden relative z-20 mx-4 mb-2 rounded-2xl overflow-hidden bg-white shadow-xl">
          <ul className="px-1 py-1">
            {links.map((link, i) => {
              const { href, isExternal } = resolveNavLink(link.url);
              const cls = 'block w-full rounded-xl px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-50';
              const onClick = (e: React.MouseEvent) => { handleClick(e); setMobileOpen(false); };
              return (
                <li key={i} className="list-none">
                  {isExternal ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
                      {link.text}
                    </a>
                  ) : (
                    <Link href={href} onClick={onClick} className={cls}>
                      {link.text}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {ctaText && ctaUrl && (
            <div className="p-3 border-t border-gray-100">
              <Link
                href={cta.href}
                {...(cta.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={(e) => { handleClick(e); setMobileOpen(false); }}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl"
                style={{ backgroundColor: ctaBgColor, color: ctaTextColor }}
              >
                {ctaText}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default MegaNavbar;
