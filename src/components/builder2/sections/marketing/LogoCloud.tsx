import React from 'react';
import { useNode } from '@craftjs/core';
import { isBlankHtml } from './logoHelpers';

interface LogoItem {
  src: string;
  alt: string;
  url?: string;
}

interface LogoCloudProps {
  title?: string;
  subtitle?: string;
  logos?: LogoItem[];
  bgColor?: string;
  textColor?: string;
  columns?: 3 | 4 | 5 | 6;
  grayscale?: boolean;
  logoMaxHeight?: number;
}

const placeholderLogo = (label: string) => {
  const safe = (label || '').replace(/[<>&'"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60"><rect x="1" y="1" width="158" height="58" rx="6" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1" stroke-dasharray="4 2"/><text x="80" y="34" font-family="-apple-system,system-ui,sans-serif" font-size="13" font-weight="500" fill="#6b7280" text-anchor="middle">${safe}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const DEFAULT_LOGOS: LogoItem[] = [
  { src: placeholderLogo('Marca 1'), alt: 'Marca 1' },
  { src: placeholderLogo('Marca 2'), alt: 'Marca 2' },
  { src: placeholderLogo('Marca 3'), alt: 'Marca 3' },
  { src: placeholderLogo('Marca 4'), alt: 'Marca 4' },
  { src: placeholderLogo('Marca 5'), alt: 'Marca 5' },
  { src: placeholderLogo('Marca 6'), alt: 'Marca 6' },
];

export const LogoCloud = ({
  title = 'Marcas que trabajamos',
  subtitle = 'Confían en nosotros las marcas más reconocidas del mercado',
  logos = DEFAULT_LOGOS,
  bgColor = '#ffffff',
  textColor = '#111827',
  columns = 6,
  grayscale = true,
  logoMaxHeight = 48,
}: LogoCloudProps) => {
  const { connectors, selected } = useNode((s) => ({
    selected: s.events.selected,
  }));

  const subtextColor = `${textColor}99`;

  const gridColsClass: Record<number, string> = {
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-3 md:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-6',
  };

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
        <div className='text-center mb-10'>
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

        <div
          className={`grid ${gridColsClass[columns] || gridColsClass[6]} gap-8 items-center justify-items-center`}
        >
          {logos.map((logo, i) => {
            const img = (
              <img
                src={logo.src}
                alt={logo.alt || ''}
                style={{
                  maxHeight: `${logoMaxHeight}px`,
                  filter: grayscale ? 'grayscale(100%)' : 'none',
                  opacity: grayscale ? 0.7 : 1,
                  transition: 'filter 0.3s, opacity 0.3s',
                }}
                className='w-auto object-contain hover:opacity-100'
                onMouseEnter={(e) => {
                  if (grayscale) {
                    (e.currentTarget as HTMLImageElement).style.filter =
                      'grayscale(0%)';
                    (e.currentTarget as HTMLImageElement).style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (grayscale) {
                    (e.currentTarget as HTMLImageElement).style.filter =
                      'grayscale(100%)';
                    (e.currentTarget as HTMLImageElement).style.opacity = '0.7';
                  }
                }}
              />
            );

            if (logo.url) {
              return (
                <a
                  key={i}
                  href={logo.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center justify-center min-h-[60px] min-w-[100px]'
                >
                  {img}
                </a>
              );
            }
            return (
              <div
                key={i}
                className='flex items-center justify-center min-h-[60px] min-w-[100px]'
              >
                {img}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

LogoCloud.craft = {
  displayName: 'LogoCloud',
  props: {
    title: 'Marcas que trabajamos',
    subtitle: 'Confían en nosotros las marcas más reconocidas del mercado',
    logos: DEFAULT_LOGOS,
    bgColor: '#ffffff',
    textColor: '#111827',
    columns: 6,
    grayscale: true,
    logoMaxHeight: 48,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
