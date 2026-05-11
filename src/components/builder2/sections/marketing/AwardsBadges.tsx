import React from 'react';
import { useNode } from '@craftjs/core';

interface AwardItem {
  icon: string;
  title: string;
  year: string;
  description?: string;
}

interface AwardsBadgesProps {
  sectionTitle?: string;
  subtitle?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  awards?: AwardItem[];
  columns?: string | number;
  cardStyle?: 'card' | 'minimal';
  iconPosition?: 'top' | 'left';
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  cardBgColor?: string;
}

const placeholderBadge = (label: string, color = '#9ca3af') => {
  const safeLabel = (label || '').replace(/[<>&'"]/g, '').slice(0, 8);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="44" r="28" fill="none" stroke="${color}" stroke-width="3"/><circle cx="48" cy="44" r="22" fill="${color}" fill-opacity="0.12"/><path d="M36 60 L30 86 L48 76 L66 86 L60 60" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/><text x="48" y="50" font-family="-apple-system,system-ui,sans-serif" font-size="13" font-weight="700" fill="${color}" text-anchor="middle">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const DEFAULT_AWARDS: AwardItem[] = [
  {
    icon: placeholderBadge('1°'),
    title: 'Mejor Automotora',
    year: '2024',
    description: 'Reconocimiento al servicio al cliente',
  },
  {
    icon: placeholderBadge('✓'),
    title: 'Concesionario Certificado',
    year: '2023',
    description: 'Estándares de calidad internacionales',
  },
  {
    icon: placeholderBadge('★'),
    title: 'Premio Excelencia',
    year: '2023',
    description: 'Otorgado por AutoChile',
  },
];

export const AwardsBadges = ({
  sectionTitle = 'Reconocimientos y certificaciones',
  subtitle = 'Nuestro trabajo respaldado por las principales instituciones del rubro',
  titleAlignment = 'center',
  awards,
  columns = 3,
  cardStyle = 'card',
  iconPosition = 'top',
  bgColor = '#ffffff',
  textColor = '#111827',
  accentColor = '#e05d31',
  cardBgColor = '#ffffff',
}: AwardsBadgesProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const finalAwards = awards && awards.length > 0 ? awards : DEFAULT_AWARDS;

  const numColumns = typeof columns === 'string' ? parseInt(columns, 10) : columns;
  const columnClass =
    {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 lg:grid-cols-4',
    }[numColumns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const isCard = cardStyle === 'card';
  const isLeft = iconPosition === 'left';
  const subtitleColor = `${textColor}99`;

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
      className='w-full py-16 md:py-20 px-4 sm:px-6 lg:px-8'
    >
      <div className='max-w-6xl mx-auto'>
        <div className='mb-12' style={{ textAlign: titleAlignment }}>
          <div
            className={`flex items-center gap-3 mb-4 ${
              titleAlignment === 'center'
                ? 'justify-center'
                : titleAlignment === 'right'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <div className='h-px w-8' style={{ backgroundColor: accentColor }} />
            <span
              className='text-xs font-semibold uppercase tracking-[0.25em]'
              style={{ color: accentColor }}
            >
              Reconocimientos
            </span>
            <div className='h-px w-8' style={{ backgroundColor: accentColor }} />
          </div>

          <h2
            className='text-3xl md:text-4xl font-bold mb-3'
            style={{ color: textColor }}
          >
            {sectionTitle}
          </h2>
          {subtitle && (
            <p
              className='text-base md:text-lg max-w-2xl'
              style={{
                color: subtitleColor,
                marginLeft: titleAlignment === 'center' ? 'auto' : 0,
                marginRight: titleAlignment === 'center' ? 'auto' : 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className={`grid gap-6 ${columnClass}`}>
          {finalAwards.map((award, index) => (
            <div
              key={index}
              className={`${
                isCard
                  ? 'p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5'
                  : 'p-2'
              } ${isLeft ? 'flex items-start gap-4' : 'flex flex-col items-center text-center'}`}
              style={
                isCard
                  ? {
                      backgroundColor: cardBgColor,
                      borderColor: `${textColor}14`,
                      boxShadow: `0 1px 3px ${textColor}0d`,
                    }
                  : undefined
              }
            >
              <div
                className={`flex-shrink-0 flex items-center justify-center ${
                  isLeft ? 'w-16 h-16' : 'w-20 h-20 mb-4'
                }`}
                style={{
                  backgroundColor: `${accentColor}14`,
                  borderRadius: '50%',
                }}
              >
                {award.icon ? (
                  <img
                    src={award.icon}
                    alt={award.title}
                    className={isLeft ? 'w-12 h-12 object-contain' : 'w-14 h-14 object-contain'}
                  />
                ) : (
                  <div
                    className='text-2xl font-bold'
                    style={{ color: accentColor }}
                  >
                    ★
                  </div>
                )}
              </div>

              <div className={isLeft ? 'flex-1 min-w-0' : 'w-full'}>
                <h3
                  className='text-base md:text-lg font-bold leading-tight'
                  style={{ color: textColor }}
                >
                  {award.title}
                </h3>
                <div
                  className='inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold'
                  style={{
                    backgroundColor: `${accentColor}1f`,
                    color: accentColor,
                  }}
                >
                  {award.year}
                </div>
                {award.description !== undefined && award.description !== '' && (
                  <p
                    className='mt-3 text-sm leading-relaxed'
                    style={{ color: subtitleColor }}
                  >
                    {award.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

AwardsBadges.craft = {
  displayName: 'AwardsBadges',
  props: {
    sectionTitle: 'Reconocimientos y certificaciones',
    subtitle:
      'Nuestro trabajo respaldado por las principales instituciones del rubro',
    titleAlignment: 'center',
    awards: DEFAULT_AWARDS,
    columns: 3,
    cardStyle: 'card',
    iconPosition: 'top',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
