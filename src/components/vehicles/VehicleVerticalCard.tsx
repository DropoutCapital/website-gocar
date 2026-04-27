'use client';

import { Card, CardBody, CardFooter } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Calendar, Gauge, Settings, Fuel, Car } from 'lucide-react';
import { Vehicle } from '../../utils/types';
import { useCurrency } from '@/hooks/useCurrency';

// =============================
// Normalizadores locales (ES)
// =============================
type FuelEN = 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric' | 'Gas';
const normalizeFuel = (name?: string): FuelEN | undefined => {
  const k = (name ?? '').trim().toLowerCase();
  if (['gasoline', 'gasolina', 'bencina', 'nafta', 'petrol'].includes(k)) return 'Gasoline';
  if (['diesel', 'diésel', 'diseal', 'dísel'].includes(k)) return 'Diesel';
  if (['hybrid', 'híbrido', 'hibrido'].includes(k)) return 'Hybrid';
  if (['electric', 'eléctrico', 'electrico', 'ev'].includes(k)) return 'Electric';
  if (['gas', 'lpg', 'gnv', 'gpl', 'gás'].includes(k)) return 'Gas';
  return undefined;
};

type TransEN = 'Manual' | 'Automatic' | 'CVT' | 'Semi-Automatic' | 'Tiptronic' | 'Dual-Clutch';
const normalizeTrans = (name?: string): TransEN | undefined => {
  const k = (name ?? '').trim().toLowerCase();
  if (['manual', 'mecánica', 'mecanica', 'stick'].includes(k)) return 'Manual';
  if (['automatic', 'automática', 'automatica', 'auto'].includes(k)) return 'Automatic';
  if (['cvt'].includes(k)) return 'CVT';
  if (['semi-automatic', 'semiautomática', 'semiautomatica'].includes(k)) return 'Semi-Automatic';
  if (['tiptronic'].includes(k)) return 'Tiptronic';
  if (['dct', 'dual clutch', 'doble embrague'].includes(k)) return 'Dual-Clutch';
  return undefined;
};

const fuelEs: Record<FuelEN, string> = {
  Gasoline: 'Gasolina',
  Diesel: 'Diésel',
  Hybrid: 'Híbrido',
  Electric: 'Eléctrico',
  Gas: 'Gas',
};

const transEs: Record<TransEN, string> = {
  Manual: 'Manual',
  Automatic: 'Automática',
  CVT: 'CVT',
  'Semi-Automatic': 'Semiautomática',
  Tiptronic: 'Tiptronic',
  'Dual-Clutch': 'Doble embrague',
};

interface VehicleGridCardProps {
  vehicle: Vehicle;
  cardTitleField?: 'model' | 'brand';
  showBadgeCondition?: boolean;
  showBadgePromo?: boolean;
  showBadgeNew?: boolean;
  showBadgeCustom?: boolean;
  showRibbonSold?: boolean;
  showRibbonReserved?: boolean;
  showBadgeDiscount?: boolean;
  // Builder color overrides
  cardBgColor?: string;
  cardBorderColor?: string;
  cardTitleColor?: string;
  cardSubtitleColor?: string;
  cardSpecsColor?: string;
  cardPriceColor?: string;
}

/* =============================
 * Tag minimalista y profesional
 * ============================= */
const Tag = ({ text, primary = false }: { text: string; primary?: boolean }) => (
  <span
    className={`
      px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide whitespace-nowrap
      ${primary
        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
        : 'bg-white/90 text-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-200'}
    `}
  >
    {text}
  </span>
);

const VehicleGridCard = ({
  vehicle,
  cardTitleField = 'model',
  showBadgeCondition = true,
  showBadgePromo = true,
  showBadgeNew = true,
  showBadgeCustom = true,
  showRibbonSold = true,
  showRibbonReserved = true,
  showBadgeDiscount = true,
  cardBgColor,
  cardBorderColor,
  cardTitleColor,
  cardSubtitleColor,
  cardSpecsColor,
  cardPriceColor,
}: VehicleGridCardProps) => {
  const router = useRouter();
  const { formatPrice } = useCurrency();

  // Estados
  const status = (vehicle.status?.name || '').trim().toLowerCase();
  const isSold = status === 'vendido';
  const isReserved = status === 'reservado';
  const isUnavailable = isSold || isReserved;

  // "Reciente"
  const isNew = () => {
    if (!vehicle.created_at) return false;
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    return new Date(vehicle.created_at) > fiveDaysAgo;
  };

  // Badge promocional: solo etiquetas explícitas de la DB, sin auto-generación.
  const promoBadgeText = showBadgePromo ? (vehicle.label || undefined) : undefined;

  const goDetails = () => {
    if (!isUnavailable && vehicle.id) router.push(`/vehicles/${vehicle.id}`);
  };

  const formattedPrice = formatPrice(vehicle.price);
  const discountedPrice =
    vehicle.discount_percentage && vehicle.discount_percentage > 0
      ? vehicle.price * (1 - vehicle.discount_percentage / 100)
      : null;

  const mileageText =
    typeof vehicle.mileage === 'number' ? `${vehicle.mileage.toLocaleString('es-CL')} km` : '—';

  const transRaw = (vehicle as any).transmission ?? (vehicle as any).transmission_type;
  const transNorm = normalizeTrans(typeof transRaw === 'string' ? transRaw : String(transRaw ?? ''));
  const transLabel = transNorm ? transEs[transNorm] : '—';

  const fuelNorm = normalizeFuel(vehicle.fuel_type?.name);
  const fuelLabel = fuelNorm ? fuelEs[fuelNorm] : '—';

  const specs = [
    { icon: <Gauge size={16} className="opacity-80" />, text: mileageText },
    { icon: <Calendar size={16} className="opacity-80" />, text: vehicle.year ? String(vehicle.year) : '—' },
    { icon: <Settings size={16} className="opacity-80" />, text: transLabel },
    { icon: <Fuel size={16} className="opacity-80" />, text: fuelLabel },
  ];

  const conditionText = vehicle.condition?.name
    ? vehicle.condition.name.charAt(0).toUpperCase() + vehicle.condition.name.slice(1).toLowerCase()
    : undefined;

  const backendArrays = [
    (vehicle as any).badges,
    (vehicle as any).tags,
    (vehicle as any).labels,
  ].filter(Array.isArray) as string[][];

  const setLower = new Set<string>();
  const addUnique = (arr: string[], val?: string) => {
    if (!val) return arr;
    const v = val.trim();
    if (!setLower.has(v.toLowerCase())) {
      setLower.add(v.toLowerCase());
      arr.push(v);
    }
    return arr;
  };

  let leftChips: string[] = [];
  if (showBadgeCondition) leftChips = addUnique(leftChips, conditionText);
  if (showBadgeNew && isNew()) leftChips = addUnique(leftChips, 'Recién llegado');
  if (showBadgeCustom) backendArrays.forEach((a) => a.forEach((v) => addUnique(leftChips, v)));
  if (promoBadgeText) leftChips = leftChips.filter((c) => c.toLowerCase() !== promoBadgeText.toLowerCase());
  
  return (
    <div
      role={!isUnavailable ? 'button' : undefined}
      tabIndex={!isUnavailable ? 0 : -1}
      onClick={!isUnavailable ? goDetails : undefined}
      className={`group h-full outline-none ${!isUnavailable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <Card
        className={`h-full flex flex-col overflow-hidden rounded-2xl
        ${cardBgColor ? '' : 'bg-white dark:bg-[#0B0B0F]'}
        ${cardBorderColor ? '' : 'border border-black/10 dark:border-transparent'}
        shadow-sm transition-all duration-300
        ${isUnavailable ? 'opacity-90' : 'group-hover:shadow-xl group-hover:-translate-y-2'}`}
        style={{
          ...(cardBgColor ? { backgroundColor: cardBgColor } : {}),
          ...(cardBorderColor ? { borderWidth: 1, borderStyle: 'solid', borderColor: cardBorderColor } : {}),
        }}
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
          {vehicle.main_image ? (
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${vehicle.main_image})` }}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-neutral-200 dark:bg-neutral-900">
              <Car size={48} className="text-neutral-400" />
            </div>
          )}

          {/* Ribbons */}
          {showRibbonSold && isSold && (
            <div className="absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-20">
              <div className="absolute top-[30px] right-[-50px] bg-rose-600 text-white font-bold py-2 w-[250px] text-center rotate-45">
                VENDIDO
              </div>
            </div>
          )}
          {showRibbonReserved && isReserved && (
            <div className="absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-20">
              <div className="absolute top-[30px] right-[-50px] bg-amber-400 text-black font-bold py-2 w-[250px] text-center rotate-45">
                RESERVADO
              </div>
            </div>
          )}

          {/* Tags minimalistas en esquina superior izquierda */}
          {(promoBadgeText || leftChips.length > 0) && (
            <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-start gap-1.5">
              {promoBadgeText && <Tag text={promoBadgeText} primary />}
              {leftChips.map((txt, i) => (
                <Tag key={i} text={txt} />
              ))}
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        <CardBody className="flex-1 px-5 pt-4 pb-2">
          <h3
            className={`text-[20px] sm:text-[22px] font-semibold tracking-tight ${cardTitleColor ? '' : 'text-neutral-900 dark:text-white'}`}
            style={cardTitleColor ? { color: cardTitleColor } : undefined}
          >
            {cardTitleField === 'brand' ? (vehicle.brand?.name ?? 'Marca') : (vehicle.model?.name ?? 'Modelo')}
          </h3>
          <p
            className={`mt-0.5 text-sm ${cardSubtitleColor ? '' : 'text-neutral-600 dark:text-neutral-400'}`}
            style={cardSubtitleColor ? { color: cardSubtitleColor } : undefined}
          >
            {cardTitleField === 'brand' ? vehicle.model?.name : vehicle.brand?.name} {vehicle.year ?? ''}
          </p>

          <div
            className={`mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-[13px] ${cardSpecsColor ? '' : 'text-neutral-800 dark:text-neutral-300'}`}
            style={cardSpecsColor ? { color: cardSpecsColor } : undefined}
          >
            {specs.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 min-w-0">
                {s.icon}
                <span className="truncate">{s.text}</span>
              </div>
            ))}
          </div>

          {Array.isArray(vehicle.features) && vehicle.features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vehicle.features.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[11px] leading-5 bg-neutral-100 text-neutral-700 dark:bg-white/5 dark:text-neutral-200"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </CardBody>

        {/* FOOTER */}
        <CardFooter className="px-5 pb-5 pt-3">
          <div className="w-full flex items-end justify-between">
            <div className="flex flex-col">
              {showBadgeDiscount && discountedPrice ? (
                <>
                  <span className="text-sm line-through text-neutral-500 dark:text-neutral-400">
                    {formattedPrice}
                  </span>
                  <span
                    className={`text-2xl font-extrabold tracking-tight ${cardPriceColor ? '' : 'text-primary'}`}
                    style={cardPriceColor ? { color: cardPriceColor } : undefined}
                  >
                    {formatPrice(discountedPrice)}
                  </span>
                </>
              ) : (
                <span
                  className={`text-2xl font-extrabold tracking-tight ${cardPriceColor ? '' : 'text-neutral-900 dark:text-white'}`}
                  style={cardPriceColor ? { color: cardPriceColor } : undefined}
                >
                  {formattedPrice}
                </span>
              )}
            </div>

          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VehicleGridCard;
