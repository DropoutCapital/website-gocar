'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';

interface GalleryImage {
  imageUrl: string;
  caption: string;
}

interface GalleryPremiumProps {
  sectionTitle?: string;
  subtitle?: string;
  images?: GalleryImage[];
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

export const GalleryPremium = ({
  sectionTitle = 'Nuestra galer\u00eda',
  subtitle = 'Descubre nuestras instalaciones y veh\u00edculos destacados',
  images = [
    { imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=500&fit=crop', caption: 'Deportivo de lujo' },
    { imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop', caption: 'Elegancia en movimiento' },
    { imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop', caption: 'Potencia y dise\u00f1o' },
    { imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop', caption: 'Cl\u00e1sico moderno' },
    { imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=500&fit=crop', caption: 'Heritage edition' },
  ],
  bgColor = '#0a0a0a',
  textColor = '#ffffff',
  accentColor = '',
}: GalleryPremiumProps) => {
  const { connectors } = useNode();
  const accent = accentColor || '#3b82f6';

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{ backgroundColor: bgColor, color: textColor, position: 'relative' }}
      className="w-full"
    >
      <div className="px-6 py-24 lg:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0 }}
          className="text-center mb-14 max-w-4xl mx-auto"
        >
          <h2
            className="text-[2rem] sm:text-[2.75rem] font-bold mb-4"
            style={{ color: textColor, letterSpacing: '-0.03em' }}
            dangerouslySetInnerHTML={{ __html: sectionTitle }}
          />
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: hexToRgba(textColor, 0.5) }}
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        </motion.div>

        {/* Auto-scrolling gallery */}
        <Marquee gradient={false} speed={40} pauseOnHover autoFill>
          {images.map((img, i) => (
            <div
              key={i}
              className="mx-2.5 w-[80vw] sm:w-[55vw] lg:w-[38vw] aspect-[16/10] rounded-2xl overflow-hidden relative group cursor-pointer"
            >
              <img
                src={img.imageUrl}
                alt={img.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Vignette + caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                <p className="text-white text-sm font-medium p-5">{img.caption}</p>
              </div>
              {/* Subtle border */}
              <div className="absolute inset-0 rounded-2xl" style={{ border: `1px solid ${hexToRgba(textColor, 0.08)}` }} />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(255,255,255,${alpha})`;
  const num = parseInt(clean, 16);
  return `rgba(${(num >> 16) & 0xff},${(num >> 8) & 0xff},${num & 0xff},${alpha})`;
}

GalleryPremium.craft = {
  displayName: 'GalleryPremium',
  props: {
    sectionTitle: 'Nuestra galer\u00eda', subtitle: 'Descubre nuestras instalaciones y veh\u00edculos destacados',
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=500&fit=crop', caption: 'Deportivo de lujo' },
      { imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop', caption: 'Elegancia en movimiento' },
      { imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=500&fit=crop', caption: 'Potencia y dise\u00f1o' },
      { imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=500&fit=crop', caption: 'Cl\u00e1sico moderno' },
      { imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=500&fit=crop', caption: 'Heritage edition' },
    ],
    bgColor: '#0a0a0a', textColor: '#ffffff', accentColor: '',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
