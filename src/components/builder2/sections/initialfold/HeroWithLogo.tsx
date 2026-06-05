import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isBlankHtml } from '@/utils/functions';
// DeleteButton component not available

interface HeroWithLogoProps {
  backgroundImage?: string;
  backgroundImage2?: string;
  backgroundImage3?: string;
  backgroundImage4?: string;
  logoUrl?: string;
  logoText?: string;
  logoScale?: number;
  buttonText?: string;
  buttonLink?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: number;
  buttonBorderRadius?: number;
  buttonIsCircular?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  height?: string;
  children?: React.ReactNode;
}

export const HeroWithLogo = ({
  backgroundImage = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470',
  backgroundImage2 = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1470',
  backgroundImage3 = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1470',
  backgroundImage4 = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1470',
  logoUrl = '',
  logoText = 'Automotora',
  logoScale = 1,
  buttonText = 'Ver Stock Completo',
  buttonLink = '/vehicles',
  buttonBgColor = '#e05d31',
  buttonTextColor = '#ffffff',
  buttonBorderColor = '#000000',
  buttonBorderWidth = 0,
  buttonBorderRadius = 8,
  buttonIsCircular = 'false',
  overlayColor = '#000000',
  overlayOpacity = 0.3,
  height = '600px',
  children,
}: HeroWithLogoProps) => {
  const { connectors, selected, id } = useNode((state) => ({
    selected: state.events.selected,
    id: state.id,
  }));

  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  const router = useRouter();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const images = [
    backgroundImage,
    backgroundImage2,
    backgroundImage3,
    backgroundImage4,
  ].filter(Boolean);

  useEffect(() => {
    if (images.length <= 1) return;

    let startTime: number | undefined;
    let animationFrameId: number | undefined;

    const animateZoom = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / 4500, 1);
      const currentZoom = 1 + progress * 0.15;
      setZoomLevel(currentZoom);
      if (progress < 1) animationFrameId = requestAnimationFrame(animateZoom);
    };

    const startAnimation = () => {
      setZoomLevel(1);
      startTime = undefined;
      animationFrameId = requestAnimationFrame(animateZoom);
    };

    startAnimation();

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setTimeout(() => {
          setIsTransitioning(false);
          startAnimation();
        }, 100);
      }, 300);
    }, 4500);

    return () => {
      clearInterval(interval);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [images.length]);

  const overlayStyle = {
    backgroundColor: overlayColor,
    opacity: overlayOpacity,
  };

  const navigateToVehicles = () => {
    if (isEnabled) return;
    const targetUrl = buttonLink || '/vehicles';
    if (targetUrl.startsWith('#')) {
      const elementId = targetUrl.substring(1);
      const element = document.getElementById(elementId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <div
      ref={(ref) => connectors.connect(ref as any)}
      style={{
        height,
        position: 'relative',
        overflow: 'hidden',
        border: selected ? '2px dashed #1e88e5' : 'none',
      }}
      className="w-full flex items-center justify-center"
    >
      {/* Background */}
      <div
        style={{
          backgroundImage: `url(${images[currentImageIndex] || backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.1s ease-out, opacity 0.5s ease-in-out',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: isTransitioning ? 0.3 : 1,
        }}
      />

      {/* Overlay */}
      <div style={overlayStyle} className="absolute inset-0 z-0" />

      {/* Content */}
      <div className="w-full z-10 relative flex flex-col items-center justify-center h-full">
        <div className="text-center">
          {/* Logo */}
          {(logoUrl || !isBlankHtml(logoText)) && (
            <div className="mb-8">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoText}
                  className="
                    mx-auto
                    w-auto
                    object-contain
                    max-w-[80%]        /* evita que llene todo el ancho en móviles */
                    sm:max-w-[60%]     /* un poco más acotado en tablets */
                    md:max-w-none      /* sin límite de ancho desde md en adelante */
                  "
                  style={{
                    /* Altura responsiva: mínimo 56px en mobile, escala por viewport y tope en desktop */
                    maxHeight: 'clamp(56px, 18vw, 128px)',
                    transform: `scale(${logoScale})`,
                    transition: 'transform 0.3s ease-in-out',
                  }}
                />
              ) : (
                <h1
                  className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-2"
                  style={{
                    transform: `scale(${logoScale})`,
                    transition: 'transform 0.3s ease-in-out',
                  }}
                  dangerouslySetInnerHTML={{ __html: logoText || '' }}
                />
              )}
            </div>
          )}

          {/* Botón */}
          {!isBlankHtml(buttonText) && (
            <div className="flex justify-center">
              <Button
                className={`px-8 py-3 transition-colors text-lg font-medium ${
                  buttonIsCircular === 'true' ? 'rounded-full' : ''
                }`}
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                  borderColor: buttonBorderColor,
                  borderWidth: `${buttonBorderWidth}px`,
                  borderStyle: buttonBorderWidth > 0 ? 'solid' : 'none',
                  borderRadius:
                    buttonIsCircular === 'true'
                      ? '50%'
                      : `${buttonBorderRadius}px`,
                }}
                onClick={navigateToVehicles}
              >
                <span dangerouslySetInnerHTML={{ __html: buttonText || '' }} />
              </Button>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

const HeroWithLogoSettings = () => {
  const {
    actions: { setProp },
    backgroundImage,
    backgroundImage2,
    backgroundImage3,
    backgroundImage4,
    logoUrl,
    logoText,
    logoScale,
    buttonText,
    buttonLink,
    buttonBgColor,
    buttonTextColor,
    buttonBorderColor,
    buttonBorderWidth,
    buttonBorderRadius,
    buttonIsCircular,
    overlayColor,
    overlayOpacity,
    height,
  } = useNode((node) => ({
    backgroundImage: node.data.props.backgroundImage,
    backgroundImage2: node.data.props.backgroundImage2,
    backgroundImage3: node.data.props.backgroundImage3,
    backgroundImage4: node.data.props.backgroundImage4,
    logoUrl: node.data.props.logoUrl,
    logoText: node.data.props.logoText,
    logoScale: node.data.props.logoScale,
    buttonText: node.data.props.buttonText,
    buttonLink: node.data.props.buttonLink,
    buttonBgColor: node.data.props.buttonBgColor,
    buttonTextColor: node.data.props.buttonTextColor,
    buttonBorderColor: node.data.props.buttonBorderColor,
    buttonBorderWidth: node.data.props.buttonBorderWidth,
    buttonBorderRadius: node.data.props.buttonBorderRadius,
    buttonIsCircular: node.data.props.buttonIsCircular,
    overlayColor: node.data.props.overlayColor,
    overlayOpacity: node.data.props.overlayOpacity,
    height: node.data.props.height,
  }));

  const handleFileSelect = (propertyName: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setProp((props: any) => {
            props[propertyName] = result;
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      {/* ... (settings sin cambios) ... */}
      <div>
        <label className="text-sm font-medium mb-1 block">Imagen de fondo 1</label>
        <div className="flex gap-2">
          <input
            type="url"
            className="flex-1 p-2 border rounded text-sm"
            placeholder="URL de la imagen de fondo"
            value={backgroundImage || ''}
            onChange={(e) => {
              setProp((props: any) => {
                props.backgroundImage = e.target.value;
              });
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFileSelect('backgroundImage')}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Seleccionar archivo
          </Button>
        </div>
      </div>

      {/* Resto del panel igual que lo tenías */}
      {/* ... */}
      <div>
        <label className="text-sm font-medium mb-1 block">Altura (px)</label>
        <input
          type="number"
          className="w-full p-2 border rounded text-sm"
          value={parseInt(height?.replace('px', '') || '600')}
          onChange={(e) => {
            setProp((props: any) => {
              props.height = `${e.target.value}px`;
            });
          }}
        />
      </div>
    </div>
  );
};

HeroWithLogo.craft = {
  displayName: 'HeroWithLogo',
  props: {
    backgroundImage:
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470',
    backgroundImage2:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1470',
    backgroundImage3:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1470',
    backgroundImage4:
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1470',
    logoUrl: '',
    logoText: 'Automotora',
    logoScale: 1,
    buttonText: 'Ver Stock Completo',
    buttonLink: '/vehicles',
    buttonBgColor: '#e05d31',
    buttonTextColor: '#ffffff',
    buttonBorderColor: '#000000',
    buttonBorderWidth: 0,
    buttonBorderRadius: 8,
    buttonIsCircular: 'false',
    overlayColor: '#000000',
    overlayOpacity: 0.3,
    height: '600px',
  },
  related: {
    settings: HeroWithLogoSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};

export { HeroWithLogoSettings };
