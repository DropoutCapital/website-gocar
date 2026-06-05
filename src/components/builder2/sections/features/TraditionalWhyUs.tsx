'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Icon } from '@iconify/react';
import { isBlankHtml } from '@/utils/functions';

const defaultItems = [
  { title: 'Garantía', description: 'Todos nuestros vehículos cuentan con garantía', icon: 'mdi:shield-check' },
  { title: 'Financiamiento', description: 'Opciones de financiamiento flexibles', icon: 'mdi:cash-multiple' },
  { title: 'Calidad', description: 'Vehículos seleccionados y certificados', icon: 'mdi:certificate' },
];

interface WhyUsItem {
  title: string;
  description: string;
  icon: string;
}

interface TraditionalWhyUsProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  cardBgColor?: string;
  items?: WhyUsItem[];
}

export const TraditionalWhyUs = ({
  title = '¿Por qué elegirnos?',
  subtitle = 'Descubre por qué nuestros clientes confían en nosotros',
  bgColor = '',
  textColor = '',
  subtitleColor = '',
  accentColor = '',
  cardBgColor = '',
  items,
}: TraditionalWhyUsProps) => {
  const {
    connectors: { connect },
    selected,
  } = useNode((state) => ({ selected: state.events.selected }));

  const finalBg = bgColor || '#f8fafc';
  const finalText = textColor || '#111827';
  const finalSubtitle = subtitleColor || '#4b5563';
  const finalAccent = accentColor || '#3b82f6';
  const finalCardBg = cardBgColor || '#ffffff';
  const displayItems = items || defaultItems;

  return (
    <div
      ref={(ref: HTMLDivElement | null) => { if (ref) connect(ref); }}
      className={selected ? 'ring-2 ring-dashed ring-slate-400' : ''}
    >
      <section style={{ backgroundColor: finalBg }} className='py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {!isBlankHtml(title) && (
            <h2
              className='text-3xl font-bold text-center mb-4'
              style={{ color: finalText }}
              dangerouslySetInnerHTML={{ __html: title || '' }}
            />
          )}
          {!isBlankHtml(subtitle) && (
            <p
              className='text-center mb-12 max-w-3xl mx-auto'
              style={{ color: finalSubtitle }}
              dangerouslySetInnerHTML={{ __html: subtitle || '' }}
            />
          )}
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {displayItems.map((feature, i) => (
              <div
                key={i}
                className='text-center p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200'
                style={{ backgroundColor: finalCardBg }}
              >
                <div className='flex justify-center mb-4'>
                  <Icon
                    icon={feature.icon}
                    className='w-12 h-12'
                    style={{ color: finalAccent }}
                  />
                </div>
                {!isBlankHtml(feature.title) && (
                  <h3 className='text-lg font-medium' style={{ color: finalText }}>
                    {feature.title}
                  </h3>
                )}
                {!isBlankHtml(feature.description) && (
                  <p className='mt-2 text-base' style={{ color: finalSubtitle }}>
                    {feature.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

(TraditionalWhyUs as any).craft = {
  displayName: 'TraditionalWhyUs',
  props: {
    title: '¿Por qué elegirnos?',
    subtitle: 'Descubre por qué nuestros clientes confían en nosotros',
    bgColor: '',
    textColor: '',
    subtitleColor: '',
    accentColor: '',
    cardBgColor: '',
    items: [
      { title: 'Garantía', description: 'Todos nuestros vehículos cuentan con garantía', icon: 'mdi:shield-check' },
      { title: 'Financiamiento', description: 'Opciones de financiamiento flexibles', icon: 'mdi:cash-multiple' },
      { title: 'Calidad', description: 'Vehículos seleccionados y certificados', icon: 'mdi:certificate' },
    ],
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
