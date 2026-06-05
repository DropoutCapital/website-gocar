import React from 'react';
import { useNode } from '@craftjs/core';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { normalizeBuilderLink, isBlankHtml } from '@/utils/functions';

const appleEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

interface TrustItem {
  text: string;
}

interface HeroModernoProps {
  title?: string;
  highlightText?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonText2?: string;
  buttonLink2?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  trustItems?: TrustItem[];
}

export const HeroModerno = ({
  title = 'Encuentra tu próximo vehículo en',
  highlightText = 'GoAutos',
  subtitle = 'La mejor selección de vehículos con financiamiento a tu medida y atención personalizada.',
  buttonText = 'Ver vehículos',
  buttonLink = '#vehicles',
  buttonText2 = 'Contáctanos',
  buttonLink2 = '#contact',
  bgColor = '#fbfbfd',
  textColor = '#0f172a',
  accentColor = '#3b82f6',
  trustItems = [
    { text: '500+ autos vendidos' },
    { text: '4.9★ en Google' },
    { text: 'Financiamiento 100%' },
    { text: 'Garantía incluida' },
  ],
}: HeroModernoProps) => {
  const { connectors } = useNode();
  const lighterAccent = lighten(accentColor, 60);

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{ backgroundColor: bgColor, color: textColor, position: 'relative' }}
      className="w-full min-h-[100vh] flex items-center"
    >
      {/* Full background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 70% 20%, ${hexToRgba(accentColor, 0.08)} 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, ${hexToRgba(accentColor, 0.05)} 0%, transparent 60%)` }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.12)} 0%, transparent 70%)` }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] rounded-full blur-[100px]"
          style={{ background: `radial-gradient(circle, ${hexToRgba(accentColor, 0.08)} 0%, transparent 70%)` }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-12">
        <div className="flex flex-col items-center text-center space-y-7">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="flex items-center gap-2.5 text-sm font-medium" style={{ color: hexToRgba(textColor, 0.5) }}>
            <span className="w-8 h-px" style={{ backgroundColor: hexToRgba(textColor, 0.2) }} />
            Tu automotora de confianza
            <span className="w-8 h-px" style={{ backgroundColor: hexToRgba(textColor, 0.2) }} />
          </motion.div>

          {(!isBlankHtml(title) || !isBlankHtml(highlightText)) && (
            <div className="space-y-2">
              {!isBlankHtml(title) && (
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] xl:text-[4.25rem] font-semibold tracking-[-0.035em] leading-[1.05]"
                  style={{ color: textColor }}
                  dangerouslySetInnerHTML={{ __html: title || '' }} />
              )}
              {!isBlankHtml(highlightText) && (
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] xl:text-[4.25rem] font-semibold tracking-[-0.035em] leading-[1.05]">
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, ${lighterAccent})` }}
                    dangerouslySetInnerHTML={{ __html: highlightText || '' }} />
                </motion.h1>
              )}
            </div>
          )}

          {!isBlankHtml(subtitle) && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: appleEase }}
              className="text-lg sm:text-xl font-normal leading-relaxed max-w-lg mx-auto"
              style={{ color: hexToRgba(textColor, 0.5) }}
              dangerouslySetInnerHTML={{ __html: subtitle || '' }} />
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: appleEase }}
            className="flex flex-wrap justify-center gap-x-7 gap-y-3">
            {trustItems.filter((item) => !isBlankHtml(item.text)).map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.08 }}
                className="flex items-center gap-2 text-[15px]" style={{ color: hexToRgba(textColor, 0.6) }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                <span dangerouslySetInnerHTML={{ __html: item.text || '' }} />
              </motion.div>
            ))}
          </motion.div>

          {(!isBlankHtml(buttonText) || !isBlankHtml(buttonText2)) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: appleEase }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              {!isBlankHtml(buttonText) && (
                <a href={normalizeBuilderLink(buttonLink)}
                  className="group relative inline-flex items-center justify-center h-14 px-8 text-[17px] font-medium text-white rounded-full transition-all hover:shadow-xl"
                  style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, ${lighten(accentColor, 20)})`, boxShadow: `0 8px 24px ${hexToRgba(accentColor, 0.25)}` }}>
                  <span dangerouslySetInnerHTML={{ __html: buttonText || '' }} />
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </a>
              )}
              {!isBlankHtml(buttonText2) && (
                <a href={normalizeBuilderLink(buttonLink2)}
                  className="inline-flex items-center justify-center h-14 px-8 text-[17px] font-medium rounded-full transition-all hover:bg-slate-100"
                  style={{ color: hexToRgba(textColor, 0.7) }}
                  dangerouslySetInnerHTML={{ __html: buttonText2 || '' }} />
              )}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.75 }}
            className="flex items-center justify-center gap-5 pt-1 text-[13px]" style={{ color: hexToRgba(textColor, 0.35) }}>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Garantía incluida</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Financiamiento flexible</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Envío a domicilio</span>
          </motion.div>
        </div>
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

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(0,0,0,${alpha})`;
  const num = parseInt(clean, 16);
  return `rgba(${(num >> 16) & 0xff},${(num >> 8) & 0xff},${num & 0xff},${alpha})`;
}

HeroModerno.craft = {
  displayName: 'HeroModerno',
  props: {
    title: 'Encuentra tu próximo vehículo en', highlightText: 'GoAutos',
    subtitle: 'La mejor selección de vehículos con financiamiento a tu medida y atención personalizada.',
    buttonText: 'Ver vehículos', buttonLink: '#vehicles', buttonText2: 'Contáctanos', buttonLink2: '#contact',
    bgColor: '#fbfbfd', textColor: '#0f172a', accentColor: '#3b82f6',
    trustItems: [{ text: '500+ autos vendidos' }, { text: '4.9★ en Google' }, { text: 'Financiamiento 100%' }, { text: 'Garantía incluida' }],
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
