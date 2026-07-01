import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { normalizeBuilderLink, isBlankHtml, navigateBuilderCta } from '@/utils/functions';

interface HeroWithVideoEmbedProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonTextSecondary?: string;
  buttonLinkSecondary?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonSecondaryBgColor?: string;
  buttonSecondaryTextColor?: string;
  videoUrl?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  textAlignment?: 'left' | 'center' | 'right';
  height?: string;
  maxWidth?: string;
  borderRadius?: string;
  children?: React.ReactNode;
}

const getBackgroundEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  let m = url.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
  if (m) {
    return `https://streamable.com/e/${m[1]}?autoplay=1&muted=1&loop=1&nocontrols=1`;
  }

  m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (m) {
    const id = m[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&playsinline=1`;
  }

  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) {
    return `https://player.vimeo.com/video/${m[1]}?autoplay=1&loop=1&muted=1&background=1`;
  }

  return null;
};

export const HeroWithVideoEmbed = ({
  title = 'Encuentra tu próximo auto',
  subtitle = 'Amplio inventario de autos seminuevos verificados y con garantía',
  buttonText = 'Ver vehículos',
  buttonLink = '#vehicles',
  buttonTextSecondary = 'Contactar',
  buttonLinkSecondary = '#contact',
  buttonBgColor = '#3b82f6',
  buttonTextColor = '#ffffff',
  buttonSecondaryBgColor = 'transparent',
  buttonSecondaryTextColor = '#ffffff',
  videoUrl = '',
  overlayColor = '#000000',
  overlayOpacity = 0.5,
  textColor = '#ffffff',
  textAlignment = 'center',
  height = '500px',
  maxWidth = '1280px',
  borderRadius = '16px',
  children,
}: HeroWithVideoEmbedProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  const embedUrl = getBackgroundEmbedUrl(videoUrl || '');

  const overlayStyle: React.CSSProperties = {
    backgroundColor: overlayColor,
    opacity: overlayOpacity,
  };

  // Respeta el link del builder: navega si es ruta/URL, scroll si es #ancla.
  const scrollToVehicles = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isEnabled) return;
    navigateBuilderCta(buttonLink);
  };

  return (
    <div className='w-full px-4 sm:px-6 flex justify-center'>
      <div
        ref={(el: HTMLDivElement | null) => {
          if (el) connectors.connect(el);
        }}
        style={{
          width: '100%',
          maxWidth,
          height,
          position: 'relative',
          overflow: 'hidden',
          borderRadius,
          color: textColor,
          backgroundColor: '#000',
          border: selected ? '1px dashed #1e88e5' : 'none',
        }}
        className='flex items-center'
      >
      {/* Video de fondo (cover) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {embedUrl && (
          <iframe
            src={embedUrl}
            allow='autoplay; fullscreen; picture-in-picture'
            allowFullScreen
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '177.78vh',
              height: '56.25vw',
              minWidth: '100%',
              minHeight: '100%',
              transform: 'translate(-50%, -50%)',
              border: 0,
            }}
            title='Hero video'
          />
        )}
      </div>

      {/* Overlay */}
      <div style={overlayStyle} className='absolute inset-0 z-[1]' />

      {/* Contenido */}
      <div className='w-full relative z-[2]'>
        <div
          className={`w-full text-${textAlignment}`}
          style={{ margin: textAlignment === 'center' ? '0 auto' : '0' }}
        >
          {!isBlankHtml(title) && (
            <h1
              style={{ color: textColor }}
              className='text-4xl md:text-5xl font-bold mb-4'
              dangerouslySetInnerHTML={{ __html: title || '' }}
            />
          )}
          {!isBlankHtml(subtitle) && (
            <p
              style={{ color: textColor }}
              className='text-lg md:text-xl mb-8'
              dangerouslySetInnerHTML={{ __html: subtitle || '' }}
            />
          )}
          {(!isBlankHtml(buttonText) || !isBlankHtml(buttonTextSecondary)) && (
            <div className='flex flex-wrap gap-4 justify-center'>
              {!isBlankHtml(buttonText) && (
                <Button
                  className='px-8 py-3 rounded-md transition-colors'
                  style={{
                    backgroundColor: buttonBgColor,
                    color: buttonTextColor,
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
                  className='px-8 py-3 rounded-md border-2 transition-colors'
                  style={{
                    backgroundColor: buttonSecondaryBgColor,
                    color: buttonSecondaryTextColor,
                    borderColor: buttonSecondaryTextColor,
                  }}
                >
                  <a
                    href={normalizeBuilderLink(buttonLinkSecondary)}
                    dangerouslySetInnerHTML={{ __html: buttonTextSecondary || '' }}
                  />
                </Button>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
      </div>
    </div>
  );
};

const HeroWithVideoEmbedSettingsStub = () => null;

HeroWithVideoEmbed.craft = {
  displayName: 'HeroWithVideoEmbed',
  props: {
    title: 'Encuentra tu próximo auto',
    subtitle:
      'Amplio inventario de autos seminuevos verificados y con garantía',
    buttonText: 'Ver vehículos',
    buttonLink: '#vehicles',
    buttonTextSecondary: 'Contactar',
    buttonLinkSecondary: '#contact',
    buttonBgColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    buttonSecondaryBgColor: 'transparent',
    buttonSecondaryTextColor: '#ffffff',
    videoUrl: '',
    overlayColor: '#000000',
    overlayOpacity: 0.5,
    textColor: '#ffffff',
    textAlignment: 'center',
    height: '500px',
    maxWidth: '1280px',
    borderRadius: '16px',
  },
  related: {
    settings: HeroWithVideoEmbedSettingsStub,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  isCanvas: true,
};
