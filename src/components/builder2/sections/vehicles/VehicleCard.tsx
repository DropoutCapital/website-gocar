import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink,
  Car,
  Tag,
  Calendar,
  Gauge,
  Settings,
} from 'lucide-react';
import { useEditor } from '@craftjs/core';
import { SimpleVehicle } from './VehicleCarousel';
import { useCurrency } from '@/hooks/useCurrency';
import { readableTextOn } from '@/utils/colors';

type FeatureKey = 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';

export interface VehicleCardProps {
  vehicle: SimpleVehicle; // Expect the whole vehicle object
  compact?: boolean;
  cardBgColor?: string;
  cardBorderColor?: string;
  cardTextColor?: string;
  cardPriceColor?: string;
  cardButtonColor?: string;
  cardButtonTextColor?: string;
  detailsButtonText?: string;
  bannerPosition?: 'left' | 'right';
  newBadgeText?: string; // New prop for the "Recién publicado" badge text
  pricePosition?: 'overlay' | 'below-title';
  // 🔧 AQUI EL CAMBIO: las 4 keys pasan a ser OPCIONALES para aceptar objetos parciales
  featuresConfig?: {
    feature1?: FeatureKey;
    feature2?: FeatureKey;
    feature3?: FeatureKey;
    feature4?: FeatureKey;
  };
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle, // Destructure vehicle
  compact = false,
  cardBgColor = '#ffffff',
  cardBorderColor = '#e5e7eb',
  cardTextColor = '#1f2937',
  cardPriceColor = '#ffffff',
  cardButtonColor = '#3b82f6',
  cardButtonTextColor = '#ffffff',
  detailsButtonText = 'Ver detalles',
  bannerPosition = 'right',
  newBadgeText = 'Recién publicado', // Default text
  pricePosition = 'overlay',
  // 🔧 Fallback por defecto (se mantiene)
  featuresConfig = {
    feature1: 'category',
    feature2: 'year',
    feature3: 'fuel',
    feature4: 'mileage',
  },
}) => {
  const { formatPrice } = useCurrency();

  // Función para obtener el color del año según la posición del precio
  const getYearColor = (position: 'overlay' | 'below-title') => {
    return position === 'overlay' ? '#ffffff' : '#374151';
  };

  const renderPrice = () => {
    const priceColor = pricePosition === 'overlay' ? '#ffffff' : '#374151';

    if (price && displayDiscountedPrice && displayDiscountedPrice < price) {
      return (
        <>
          <span
            className='font-bold text-xl'
            style={{
              background:
                pricePosition === 'overlay'
                  ? 'linear-gradient(to right, #FDBA74, #EA580C)'
                  : 'linear-gradient(to right, #FDBA74, #EA580C)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            }}
          >
            {formatPrice(displayDiscountedPrice)}
          </span>
          <span
            className='ml-2 text-sm line-through'
            style={{ color: priceColor, opacity: '0.7' }}
          >
            {formatPrice(price)}
          </span>
        </>
      );
    } else {
      return (
        <span className='font-bold text-xl' style={{ color: priceColor }}>
          {price ? formatPrice(price) : 'Consultar'}
        </span>
      );
    }
  };

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const {
    id,
    brand,
    model,
    price,
    year,
    mileage,
    main_image,
    status,
    category,
    fuel_type,
    condition,
    transmission,
    created_at,
    discount_percentage,
    label,
  } = vehicle;

  // 🔧 TIPADO EXPLÍCITO (evita implicit any)
  let displayDiscountedPrice: number | undefined;
  if (price && discount_percentage && discount_percentage > 0) {
    displayDiscountedPrice = price * (1 - discount_percentage / 100);
  }

  // Only show banner/ribbon for Vendido and Reservado states, not for other custom visible states
  const isNotAvailable = status?.name && (status.name === 'Vendido' || status.name === 'Reservado');

  const isNew = () => {
    if (!created_at) return false;
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const createdAtDate = new Date(created_at);
    return createdAtDate > fiveDaysAgo;
  };

  // Obtener color del badge de estado
  const getStatusColor = (statusName: string) => {
    switch (statusName) {
      case 'Vendido':
        return 'bg-red-700 text-white';
      case 'Reservado':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para renderizar una característica específica
  const renderFeature = (featureType: FeatureKey | string) => {
    const iconProps = {
      size: 14,
      className: 'mr-1',
      style: { opacity: '0.6' },
    };
    const textStyle = { color: cardTextColor, opacity: '0.7' };

    switch (featureType) {
      case 'category':
        return category?.name ? (
          <div className='flex items-center text-xs' style={textStyle}>
            <Car {...iconProps} />
            <span>{category.name}</span>
          </div>
        ) : null;

      case 'year':
        return year ? (
          <div className='flex items-center text-xs' style={textStyle}>
            <Calendar {...iconProps} />
            <span>{year}</span>
          </div>
        ) : null;

      case 'fuel':
        return fuel_type?.name ? (
          <div className='flex items-center text-xs' style={textStyle}>
            <Tag {...iconProps} />
            <span>
              {fuel_type.name.charAt(0).toUpperCase() + fuel_type.name.slice(1)}
            </span>
          </div>
        ) : null;

      case 'mileage':
        return mileage != null && mileage !== undefined ? (
          <div className='flex items-center text-xs' style={textStyle}>
            <Gauge {...iconProps} />
            <span>{mileage.toLocaleString()} km</span>
          </div>
        ) : null;

      case 'transmission':
        return transmission && transmission.trim() !== '' ? (
          <div className='flex items-center text-xs' style={textStyle}>
            <Settings {...iconProps} />
            <span>{transmission}</span>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  const bannerBaseClasses =
    'absolute w-[200%] text-center py-2 font-bold text-sm uppercase tracking-wider shadow-xl transform';
  const bannerPositionClasses =
    bannerPosition === 'left'
      ? 'rotate-[-45deg] top-[30px] left-[-75px]'
      : 'rotate-45 top-[30px] right-[-75px]';

  return (
    <div
      className={`group relative overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md h-full
         ${isNotAvailable ? 'opacity-90' : ''}`}
      style={{
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        cursor: !enabled && !isNotAvailable ? 'pointer' : 'default',
      }}
      onClick={() => {
        if (!enabled && !isNotAvailable) {
          window.location.href = `/vehicles/${id}`;
        }
      }}
    >
      {/* Imagen */}
      <div
        className={`relative ${compact ? 'h-48' : 'h-64'} overflow-hidden bg-gray-100`}
      >
        {main_image ? (
          <Image
            src={main_image}
            alt={`${brand?.name ?? ''} ${model?.name ?? ''}`.trim() || 'Vehículo'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gray-100'>
            <Car size={48} className='text-gray-300' />
          </div>
        )}

        {isNotAvailable && status?.name && (
          <div className={`absolute top-0 ${bannerPosition === 'left' ? 'left-0' : 'right-0'} overflow-hidden w-36 h-36 z-20`}>
            <div className={`${getStatusColor(status.name)} ${bannerBaseClasses} ${bannerPositionClasses}`}>
              {status.name}
            </div>
          </div>
        )}

        {label && !isNotAvailable && (
          <div className='absolute top-2 right-2 z-10'>
            <Badge
              className='text-xs font-semibold px-2.5 py-1 rounded-full'
              style={
                vehicle.label_color
                  ? {
                      backgroundColor: vehicle.label_color,
                      color: readableTextOn(vehicle.label_color),
                    }
                  : { backgroundColor: '#dcfce7', color: '#15803d' }
              }
            >
              {label}
            </Badge>
          </div>
        )}

        {pricePosition === 'overlay' && (
          <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity'>
            <div className='flex justify-between items-center'>
              <div>{renderPrice()}</div>
              <div className='text-xs' style={{ color: getYearColor(pricePosition), opacity: '0.8' }}>
                {year}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 ${isNotAvailable ? 'pointer-events-none' : ''}`}>
        <h3 className='text-lg font-semibold mb-1' style={{ color: cardTextColor }}>
          {brand?.name} {model?.name}
        </h3>

        {pricePosition === 'below-title' && <div className='mb-3'>{renderPrice()}</div>}

        {!compact && (
          <div className='mt-3 grid grid-cols-2 gap-2'>
            {/* Renderizar en el orden especificado (con fallback si faltan claves) */}
            {featuresConfig?.feature1 ? renderFeature(featuresConfig.feature1) : renderFeature('category')}
            {featuresConfig?.feature2 ? renderFeature(featuresConfig.feature2) : renderFeature('year')}
            {featuresConfig?.feature3 ? renderFeature(featuresConfig.feature3) : renderFeature('fuel')}
            {featuresConfig?.feature4 ? renderFeature(featuresConfig.feature4) : renderFeature('mileage')}
          </div>
        )}

        <div className={`${compact ? 'mt-2' : 'mt-4'} flex`}>
          <Button
            variant='outline'
            size='sm'
            className={`text-xs transition-colors w-full hover:opacity-90 ${
              isNotAvailable || enabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            style={{
              borderColor: cardButtonColor,
              backgroundColor: cardButtonTextColor,
              color: cardButtonColor,
            }}
            onClick={(e) => {
              if (enabled || isNotAvailable) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              window.location.href = `/vehicles/${id}`;
            }}
            disabled={!!(enabled || isNotAvailable)}
          >
            <span>{detailsButtonText}</span>
            <ExternalLink size={12} className='ml-1' />
          </Button>
        </div>
      </div>
    </div>
  );
};
