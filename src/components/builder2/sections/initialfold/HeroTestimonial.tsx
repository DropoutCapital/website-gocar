import React from 'react';
import { useNode } from '@craftjs/core';
import { User, Star, Quote } from 'lucide-react';
import { isBlankHtml } from '@/utils/functions';

interface TestimonialProps {
  author: string;
  role: string;
  quote: string;
  avatar?: string;
  rating: number;
}

const Testimonial = ({ author, role, quote, avatar, rating }: TestimonialProps) => (
  <div className='bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center'>
    <div className='w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden'>
      {avatar ? (
        <img src={avatar} alt={author} className='w-full h-full object-cover' />
      ) : (
        <User size={40} className='text-gray-400' />
      )}
    </div>
    <div className='flex mb-3'>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={18} fill={i < rating ? '#FFD700' : 'none'} stroke={i < rating ? '#FFD700' : '#D1D5DB'} className='mx-0.5' />
      ))}
    </div>
    <Quote size={30} className='text-gray-300 mb-3' />
    {!isBlankHtml(quote) && <p className='text-gray-700 mb-4 italic'>{quote}</p>}
    {!isBlankHtml(author) && <h3 className='font-semibold text-gray-900'>{author}</h3>}
    {!isBlankHtml(role) && <p className='text-gray-500 text-sm'>{role}</p>}
  </div>
);

interface HeroTestimonialProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  testimonialTextColor?: string;
  accentColor?: string;
  testimonial1Author?: string;
  testimonial1Role?: string;
  testimonial1Quote?: string;
  testimonial1Avatar?: string;
  testimonial1Rating?: number;
  testimonial2Author?: string;
  testimonial2Role?: string;
  testimonial2Quote?: string;
  testimonial2Avatar?: string;
  testimonial2Rating?: number;
  testimonial3Author?: string;
  testimonial3Role?: string;
  testimonial3Quote?: string;
  testimonial3Avatar?: string;
  testimonial3Rating?: number;
}

export const HeroTestimonial = ({
  title = 'Lo que nuestros clientes dicen',
  subtitle = 'Miles de personas han encontrado su vehículo ideal con GoAuto',
  backgroundImage = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1470',
  overlayColor = '#000000',
  overlayOpacity = 0.7,
  textColor = '#ffffff',
  testimonial1Author = 'Carlos Rodríguez',
  testimonial1Role = 'Comprador Reciente',
  testimonial1Quote = 'Encontré mi auto soñado en menos de una semana. El proceso fue increíblemente sencillo y el financiamiento se ajustó perfectamente a mi presupuesto.',
  testimonial1Avatar = 'https://randomuser.me/api/portraits/men/32.jpg',
  testimonial1Rating = 5,
  testimonial2Author = 'Mariana López',
  testimonial2Role = 'Cliente Satisfecha',
  testimonial2Quote = 'La atención personalizada fue excepcional. Me ayudaron a entender todas mis opciones y encontré un vehículo que superó mis expectativas.',
  testimonial2Avatar = 'https://randomuser.me/api/portraits/women/44.jpg',
  testimonial2Rating = 5,
  testimonial3Author = 'Juan Méndez',
  testimonial3Role = 'Padre de Familia',
  testimonial3Quote = 'Necesitaba una camioneta familiar con excelentes condiciones y a buen precio. GoAuto me ofreció múltiples opciones que se ajustaban a mis necesidades.',
  testimonial3Avatar = 'https://randomuser.me/api/portraits/men/75.jpg',
  testimonial3Rating = 4,
}: HeroTestimonialProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        color: textColor,
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
      }}
      className='w-full min-h-[600px] flex items-center'
    >
      <div style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} className='absolute inset-0 z-0' />
      <div className='container mx-auto px-4 z-10 relative py-16'>
        <div className='max-w-3xl mx-auto text-center mb-12'>
          {!isBlankHtml(title) && <h1 style={{ color: textColor }} className='text-4xl md:text-5xl font-bold mb-4'>{title}</h1>}
          {!isBlankHtml(subtitle) && <p style={{ color: textColor }} className='text-lg md:text-xl'>{subtitle}</p>}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
          <Testimonial author={testimonial1Author} role={testimonial1Role} quote={testimonial1Quote} avatar={testimonial1Avatar} rating={testimonial1Rating} />
          <Testimonial author={testimonial2Author} role={testimonial2Role} quote={testimonial2Quote} avatar={testimonial2Avatar} rating={testimonial2Rating} />
          <Testimonial author={testimonial3Author} role={testimonial3Role} quote={testimonial3Quote} avatar={testimonial3Avatar} rating={testimonial3Rating} />
        </div>
      </div>
    </div>
  );
};

HeroTestimonial.craft = {
  displayName: 'Hero con Testimonios',
  props: {
    title: 'Lo que nuestros clientes dicen',
    subtitle: 'Miles de personas han encontrado su vehículo ideal con GoAuto',
    backgroundImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1470',
    overlayColor: '#000000',
    overlayOpacity: 0.7,
    textColor: '#ffffff',
    testimonialTextColor: '#333333',
    accentColor: '#3b82f6',
    testimonial1Author: 'Carlos Rodríguez',
    testimonial1Role: 'Comprador Reciente',
    testimonial1Quote: 'Encontré mi auto soñado en menos de una semana. El proceso fue increíblemente sencillo y el financiamiento se ajustó perfectamente a mi presupuesto.',
    testimonial1Avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    testimonial1Rating: 5,
    testimonial2Author: 'Mariana López',
    testimonial2Role: 'Cliente Satisfecha',
    testimonial2Quote: 'La atención personalizada fue excepcional. Me ayudaron a entender todas mis opciones y encontré un vehículo que superó mis expectativas.',
    testimonial2Avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    testimonial2Rating: 5,
    testimonial3Author: 'Juan Méndez',
    testimonial3Role: 'Padre de Familia',
    testimonial3Quote: 'Necesitaba una camioneta familiar con excelentes condiciones y a buen precio. GoAuto me ofreció múltiples opciones que se ajustaban a mis necesidades.',
    testimonial3Avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    testimonial3Rating: 4,
  },
};
