'use client';
import {
  Card,
  CardBody,
  CardFooter,
  Chip,
  Divider,
} from '@heroui/react';
import Image from 'next/image';
import { Vehicle } from '../../utils/types';
import { useRouter } from 'next/navigation';
import {
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
} from '@/utils/functions';

interface VehicleHorizontalCardProps {
  vehicle: Vehicle;
  newBadgeText?: string;
}

const VehicleHorizontalCard = ({
  vehicle,
  newBadgeText = 'Nuevo',
}: VehicleHorizontalCardProps) => {
  const router = useRouter();

  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(vehicle.price);

  const discountedPrice = vehicle.discount_percentage
    ? vehicle.price * (1 - vehicle.discount_percentage / 100)
    : null;

  const savingsAmount = vehicle.discount_percentage
    ? vehicle.price - (discountedPrice || 0)
    : 0;

  const formattedSavings = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(savingsAmount);

  const isSold = vehicle.status?.name === 'Vendido';
  const isReserved = vehicle.status?.name === 'Reservado';

  const isNew = () => {
    if (!vehicle.created_at) return false;
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const createdAtDate = new Date(vehicle.created_at);
    return createdAtDate > fiveDaysAgo;
  };

  const handleViewDetails = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  return (
    <Card
      isPressable={!isSold && !isReserved}
      onPress={handleViewDetails}
      className={`overflow-hidden flex flex-row bg-white dark:bg-dark-card ${
        isSold || isReserved ? 'opacity-75' : ''
      }`}
    >
      <div className='w-[300px] flex-shrink-0'>
        <div className='relative w-full h-full min-h-[225px]'>
          {isSold && (
            <div className='absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-50 rotate-0'>
              <div className='absolute top-[30px] right-[-50px] bg-sold text-white font-bold py-2 w-[250px] text-center transform rotate-45'>
                VENDIDO
              </div>
            </div>
          )}
          {isReserved && (
            <div className='absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-50 rotate-0'>
              <div className='absolute top-[30px] right-[-50px] bg-yellow-500 text-white font-bold py-2 w-[250px] text-center transform rotate-45'>
                RESERVADO
              </div>
            </div>
          )}
          {vehicle.main_image && (
            <Image
              src={vehicle.main_image}
              alt={`${vehicle.brand?.name ?? ''} ${vehicle.model?.name ?? ''}`.trim() || 'Vehículo'}
              fill
              sizes="300px"
              className='object-cover'
            />
          )}
          {(vehicle.label || (isNew() && !isSold && !isReserved)) && (
            <div className='absolute top-2 right-2 z-20'>
              <Chip
                size='sm'
                className='shadow-lg text-white bg-green-100 text-green-700 border-none font-semibold'
              >
                {vehicle.label || newBadgeText}
              </Chip>
            </div>
          )}
          {!isSold &&
            !isReserved &&
            vehicle.discount_percentage !== undefined &&
            vehicle.discount_percentage > 0 && (
              <div className='absolute bottom-2 right-2 z-10'>
                <Chip
                  size='sm'
                  className='shadow-lg text-white bg-gradient-to-r from-orange-500 to-red-500 border-none'
                >
                  Ahorra {formattedSavings}
                </Chip>
              </div>
            )}
        </div>
      </div>

      <div className='flex flex-col flex-1'>
        <CardBody className='flex flex-col flex-grow p-4 relative'>
          <div className='space-y-2'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {vehicle.brand?.name} {vehicle.year}
                </p>
                <h3 className='text-xl font-bold dark:text-dark-text mt-1'>
                  {vehicle.model?.name}
                </h3>
              </div>
              <div className='text-right'>
                {vehicle.discount_percentage ? (
                  <>
                    <p className='text-base line-through text-gray-400 dark:text-gray-500'>
                      {formattedPrice}
                    </p>
                    <p className='text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                      }).format(discountedPrice!)}
                    </p>
                  </>
                ) : (
                  <p className='text-2xl font-bold text-primary dark:text-white'>
                    {formattedPrice}
                  </p>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
              <span>{vehicle.mileage.toLocaleString()} km</span>
              <span>•</span>
              <span className='capitalize'>{vehicle?.fuel_type?.name}</span>
              <span>•</span>
              <span>{mapTransmissionTypeToSpanish(vehicle.transmission)}</span>
            </div>

            {/*   <p className='text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2'>
              {vehicle.description}
            </p> */}

            <div className='flex flex-wrap gap-2 mt-2'>
              {vehicle.features.slice(0, 5).map((feature, index) => (
                <Chip
                  key={index}
                  size='sm'
                  variant='flat'
                  className='bg-gray-100 dark:bg-dark-border dark:text-dark-text'
                >
                  {feature}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>
      </div>
    </Card>
  );
};

export default VehicleHorizontalCard;
