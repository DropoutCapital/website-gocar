import React from 'react';
import { useNode } from '@craftjs/core';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { normalizeBuilderLink, isBlankHtml } from '@/utils/functions';

const appleEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

interface CTAModernoProps { title?: string; subtitle?: string; buttonText?: string; buttonLink?: string; accentColor?: string; }

export const CTAModerno = ({
  title = '¿Listo para encontrar tu auto ideal?',
  subtitle = 'Contáctanos hoy y descubre las mejores opciones de financiamiento disponibles para ti.',
  buttonText = 'Comenzar ahora', buttonLink = '#contact', accentColor = '#3b82f6',
}: CTAModernoProps) => {
  const { connectors } = useNode();
  const lighterAccent = lighten(accentColor, 25);

  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }} style={{ position: 'relative', overflow: 'hidden' }} className="w-full">
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(135deg, ${accentColor} 0%, ${lighterAccent} 100%)` }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] bg-white/15" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[100px] bg-white/10" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        {!isBlankHtml(title) && (
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: appleEase }}
            className="text-[2rem] sm:text-[2.75rem] font-semibold text-white tracking-tight leading-tight mb-5"
            dangerouslySetInnerHTML={{ __html: title || '' }} />
        )}
        {!isBlankHtml(subtitle) && (
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: appleEase }}
            className="text-lg sm:text-xl text-white/70 max-w-lg mx-auto mb-10"
            dangerouslySetInnerHTML={{ __html: subtitle || '' }} />
        )}
        {!isBlankHtml(buttonText) && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: appleEase }}>
            <a href={normalizeBuilderLink(buttonLink)}
              className="group inline-flex items-center justify-center h-14 px-8 text-[17px] font-medium rounded-full bg-white transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: accentColor }}>
              <span dangerouslySetInnerHTML={{ __html: buttonText || '' }} />
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

function lighten(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  let r = Math.min(255, ((num >> 16) & 0xff) + amount);
  let g = Math.min(255, ((num >> 8) & 0xff) + amount);
  let b = Math.min(255, (num & 0xff) + amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

CTAModerno.craft = {
  displayName: 'CTAModerno',
  props: {
    title: '¿Listo para encontrar tu auto ideal?',
    subtitle: 'Contáctanos hoy y descubre las mejores opciones de financiamiento disponibles para ti.',
    buttonText: 'Comenzar ahora', buttonLink: '#contact', accentColor: '#3b82f6',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
