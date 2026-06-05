'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Icon } from '@iconify/react';
import { isBlankHtml } from '@/utils/functions';

interface TraditionalContactCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

export const TraditionalContactCTA = ({
  title = '¿Listo para encontrar tu próximo vehículo?',
  subtitle = 'Contáctanos hoy mismo.',
  buttonText = 'Contáctanos',
  buttonLink = '/contact',
  bgColor = '',
  textColor = '',
  buttonColor = '',
  buttonTextColor = '#ffffff',
}: TraditionalContactCTAProps) => {
  const {
    connectors: { connect },
    selected,
  } = useNode((state) => ({ selected: state.events.selected }));

  const finalBg = bgColor || '#ffffff';
  const finalText = textColor || '#000000';
  const finalButtonColor = buttonColor || '#3b82f6';

  return (
    <div
      ref={(ref: HTMLDivElement | null) => { if (ref) connect(ref); }}
      className={selected ? 'ring-2 ring-dashed ring-slate-400' : ''}
    >
      <section style={{ backgroundColor: finalBg }}>
        <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between'>
          {(!isBlankHtml(title) || !isBlankHtml(subtitle)) && (
            <h2 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
              {!isBlankHtml(title) && (
                <span
                  className='block'
                  style={{ color: finalText }}
                  dangerouslySetInnerHTML={{ __html: title || '' }}
                />
              )}
              {!isBlankHtml(subtitle) && (
                <span
                  className='block'
                  style={{ color: finalText, opacity: 0.7 }}
                  dangerouslySetInnerHTML={{ __html: subtitle || '' }}
                />
              )}
            </h2>
          )}
          {!isBlankHtml(buttonText) && (
            <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
              <a href={buttonLink}>
                <button
                  className='group hover:opacity-90 transition-colors rounded-xl px-6 inline-flex items-center justify-center text-base font-medium h-12'
                  style={{ backgroundColor: finalButtonColor, color: buttonTextColor }}
                >
                  <Icon icon='mdi:message-text' className='text-xl mr-2' />
                  <span dangerouslySetInnerHTML={{ __html: buttonText || '' }} />
                  <Icon icon='mdi:arrow-right' className='text-xl ml-2 group-hover:translate-x-1 transition-transform duration-200' />
                </button>
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

(TraditionalContactCTA as any).craft = {
  displayName: 'TraditionalContactCTA',
  props: {
    title: '¿Listo para encontrar tu próximo vehículo?',
    subtitle: 'Contáctanos hoy mismo.',
    buttonText: 'Contáctanos',
    buttonLink: '/contact',
    bgColor: '',
    textColor: '',
    buttonColor: '',
    buttonTextColor: '#ffffff',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
