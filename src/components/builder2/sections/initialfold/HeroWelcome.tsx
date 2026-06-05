'use client';

import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Input } from '@heroui/react';
import { Search, X } from 'lucide-react';
import useClientStore from '@/store/useClientStore';
import useVehicleFiltersStore from '@/store/useVehicleFiltersStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { isBlankHtml } from '@/utils/functions';

const searchExamplesEs = [
  'Toyota Corolla blanco',
  'SUV automático bajo 15 millones',
  'Sedán nuevo con garantía',
];

const searchExamplesEn = [
  'White Toyota Corolla',
  'Automatic SUV under 15 million',
  'New sedan with warranty',
];

interface HeroWelcomeProps {
  title?: string;
  highlightedText?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  bgColor?: string;
  textColor?: string;
  highlightColor?: string;
}

export const HeroWelcome = ({
  title = 'Encuentra tu próximo vehículo en',
  highlightedText,
  subtitle = 'Describe el vehículo de tus sueños y deja que nuestra IA encuentre las mejores opciones para ti.',
  searchPlaceholder,
  bgColor = '#ffffff',
  textColor = '#111827',
  highlightColor,
}: HeroWelcomeProps) => {
  const {
    connectors: { connect },
    selected,
  } = useNode((state) => ({ selected: state.events.selected }));

  const { client } = useClientStore();
  const { t, currentLanguage } = useTranslation();
  const defaultLang = client?.default_language || 'es';

  // Use i18n translations when viewing in a non-default language
  const isTranslated = client?.has_language_selector && currentLanguage !== defaultLang;
  const effectiveTitle = isTranslated ? t('home.welcome.title') : title;
  const effectiveSubtitle = isTranslated ? t('home.welcome.description') : subtitle;

  const activeExamples = currentLanguage === 'en' ? searchExamplesEn : searchExamplesEs;

  // '' = borrado a propósito → respetarlo. undefined = nunca se tocó → usar nombre del cliente.
  const finalHighlightedText = highlightedText ?? client?.name ?? 'Automotora';
  const primaryColor = client?.theme?.light?.primary || '#e05d31';
  const finalHighlightColor = highlightColor || primaryColor;

  // Search functionality
  const { setSearchQuery } = useVehicleFiltersStore();
  const [inputValue, setInputValue] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const currentExample = activeExamples[exampleIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentExample.length) {
          setPlaceholder(currentExample.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(currentExample.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setExampleIndex((exampleIndex + 1) % activeExamples.length);
        }
      }
    }, isDeleting ? 30 : 80);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, exampleIndex]);

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    setSearchQuery(value);
    setTimeout(() => {
      const vehiclesSection = document.getElementById('vehicles-section') ||
        document.querySelector('[data-section="vehicles"]');
      if (vehiclesSection) {
        vehiclesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => { if (ref) connect(ref); }}
      style={{ background: bgColor }}
      className={selected ? 'ring-2 ring-dashed ring-slate-400' : ''}
    >
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          <div className='text-center'>
            {(!isBlankHtml(effectiveTitle) || !isBlankHtml(finalHighlightedText)) && (
              <h1
                className='text-5xl font-bold tracking-tight sm:text-6xl max-w-3xl mx-auto'
                style={{ color: textColor, lineHeight: '1.1' }}
              >
                {!isBlankHtml(effectiveTitle) && (
                  <span dangerouslySetInnerHTML={{ __html: effectiveTitle || '' }} />
                )}
                {!isBlankHtml(effectiveTitle) && !isBlankHtml(finalHighlightedText) ? ' ' : ''}
                {!isBlankHtml(finalHighlightedText) && (
                  <span style={{ color: finalHighlightColor }}
                    dangerouslySetInnerHTML={{ __html: finalHighlightedText || '' }} />
                )}
              </h1>
            )}

            {!isBlankHtml(effectiveSubtitle) && (
              <p
                className='mt-6 text-xl leading-8 max-w-2xl mx-auto'
                style={{ color: textColor, opacity: 0.7 }}
                dangerouslySetInnerHTML={{ __html: effectiveSubtitle || '' }}
              />
            )}

            {/* Functional search bar */}
            <div className='mt-10 max-w-3xl mx-auto'>
              <div className='relative'>
                <Input
                  type='text'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputValue)}
                  placeholder={placeholder || activeExamples[0].charAt(0)}
                  size='lg'
                  radius='lg'
                  startContent={
                    <Search size={18} style={{ color: finalHighlightColor }} className='ml-1' />
                  }
                  classNames={{
                    base: 'w-full',
                    inputWrapper: 'bg-slate-100 dark:bg-[#0B0B0F] border-none shadow-lg h-14',
                    input: 'text-base',
                  }}
                  endContent={
                    <div className='flex items-center gap-1'>
                      {inputValue && (
                        <button
                          onClick={handleClear}
                          className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                        >
                          <X size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleSearch(inputValue)}
                        className='p-2 text-gray-500 hover:text-primary transition-colors'
                      >
                        <Search size={20} />
                      </button>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

(HeroWelcome as any).craft = {
  displayName: 'HeroWelcome',
  props: {
    title: 'Encuentra tu próximo vehículo en',
    // highlightedText sin default (undefined) → al arrastrarlo muestra el nombre del cliente,
    // pero una vez que el usuario lo borra ('') se respeta y queda vacío.
    subtitle: 'Describe el vehículo de tus sueños y deja que nuestra IA encuentre las mejores opciones para ti.',
    searchPlaceholder: 'Toyota Corolla blanco',
    bgColor: '#ffffff',
    textColor: '#111827',
    highlightColor: '',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
