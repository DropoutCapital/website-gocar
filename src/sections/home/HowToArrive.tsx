'use client';

import { useLoadScript, GoogleMap, OverlayView } from '@react-google-maps/api';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNode } from '@craftjs/core';
import useClientStore from '@/store/useClientStore';
import { Dealership } from '@/utils/types';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import OpeningHours from './OpeningHours';

interface HowToArriveProps {
  title?: string;
  subtitle?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  height?: string;
  buttonLabel?: string;
  bgColor?: string;
  textColor?: string;
  subtitleColor?: string;
  cardBgColor?: string;
  cardBorderColor?: string;
  labelColor?: string;
  valueColor?: string;
}

const grayMapStyle = [
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [{ color: '#f3f4f6' }],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#e5e7eb' }],
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [{ color: '#dbeafe' }],
  },
];

const MapMarker = ({
  onClick,
  isSelected,
  hasMultipleLocations = false,
}: {
  onClick?: () => void;
  isSelected?: boolean;
  hasMultipleLocations?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`cursor-pointer transition-all duration-200 ${
      isSelected ? 'scale-110' : 'hover:scale-105'
    } ${hasMultipleLocations && !isSelected ? 'opacity-40 hover:opacity-70' : ''}`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-8 h-8 drop-shadow-lg text-blue-500"
      fill="currentColor"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  </div>
);

export default function HowToArrive({
  title,
  subtitle,
  titleAlignment = 'center',
  height = '400px',
  buttonLabel,
  bgColor,
  textColor,
  subtitleColor,
  cardBgColor,
  cardBorderColor,
  labelColor,
  valueColor,
}: HowToArriveProps) {
  let connectors: any = null;
  let selected = false;

  try {
    const nodeData = useNode((state) => ({ selected: state.events.selected }));
    connectors = nodeData.connectors;
    selected = nodeData.selected;
  } catch {
    connectors = null;
    selected = false;
  }

  const { client } = useClientStore();
  const { t } = useTranslation();

  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    const fetchDealerships = async () => {
      if (client?.id) {
        const { data } = await supabase
          .from('dealerships')
          .select('*')
          .eq('client_id', client.id);

        // Filter out dealerships with invalid/missing location
        const valid = (data || []).filter(
          (d: any) => d.location && d.location.lat != null && d.location.lng != null
        );
        if (valid.length > 0) {
          setDealerships(valid);
          setSelectedDealership(valid[0]);
        } else if (client.location?.lat != null && client.location?.lng != null) {
          const defaultDealership: Dealership = {
            id: 'default',
            client_id: client.id,
            address: client.contact?.address || '',
            phone: client.contact?.phone || '',
            email: client.contact?.email || '',
            location: {
              lat: Number(client.location.lat),
              lng: Number(client.location.lng),
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setDealerships([defaultDealership]);
          setSelectedDealership(defaultDealership);
        }
      }
      setIsLoading(false);
    };

    fetchDealerships();
  }, [client]);

  const mapOptions = useMemo(
    () => ({
      styles: grayMapStyle,
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
    }),
    []
  );

  const handleOpenDirections = useCallback((dealership: Dealership) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dealership.location.lat},${dealership.location.lng}`;
    window.open(googleMapsUrl, '_blank');
  }, []);

  const currentIndex = dealerships.findIndex((d) => d.id === selectedDealership?.id);

  const handleNext = () => {
    if (dealerships.length <= 1) return;
    const nextIndex = (currentIndex + 1) % dealerships.length;
    setSelectedDealership(dealerships[nextIndex]);
  };

  const handlePrev = () => {
    if (dealerships.length <= 1) return;
    const prevIndex = (currentIndex - 1 + dealerships.length) % dealerships.length;
    setSelectedDealership(dealerships[prevIndex]);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary" />
      </div>
    );
  }

  return (
    <div
      ref={connectors?.connect || null}
      className={!bgColor ? `py-12 bg-slate-50/50 dark:bg-dark-bg ${selected ? 'ring-2 ring-dashed ring-slate-400' : ''}` : `py-12 ${selected ? 'ring-2 ring-dashed ring-slate-400' : ''}`}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 ${titleAlignment === 'center' ? 'text-center' : titleAlignment === 'right' ? 'text-right' : 'text-left'}`}>
          <h2
            className={!textColor ? 'text-3xl font-bold text-gray-900 dark:text-white mb-2' : 'text-3xl font-bold mb-2'}
            style={textColor ? { color: textColor } : undefined}
          >
            {title || t('home.howToArrive.title')}
          </h2>
          <p
            className={!subtitleColor ? 'text-gray-600 dark:text-gray-400' : ''}
            style={subtitleColor ? { color: subtitleColor } : undefined}
          >
            {subtitle || t('home.howToArrive.subtitle')}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Info Card - Fixed height */}
          <div className="lg:col-span-1">
            <div
              className={!cardBgColor ? 'bg-white dark:bg-dark-card rounded-xl shadow-sm border border-slate-200/60 dark:border-dark-border h-full min-h-[300px] flex flex-col' : 'rounded-xl shadow-sm h-full min-h-[300px] flex flex-col'}
              style={cardBgColor ? { backgroundColor: cardBgColor, border: `1px solid ${cardBorderColor || 'rgba(0,0,0,0.1)'}` } : undefined}
            >
              {/* Navigation (only if multiple) */}
              {dealerships.length > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-border">
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
                  >
                    <Icon icon="mdi:chevron-left" className="text-xl text-gray-500" />
                  </button>
                  <span className="text-sm text-gray-500">
                    {currentIndex + 1} {t('home.howToArrive.ofTotal')} {dealerships.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
                  >
                    <Icon icon="mdi:chevron-right" className="text-xl text-gray-500" />
                  </button>
                </div>
              )}

              {/* Content */}
              {selectedDealership && (
                <div className="p-5 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {/* Address */}
                    <div className="flex gap-3">
                      <Icon icon="mdi:map-marker" className="text-xl text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className={!labelColor ? 'text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1' : 'text-xs uppercase tracking-wide mb-1'} style={labelColor ? { color: labelColor } : undefined}>
                          {t('home.howToArrive.address')}
                        </p>
                        <p className={!valueColor ? 'text-gray-900 dark:text-white text-sm leading-relaxed' : 'text-sm leading-relaxed'} style={valueColor ? { color: valueColor } : undefined}>
                          {selectedDealership.address}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    {selectedDealership.phone && (
                      <div className="flex gap-3">
                        <Icon icon="mdi:phone" className="text-xl text-primary flex-shrink-0" />
                        <div>
                          <p className={!labelColor ? 'text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1' : 'text-xs uppercase tracking-wide mb-1'} style={labelColor ? { color: labelColor } : undefined}>
                            {t('home.howToArrive.phone')}
                          </p>
                          <a href={`tel:${selectedDealership.phone}`} className={!valueColor ? 'text-gray-900 dark:text-white text-sm hover:text-primary transition-colors' : 'text-sm transition-colors'} style={valueColor ? { color: valueColor } : undefined}>
                            {selectedDealership.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {selectedDealership.email && (
                      <div className="flex gap-3">
                        <Icon icon="mdi:email" className="text-xl text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className={!labelColor ? 'text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1' : 'text-xs uppercase tracking-wide mb-1'} style={labelColor ? { color: labelColor } : undefined}>
                            {t('home.howToArrive.email')}
                          </p>
                          <a href={`mailto:${selectedDealership.email}`} className={!valueColor ? 'text-gray-900 dark:text-white text-sm hover:text-primary transition-colors truncate block' : 'text-sm transition-colors truncate block'} style={valueColor ? { color: valueColor } : undefined}>
                            {selectedDealership.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Horario de atención */}
                    {selectedDealership.opening_hours && (
                      <div className="flex gap-3">
                        <Icon icon="mdi:clock-outline" className="text-xl text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className={!labelColor ? 'text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1' : 'text-xs uppercase tracking-wide mb-1'} style={labelColor ? { color: labelColor } : undefined}>
                            {t('home.howToArrive.hours')}
                          </p>
                          <OpeningHours
                            hours={selectedDealership.opening_hours}
                            labelColor={labelColor}
                            valueColor={valueColor}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <Button
                    color="primary"
                    className="w-full mt-4"
                    onPress={() => handleOpenDirections(selectedDealership)}
                  >
                    {buttonLabel || t('home.howToArrive.button')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div
              style={{ height }}
              className="w-full rounded-xl overflow-hidden shadow-sm border border-slate-200/60 dark:border-dark-border"
            >
              <GoogleMap
                zoom={15}
                center={
                  selectedDealership?.location
                    ? {
                        lat: Number(selectedDealership.location.lat),
                        lng: Number(selectedDealership.location.lng),
                      }
                    : { lat: -33.45, lng: -70.65 }
                }
                mapContainerStyle={{ width: '100%', height: '100%' }}
                options={mapOptions}
              >
                {dealerships.filter(d => d.location).map((dealership) => (
                  <OverlayView
                    key={dealership.id}
                    position={{
                      lat: Number(dealership.location.lat),
                      lng: Number(dealership.location.lng),
                    }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <MapMarker
                      onClick={() => setSelectedDealership(dealership)}
                      isSelected={selectedDealership?.id === dealership.id}
                      hasMultipleLocations={dealerships.length > 1}
                    />
                  </OverlayView>
                ))}
              </GoogleMap>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Configuración de CraftJS
HowToArrive.craft = {
  displayName: 'HowToArrive',
  props: {
    title: '',
    subtitle: '',
    titleAlignment: 'center',
    height: '400px',
    buttonLabel: '',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
