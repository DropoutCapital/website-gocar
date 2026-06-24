'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNode, useEditor } from '@craftjs/core';
import useClientStore from '@/store/useClientStore';
import useVehiclesStore from '@/store/useVehiclesStore';
import useVehicleFiltersStore from '@/store/useVehicleFiltersStore';
import { resolveNavLink } from '@/utils/functions';
import { Search } from 'lucide-react';
import { MegaNavbar } from '@/components/builder2/sections/layout/MegaNavbar';

interface NavLink {
  text: string;
  url: string;
}

interface HeroMegaProps {
  links?: NavLink[];
  ctaText?: string;
  ctaUrl?: string;
  logoUrl?: string;
  logoHeight?: number;
  showLogo?: boolean;
  titleLine1?: string;
  titleLine2?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  navTextColor?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
  searchButtonColor?: string;
  showSearch?: boolean;
  heroHeight?: number;
  fullWidth?: boolean;
}

const ChevronDown = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const HeroMega = ({
  links = [
    { text: 'Inicio', url: '/' },
    { text: 'Stock disponible', url: '/vehicles' },
    { text: 'Consignación', url: '/consignments' },
    { text: 'Compramos tu auto', url: '/buy-direct' },
    { text: 'Quiénes somos', url: '/about' },
    { text: 'Contacto', url: '/contact' },
  ],
  ctaText = 'Contacto',
  ctaUrl = '/contact',
  logoUrl = '',
  logoHeight = 44,
  showLogo = true,
  titleLine1 = 'Encuentra tu',
  titleLine2 = 'Próximo vehículo',
  backgroundImage = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920',
  overlayColor = '#0b1120',
  overlayOpacity = 0.45,
  textColor = '#ffffff',
  navTextColor = '#ffffff',
  ctaBgColor = '',
  ctaTextColor = '#ffffff',
  searchButtonColor = '#dc2626',
  showSearch = true,
  heroHeight = 640,
  fullWidth = false,
}: HeroMegaProps) => {
  const { connectors } = useNode();
  const { isEnabled } = useEditor((state) => ({ isEnabled: state.options.enabled }));
  const { client } = useClientStore();
  const { vehicles } = useVehiclesStore();
  const { setFilters } = useVehicleFiltersStore();
  const router = useRouter();

  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');

  // Reset model when brand changes
  useEffect(() => { setModelId(''); }, [brandId]);

  const primaryColor = client?.theme?.light?.primary || '#dc2626';
  const finalCtaBgColor = ctaBgColor || primaryColor;
  const companyName = client?.name || 'Automotora';
  const finalLogoUrl = logoUrl || client?.logo_dark || client?.logo || '';

  // Marcas/modelos derivados del stock real (mismo origen que /vehicles)
  const brands = useMemo(() => {
    const m = new Map<string, string>();
    vehicles.forEach((v: any) => {
      const id = v?.brand?.id;
      if (id != null && !m.has(String(id))) m.set(String(id), v.brand.name);
    });
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [vehicles]);

  const models = useMemo(() => {
    if (!brandId) return [] as [string, string][];
    const m = new Map<string, string>();
    vehicles.forEach((v: any) => {
      if (String(v?.brand?.id) !== brandId) return;
      const id = v?.model?.id;
      if (id != null && !m.has(String(id))) m.set(String(id), v.model.name);
    });
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [vehicles, brandId]);

  const handleNavClick = (e: React.MouseEvent) => {
    if (isEnabled) e.preventDefault();
  };

  const handleSearch = () => {
    if (isEnabled) return;
    const f: Record<string, any> = {};
    if (brandId) f.brand = [brandId];
    if (modelId) f.model = [String(modelId)];
    setFilters(f);
    router.push('/vehicles');
  };

  const containerWidth = fullWidth ? 'max-w-full' : 'max-w-7xl';

  return (
    <section
      ref={(el: HTMLElement | null) => { if (el) connectors.connect(el); }}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: textColor,
        minHeight: `${heroHeight}px`,
        position: 'relative',
      }}
      className="w-full flex flex-col"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />

      {/* Spacer: el MegaNavbar es fixed en público (overlay); reponemos su alto
          (h-16) para que el contenido del hero no quede tapado. En el editor el
          MegaNavbar es relative (en flujo) y no hace falta spacer. */}
      {!isEnabled && <div aria-hidden="true" style={{ height: 64 }} />}

      {/* Navbar del hero, compartido con el resto de rutas (ver MegaNavbar). */}
      <MegaNavbar
        hasHero
        isEditor={isEnabled}
        links={links}
        ctaText={ctaText}
        ctaUrl={ctaUrl}
        logoUrl={finalLogoUrl}
        showLogo={showLogo}
        logoHeight={logoHeight}
        companyName={companyName}
        navTextColor={navTextColor}
        ctaBgColor={finalCtaBgColor}
        ctaTextColor={ctaTextColor}
        fullWidth={fullWidth}
        onNavClick={handleNavClick}
      />

      {/* Hero content */}
      <div className={`relative z-10 flex-1 flex flex-col justify-center ${containerWidth} w-full mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
        <h1 className="max-w-3xl" style={{ color: textColor }}>
          {titleLine1 && (
            <span className="block text-3xl sm:text-4xl md:text-5xl font-light tracking-tight">
              {titleLine1}
            </span>
          )}
          {titleLine2 && (
            <span className="block text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mt-1">
              {titleLine2}
            </span>
          )}
        </h1>

        {showSearch && (
          <div className="mt-8 w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row items-stretch gap-2">
              {/* Marca */}
              <div className="relative flex-1">
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  disabled={isEnabled}
                  className="w-full appearance-none bg-gray-50 text-gray-700 rounded-xl pl-4 pr-9 py-3.5 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">Marca</option>
                  {brands.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <ChevronDown color="#6b7280" />
              </div>
              {/* Modelo */}
              <div className="relative flex-1">
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  disabled={isEnabled || !brandId}
                  className="w-full appearance-none bg-gray-50 text-gray-700 rounded-xl pl-4 pr-9 py-3.5 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">Modelo</option>
                  {models.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <ChevronDown color="#6b7280" />
              </div>
              {/* Buscar */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center rounded-xl px-5 py-3.5 transition-opacity hover:opacity-90 sm:w-14"
                style={{ backgroundColor: searchButtonColor }}
                aria-label="Buscar"
              >
                <Search size={20} color="#ffffff" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

HeroMega.craft = {
  displayName: 'Mega Cabecera',
  props: {
    links: [
      { text: 'Inicio', url: '/' },
      { text: 'Stock disponible', url: '/vehicles' },
      { text: 'Consignación', url: '/consignments' },
      { text: 'Compramos tu auto', url: '/buy-direct' },
      { text: 'Quiénes somos', url: '/about' },
      { text: 'Contacto', url: '/contact' },
    ],
    ctaText: 'Contacto',
    ctaUrl: '/contact',
    logoUrl: '',
    logoHeight: 44,
    showLogo: true,
    titleLine1: 'Encuentra tu',
    titleLine2: 'Próximo vehículo',
    backgroundImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920',
    overlayColor: '#0b1120',
    overlayOpacity: 0.45,
    textColor: '#ffffff',
    navTextColor: '#ffffff',
    ctaBgColor: '',
    ctaTextColor: '#ffffff',
    searchButtonColor: '#dc2626',
    showSearch: true,
    heroHeight: 640,
    fullWidth: false,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
