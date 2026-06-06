import React from 'react';
import { useNode } from '@craftjs/core';
import { Star, User } from 'lucide-react';
import { isBlankHtml } from '@/utils/functions';

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(128,128,128,${alpha})`;
  const num = parseInt(clean, 16);
  return `rgba(${(num >> 16) & 0xff},${(num >> 8) & 0xff},${num & 0xff},${alpha})`;
}

interface TestimonialCardProps {
  name: string;
  role: string;
  testimonial: string;
  rating: string | number;
  photo?: string;
  cardBgColor: string;
  nameColor: string;
  roleColor: string;
  testimonialColor: string;
  starColor: string;
  bgColor: string;
}

const TestimonialCard = ({
  name, role, testimonial, rating, photo,
  cardBgColor, nameColor, roleColor, testimonialColor, starColor, bgColor,
}: TestimonialCardProps) => {
  const numRating = typeof rating === 'string' ? parseInt(rating, 10) : rating;

  return (
    <div
      className='group relative p-8 rounded-2xl transition-all duration-500 flex flex-col h-full overflow-hidden hover:-translate-y-1'
      style={{
        backgroundColor: cardBgColor,
        border: `1px solid ${hexToRgba(nameColor, 0.08)}`,
        boxShadow: `0 1px 3px ${hexToRgba(nameColor, 0.04)}`,
      }}
    >
      {/* Hover glow */}
      <div
        className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl'
        style={{ boxShadow: `0 8px 40px ${hexToRgba(starColor, 0.1)}, 0 0 0 1px ${hexToRgba(nameColor, 0.12)}` }}
      />

      {/* Accent line top */}
      <div
        className='absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-2xl'
        style={{ background: `linear-gradient(90deg, ${starColor}, transparent)` }}
      />

      {/* Stars */}
      <div className='flex mb-6 items-center gap-1'>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < numRating ? starColor : 'none'}
            stroke={i < numRating ? starColor : hexToRgba(nameColor, 0.2)}
            strokeWidth={i < numRating ? 0 : 1.5}
          />
        ))}
      </div>

      {/* Testimonial text */}
      {!isBlankHtml(testimonial) && (
        <p className='mb-8 text-[15px] leading-[1.8] flex-1 relative' style={{ color: testimonialColor }}>
          <span className='text-4xl font-serif leading-none mr-1.5 -ml-1 align-top' style={{ color: hexToRgba(starColor, 0.3) }}>&ldquo;</span>
          <span dangerouslySetInnerHTML={{ __html: testimonial || '' }} />
          <span className='text-4xl font-serif leading-none ml-1' style={{ color: hexToRgba(starColor, 0.3) }}>&rdquo;</span>
        </p>
      )}

      {/* Author */}
      <div className='flex items-center gap-3.5 pt-6' style={{ borderTop: `1px solid ${hexToRgba(nameColor, 0.06)}` }}>
        <div
          className='w-11 h-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center'
          style={{
            backgroundColor: hexToRgba(starColor, 0.1),
            border: `2px solid ${hexToRgba(starColor, 0.2)}`,
          }}
        >
          {photo ? (
            <img src={photo} alt={name} className='w-full h-full object-cover' />
          ) : (
            <User size={20} style={{ color: starColor }} />
          )}
        </div>
        <div>
          {!isBlankHtml(name) && (
            <h4 className='font-semibold text-sm' style={{ color: nameColor }}
              dangerouslySetInnerHTML={{ __html: name || '' }} />
          )}
          {!isBlankHtml(role) && (
            <p className='text-xs mt-0.5' style={{ color: roleColor }}
              dangerouslySetInnerHTML={{ __html: role || '' }} />
          )}
        </div>
      </div>
    </div>
  );
};

interface TestimonialsProps {
  sectionTitle?: string;
  subtitle?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  testimonials?: {
    name: string;
    role: string;
    testimonial: string;
    rating: string | number;
    photo?: string;
  }[];
  columns?: string | number;
  bgColor?: string;
  titleColor?: string;
  cardBgColor?: string;
  nameColor?: string;
  roleColor?: string;
  testimonialColor?: string;
  starColor?: string;
}

export const Testimonials = ({
  sectionTitle = 'Lo que dicen nuestros clientes',
  subtitle = '',
  titleAlignment = 'center',
  testimonials = [
    { name: 'Carlos Rodríguez', role: 'Comprador de Toyota Corolla', testimonial: 'Excelente servicio de principio a fin. El proceso de compra fue rápido y transparente. Estoy muy contento con mi nuevo auto.', rating: 5 },
    { name: 'María González', role: 'Compradora de Honda CR-V', testimonial: 'El asesor fue muy paciente y resolvió todas mis dudas. Me ayudaron a conseguir el financiamiento perfecto para mis necesidades.', rating: 4 },
    { name: 'Juan Pérez', role: 'Comprador de Nissan Sentra', testimonial: 'La garantía y el servicio post-venta son excelentes. Me han atendido siempre que lo he necesitado sin problemas.', rating: 5 },
  ],
  columns = 3,
  bgColor = '#ffffff',
  titleColor = '#111827',
  cardBgColor = '#ffffff',
  nameColor = '#111827',
  roleColor = '#6b7280',
  testimonialColor = '#374151',
  starColor,
}: TestimonialsProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const finalStarColor = starColor || '#f59e0b';
  const numColumns = typeof columns === 'string' ? parseInt(columns, 10) : columns;
  const columnClass = { 1: 'grid-cols-1', 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }[numColumns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{ background: bgColor, padding: '80px 20px', position: 'relative' }}
      className='w-full'
    >
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-16'>
          <div className='flex items-center justify-center gap-3 mb-5'>
            <div className='h-px w-8' style={{ backgroundColor: finalStarColor }} />
            <p className='text-xs font-semibold uppercase tracking-[0.25em]' style={{ color: finalStarColor }}>
              Testimonios
            </p>
            <div className='h-px w-8' style={{ backgroundColor: finalStarColor }} />
          </div>
          {!isBlankHtml(sectionTitle) && (
            <h2
              className='text-3xl md:text-4xl lg:text-5xl font-bold leading-tight'
              style={{ color: titleColor, textAlign: titleAlignment, letterSpacing: '-0.02em' }}
              dangerouslySetInnerHTML={{ __html: sectionTitle || '' }}
            />
          )}
          {!isBlankHtml(subtitle) && (
            <p className='mt-4 text-lg max-w-2xl mx-auto' style={{ color: hexToRgba(titleColor, 0.5) }}
              dangerouslySetInnerHTML={{ __html: subtitle }} />
          )}
        </div>

        <div className={`grid gap-6 ${columnClass}`}>
          {testimonials.map((item, index) => (
            <TestimonialCard
              key={index}
              name={item.name}
              role={item.role}
              testimonial={item.testimonial}
              rating={item.rating}
              photo={item.photo}
              cardBgColor={cardBgColor}
              nameColor={nameColor}
              roleColor={roleColor}
              testimonialColor={testimonialColor}
              starColor={finalStarColor}
              bgColor={bgColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

Testimonials.craft = {
  displayName: 'Testimonials',
  props: {
    sectionTitle: 'Lo que dicen nuestros clientes',
    subtitle: '',
    titleAlignment: 'center',
    testimonials: [
      { name: 'Carlos Rodríguez', role: 'Comprador de Toyota Corolla', testimonial: 'Excelente servicio de principio a fin. El proceso de compra fue rápido y transparente. Estoy muy contento con mi nuevo auto.', rating: 5 },
      { name: 'María González', role: 'Compradora de Honda CR-V', testimonial: 'El asesor fue muy paciente y resolvió todas mis dudas. Me ayudaron a conseguir el financiamiento perfecto para mis necesidades.', rating: 4 },
      { name: 'Juan Pérez', role: 'Comprador de Nissan Sentra', testimonial: 'La garantía y el servicio post-venta son excelentes. Me han atendido siempre que lo he necesitado sin problemas.', rating: 5 },
    ],
    columns: 3,
    bgColor: '#ffffff',
    titleColor: '#111827',
    cardBgColor: '#ffffff',
    nameColor: '#111827',
    roleColor: '#6b7280',
    testimonialColor: '#374151',
    starColor: '#f59e0b',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => true },
};
