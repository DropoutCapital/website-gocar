import React from 'react';
import { useNode } from '@craftjs/core';

interface LogoItem {
  src: string;
  alt: string;
}

interface LogoMarqueeProps {
  title?: string;
  logos?: LogoItem[];
  bgColor?: string;
  textColor?: string;
  speed?: 'slow' | 'normal' | 'fast';
  grayscale?: boolean;
  logoMaxHeight?: number;
  showFadeEdges?: boolean;
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
  { src: placeholderLogo('Marca 7'), alt: 'Marca 7' },
  { src: placeholderLogo('Marca 8'), alt: 'Marca 8' },
];

const speedToDuration: Record<string, string> = {
  slow: '60s',
  normal: '40s',
  fast: '20s',
};

export const LogoMarquee = ({
  title = 'Marcas que trabajamos',
  logos = DEFAULT_LOGOS,
  bgColor = '#ffffff',
  textColor = '#111827',
  speed = 'normal',
  grayscale = true,
  logoMaxHeight = 40,
  showFadeEdges = true,
}: LogoMarqueeProps) => {
  const { connectors, selected, id } = useNode((s) => ({
    selected: s.events.selected,
  }));

  const duration = speedToDuration[speed] || speedToDuration.normal;
  const doubled = [...logos, ...logos];

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
      className='w-full py-12 md:py-16'
    >
      <style>{`
        @keyframes logoMarqueeSlide_${id} {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .logo-marquee-track-${id} {
          animation: logoMarqueeSlide_${id} ${duration} linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-marquee-track-${id} {
            animation: none;
          }
        }
        .logo-marquee-mask-${id} {
          mask-image: linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%);
        }
      `}</style>

      {title && (
        <div className='text-center mb-8 px-4'>
          <h2
            className='text-2xl md:text-3xl font-bold'
            style={{ color: textColor }}
          >
            {title}
          </h2>
        </div>
      )}

      <div
        className={`overflow-hidden ${showFadeEdges ? `logo-marquee-mask-${id}` : ''}`}
      >
        <div
          className={`logo-marquee-track-${id} flex items-center w-max`}
          style={{ gap: '3rem', paddingRight: '3rem' }}
        >
          {doubled.map((logo, i) => (
            <div
              key={i}
              className='flex-shrink-0 flex items-center justify-center min-h-[60px] min-w-[120px]'
              aria-hidden={i >= logos.length}
            >
              <img
                src={logo.src}
                alt={i < logos.length ? logo.alt || '' : ''}
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
    </div>
  );
};

LogoMarquee.craft = {
  displayName: 'LogoMarquee',
  props: {
    title: 'Marcas que trabajamos',
    logos: DEFAULT_LOGOS,
    bgColor: '#ffffff',
    textColor: '#111827',
    speed: 'normal',
    grayscale: true,
    logoMaxHeight: 40,
    showFadeEdges: true,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
