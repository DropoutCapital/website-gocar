import React from 'react';
import { useNode } from '@craftjs/core';
import { isBlankHtml } from './logoHelpers';

interface LogoItem {
  src: string;
  alt: string;
}

interface LogoGroup {
  category: string;
  logos: LogoItem[];
}

interface LogoGridProps {
  title?: string;
  subtitle?: string;
  groups?: LogoGroup[];
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  grayscale?: boolean;
  logoMaxHeight?: number;
}

const placeholderLogo = (label: string) => {
  const safe = (label || '').replace(/[<>&'"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><rect x="1" y="1" width="158" height="58" rx="6" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1" stroke-dasharray="4 2"/><text x="80" y="34" font-family="-apple-system,system-ui,sans-serif" font-size="13" font-weight="500" fill="#6b7280" text-anchor="middle">${safe}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const DEFAULT_GROUPS: LogoGroup[] = [
  {
    category: 'Marcas que vendemos',
    logos: [
      { src: placeholderLogo('Marca 1'), alt: 'Marca 1' },
      { src: placeholderLogo('Marca 2'), alt: 'Marca 2' },
      { src: placeholderLogo('Marca 3'), alt: 'Marca 3' },
      { src: placeholderLogo('Marca 4'), alt: 'Marca 4' },
    ],
  },
  {
    category: 'Bancos partners',
    logos: [
      { src: placeholderLogo('Banco 1'), alt: 'Banco 1' },
      { src: placeholderLogo('Banco 2'), alt: 'Banco 2' },
      { src: placeholderLogo('Banco 3'), alt: 'Banco 3' },
    ],
  },
  {
    category: 'Certificaciones',
    logos: [
      { src: placeholderLogo('Cert 1'), alt: 'Cert 1' },
      { src: placeholderLogo('Cert 2'), alt: 'Cert 2' },
    ],
  },
];

export const LogoGrid = ({
  title = 'Con el respaldo de los mejores',
  subtitle = 'Trabajamos con empresas e instituciones de primer nivel',
  groups = DEFAULT_GROUPS,
  bgColor = '#ffffff',
  textColor = '#111827',
  accentColor = '#3b82f6',
  grayscale = true,
  logoMaxHeight = 44,
}: LogoGridProps) => {
  const { connectors, selected } = useNode((s) => ({
    selected: s.events.selected,
  }));

  const subtextColor = `${textColor}99`;

  return (
    <div
      ref={(el: HTMLDivElement | null) => {
        if (el) connectors.connect(el);
      }}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        position: 'relative',
        border: selected ? '2px dashed #666' : '1px solid transparent',
        outline: selected ? '1px dashed #999' : 'none',
        outlineOffset: selected ? '2px' : '0px',
      }}
      className='w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8'
    >
      <div className='max-w-7xl mx-auto'>
        {(!isBlankHtml(title) || !isBlankHtml(subtitle)) && (
        <div className='text-center mb-12'>
          {!isBlankHtml(title) && (
          <h2
            className='text-2xl md:text-3xl font-bold'
            style={{ color: textColor }}
          >
            {title}
          </h2>
          )}
          {!isBlankHtml(subtitle) && (
            <p
              className='mt-2 text-sm md:text-base'
              style={{ color: subtextColor }}
            >
              {subtitle}
            </p>
          )}
        </div>
        )}

        <div className='space-y-10'>
          {groups.map((group, gi) => (
            <div key={gi}>
              <div className='flex items-center gap-3 mb-5'>
                <div
                  className='h-px flex-1'
                  style={{ backgroundColor: `${textColor}20` }}
                />
                <h3
                  className='text-sm font-semibold uppercase tracking-wider'
                  style={{ color: accentColor }}
                >
                  {group.category}
                </h3>
                <div
                  className='h-px flex-1'
                  style={{ backgroundColor: `${textColor}20` }}
                />
              </div>
              <div className='flex flex-wrap items-center justify-center gap-x-12 gap-y-6'>
                {group.logos.map((logo, li) => (
                  <div
                    key={li}
                    className='flex items-center justify-center min-h-[60px] min-w-[120px]'
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt || ''}
                      style={{
                        maxHeight: `${logoMaxHeight}px`,
                        filter: grayscale ? 'grayscale(100%)' : 'none',
                        opacity: grayscale ? 0.7 : 1,
                      }}
                      className='w-auto object-contain'
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

LogoGrid.craft = {
  displayName: 'LogoGrid',
  props: {
    title: 'Con el respaldo de los mejores',
    subtitle: 'Trabajamos con empresas e instituciones de primer nivel',
    groups: DEFAULT_GROUPS,
    bgColor: '#ffffff',
    textColor: '#111827',
    accentColor: '#3b82f6',
    grayscale: true,
    logoMaxHeight: 44,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
