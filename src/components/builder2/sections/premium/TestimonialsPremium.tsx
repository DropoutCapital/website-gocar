'use client';

import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isBlankHtml } from '@/utils/functions';

interface TestimonialItem {
  quote: string;
  authorName: string;
  authorRole: string;
}

interface TestimonialsPremiumProps {
  eyebrowText?: string;
  testimonials?: TestimonialItem[];
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

export const TestimonialsPremium = ({
  eyebrowText = 'Testimonios',
  testimonials = [
    { quote: 'Una experiencia de compra excepcional. Desde la primera consulta hasta la entrega, cada detalle fue impecable.', authorName: 'Carolina V\u00e1squez', authorRole: 'Empresaria' },
    { quote: 'El nivel de profesionalismo y la calidad de los veh\u00edculos superaron mis expectativas. Sin duda volver\u00e9.', authorName: 'Andr\u00e9s Montero', authorRole: 'Ingeniero' },
    { quote: 'Financiamiento transparente y un servicio post-venta que realmente se preocupa. Los recomiendo completamente.', authorName: 'Isabel Fuentes', authorRole: 'Arquitecta' },
  ],
  bgColor = '#0f0f0f',
  textColor = '#ffffff',
  accentColor = '',
}: TestimonialsPremiumProps) => {
  const { connectors } = useNode();
  const accent = accentColor || '#3b82f6';
  const [active, setActive] = useState(0);

  const goNext = () => setActive((i) => (i + 1) % testimonials.length);
  const goPrev = () => setActive((i) => (i - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[active];

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{ backgroundColor: bgColor, color: textColor, position: 'relative' }}
      className="w-full"
    >
      <div className="max-w-4xl mx-auto px-6 py-24 lg:py-32 text-center">
        {/* Eyebrow */}
        {!isBlankHtml(eyebrowText) && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0 }}
            className="text-xs font-medium uppercase tracking-[0.3em] mb-16"
            style={{ color: accent }}
            dangerouslySetInnerHTML={{ __html: eyebrowText }}
          />
        )}

        {/* Giant quote mark */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10rem] leading-none font-serif pointer-events-none select-none"
            style={{ color: hexToRgba(accent, 0.08) }}
          >
            &ldquo;
          </motion.div>

          {/* Quote */}
          <div className="relative z-10 min-h-[180px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {t && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {!isBlankHtml(t.quote) && (
                    <p
                      className="text-xl sm:text-2xl lg:text-3xl font-light italic leading-relaxed max-w-3xl mx-auto"
                      style={{ color: hexToRgba(textColor, 0.85) }}
                      dangerouslySetInnerHTML={{ __html: t.quote }}
                    />
                  )}
                  <div className="mt-10 space-y-1">
                    {!isBlankHtml(t.authorName) && (
                      <p
                        className="text-base font-semibold"
                        style={{ color: textColor }}
                        dangerouslySetInnerHTML={{ __html: t.authorName }}
                      />
                    )}
                    {!isBlankHtml(t.authorRole) && (
                      <p
                        className="text-sm"
                        style={{ color: hexToRgba(textColor, 0.4) }}
                        dangerouslySetInnerHTML={{ __html: t.authorRole }}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center gap-6 mt-12"
          >
            <button onClick={goPrev} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ border: `1px solid ${hexToRgba(textColor, 0.15)}` }}>
              <ChevronLeft size={18} style={{ color: hexToRgba(textColor, 0.5) }} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i === active ? accent : hexToRgba(textColor, 0.2), transform: i === active ? 'scale(1.3)' : 'scale(1)' }}
                />
              ))}
            </div>
            <button onClick={goNext} className="w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ border: `1px solid ${hexToRgba(textColor, 0.15)}` }}>
              <ChevronRight size={18} style={{ color: hexToRgba(textColor, 0.5) }} />
            </button>
          </motion.div>
        )}
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

TestimonialsPremium.craft = {
  displayName: 'TestimonialsPremium',
  props: {
    eyebrowText: 'Testimonios',
    testimonials: [
      { quote: 'Una experiencia de compra excepcional. Desde la primera consulta hasta la entrega, cada detalle fue impecable.', authorName: 'Carolina V\u00e1squez', authorRole: 'Empresaria' },
      { quote: 'El nivel de profesionalismo y la calidad de los veh\u00edculos superaron mis expectativas. Sin duda volver\u00e9.', authorName: 'Andr\u00e9s Montero', authorRole: 'Ingeniero' },
      { quote: 'Financiamiento transparente y un servicio post-venta que realmente se preocupa. Los recomiendo completamente.', authorName: 'Isabel Fuentes', authorRole: 'Arquitecta' },
    ],
    bgColor: '#0f0f0f', textColor: '#ffffff', accentColor: '',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
