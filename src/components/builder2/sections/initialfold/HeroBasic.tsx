import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { normalizeBuilderLink, isBlankHtml, navigateBuilderCta } from '@/utils/functions';

interface HeroBasicProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonTextSecondary?: string;
  buttonLinkSecondary?: string;
  bgColor?: string;
  textColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonSecondaryBgColor?: string;
  buttonSecondaryTextColor?: string;
  alignment?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

// Remove the internal settings component as we now have an external one
export const HeroBasic = ({
  title = 'Encuentra el auto ideal para ti',
  subtitle = 'Amplio catálogo de vehículos seminuevos certificados con garantía y financiamiento a tu medida',
  buttonText = 'Ver vehículos',
  buttonLink = '/vehicles',
  buttonTextSecondary = 'Contactar',
  buttonLinkSecondary = '/contact',
  bgColor = '#ffffff',
  textColor = '#333333',
  buttonBgColor = '#3b82f6',
  buttonTextColor = '#ffffff',
  buttonSecondaryBgColor = 'transparent',
  buttonSecondaryTextColor,
  alignment = 'center',
  children,
}: HeroBasicProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const finalButtonSecondaryTextColor =
    buttonSecondaryTextColor || buttonBgColor || '#3b82f6';

  // Detectar si estamos en modo editor
  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  const textAlignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[alignment];

  const justifyClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[alignment];

  // Respeta el link del builder: navega si es ruta/URL, scroll si es #ancla.
  const scrollToVehicles = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isEnabled) return;
    navigateBuilderCta(buttonLink);
  };

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{
        background: bgColor,
        color: textColor,
        position: 'relative',
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
      }}
      className='w-full overflow-hidden'
    >
      {/* Decorative gradient orbs */}
      <div
        className='absolute inset-0 pointer-events-none'
        aria-hidden='true'
      >
        {/* Top-right orb */}
        <div
          className='absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl'
          style={{
            background: `radial-gradient(circle, ${buttonBgColor}15 0%, transparent 70%)`,
          }}
        />
        {/* Bottom-left orb */}
        <div
          className='absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full blur-3xl'
          style={{
            background: `radial-gradient(circle, ${buttonBgColor}10 0%, transparent 70%)`,
          }}
        />
        {/* Center subtle mesh */}
        <div
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-50'
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${buttonBgColor}08 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, ${buttonBgColor}06 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Bottom gradient fade border */}
      <div
        className='absolute bottom-0 left-0 right-0 h-px pointer-events-none'
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${buttonBgColor}30 50%, transparent 100%)`,
        }}
      />

      {/* Content */}
      <div className={`relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-28 flex flex-col ${textAlignClass}`}>
        {/* Badge */}
        <div
          className='inline-flex mb-6 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase'
          style={{
            backgroundColor: `${buttonBgColor}12`,
            color: buttonBgColor,
            border: `1px solid ${buttonBgColor}20`,
          }}
        >
          Tu próximo auto te espera
        </div>

        {/* Title */}
        {!isBlankHtml(title) && (
          <h1
            style={{ color: textColor }}
            className='text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6'
            dangerouslySetInnerHTML={{ __html: title || '' }}
          />
        )}

        {/* Subtitle */}
        {!isBlankHtml(subtitle) && (
          <p
            style={{ color: textColor, opacity: 0.7 }}
            className='text-lg md:text-xl leading-relaxed max-w-2xl mb-10'
            dangerouslySetInnerHTML={{ __html: subtitle || '' }}
          />
        )}

        {/* Buttons */}
        {(!isBlankHtml(buttonText) || !isBlankHtml(buttonTextSecondary)) && (
          <div className={`flex flex-wrap gap-4 ${justifyClass}`}>
            {!isBlankHtml(buttonText) && (
              <Button
                className='px-8 py-4 text-base rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg hover:shadow-xl'
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                  boxShadow: `0 4px 14px 0 ${buttonBgColor}40`,
                }}
                onClick={scrollToVehicles}
              >
                <span dangerouslySetInnerHTML={{ __html: buttonText || '' }} />
              </Button>
            )}
            {!isBlankHtml(buttonTextSecondary) && (
              <Button
                asChild
                variant='outline'
                className='px-8 py-4 text-base rounded-full border-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]'
                style={{
                  backgroundColor: buttonSecondaryBgColor,
                  color: finalButtonSecondaryTextColor,
                  borderColor: `${finalButtonSecondaryTextColor}40`,
                }}
              >
                <a href={isEnabled ? '#' : normalizeBuilderLink(buttonLinkSecondary)}
                  dangerouslySetInnerHTML={{ __html: buttonTextSecondary || '' }} />
              </Button>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

HeroBasic.craft = {
  displayName: 'HeroBasic',
  props: {
    title: 'Encuentra el auto ideal para ti',
    subtitle: 'Amplio catálogo de vehículos seminuevos certificados con garantía y financiamiento a tu medida',
    buttonText: 'Ver vehículos',
    buttonLink: '#vehicles',
    buttonTextSecondary: 'Contactar',
    buttonLinkSecondary: '#contact',
    bgColor: '#ffffff',
    textColor: '#333333',
    buttonBgColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    buttonSecondaryBgColor: 'transparent',
    buttonSecondaryTextColor: '#3b82f6',
    alignment: 'center',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  isCanvas: true,
};
