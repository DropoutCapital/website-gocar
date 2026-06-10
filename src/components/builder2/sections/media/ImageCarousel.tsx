'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import Marquee from 'react-fast-marquee';

interface CarouselImage {
  imageUrl: string;
  caption?: string;
}

interface ImageCarouselProps {
  sectionTitle?: string;
  images?: CarouselImage[];
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean | string;
  imageHeight?: number;
  gap?: number;
  rounded?: boolean | string;
  showCaptions?: boolean | string;
  bgColor?: string;
  textColor?: string;
}

const DEFAULT_CAROUSEL_IMAGES: CarouselImage[] = [
  { imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&h=600&fit=crop', caption: 'Deportivo de lujo' },
  { imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&h=600&fit=crop', caption: 'Elegancia en movimiento' },
  { imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&h=600&fit=crop', caption: 'Potencia y diseño' },
  { imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&h=600&fit=crop', caption: 'Clásico moderno' },
  { imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=900&h=600&fit=crop', caption: 'Heritage edition' },
];

const toBool = (v: any): boolean => v === true || v === 'true';
const toNum = (v: any, fallback: number): number => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

export const ImageCarousel = ({
  sectionTitle = 'Galería',
  images = DEFAULT_CAROUSEL_IMAGES,
  speed = 50,
  direction = 'left',
  pauseOnHover = true,
  imageHeight = 320,
  gap = 16,
  rounded = true,
  showCaptions = false,
  bgColor = '#0a0a0a',
  textColor = '#ffffff',
}: ImageCarouselProps) => {
  const { connectors } = useNode();

  const h = toNum(imageHeight, 320);
  const g = toNum(gap, 16);
  const radius = toBool(rounded) ? 16 : 0;
  const validImages = (images || []).filter((img) => img && img.imageUrl);

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      className="relative w-full py-14 overflow-hidden"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {sectionTitle && (
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: textColor }}
            dangerouslySetInnerHTML={{ __html: sectionTitle }}
          />
        </div>
      )}

      {validImages.length > 0 && (
        <Marquee
          gradient={false}
          speed={toNum(speed, 50)}
          direction={direction === 'right' ? 'right' : 'left'}
          pauseOnHover={toBool(pauseOnHover)}
          autoFill
        >
          {validImages.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden group"
              style={{
                height: `${h}px`,
                marginLeft: `${g / 2}px`,
                marginRight: `${g / 2}px`,
                borderRadius: `${radius}px`,
                display: 'inline-block',
              }}
            >
              <img
                src={img.imageUrl}
                alt={img.caption || `Imagen ${i + 1}`}
                style={{ height: '100%', width: 'auto', display: 'block', objectFit: 'cover' }}
                className="transition-transform duration-500 group-hover:scale-105"
              />
              {toBool(showCaptions) && img.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white text-sm font-medium p-4">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </Marquee>
      )}
    </div>
  );
};

ImageCarousel.craft = {
  displayName: 'ImageCarousel',
  props: {
    sectionTitle: 'Galería',
    images: DEFAULT_CAROUSEL_IMAGES,
    speed: 50,
    direction: 'left',
    pauseOnHover: true,
    imageHeight: 320,
    gap: 16,
    rounded: true,
    showCaptions: false,
    bgColor: '#0a0a0a',
    textColor: '#ffffff',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};

export default ImageCarousel;
