// Renderizador del horario de atención de la sucursal.
// Lee `dealerships.opening_hours` (mismo formato que el builder de GoAuto y que
// el openingHoursSpecification del SEO):
//   { "monday": { "open": "09:00", "close": "18:00" }, "sunday": { "closed": true } }
// Agrupa días consecutivos con el mismo horario (ej. "Lun – Vie: 09:00 – 18:00").

import { DayHours } from '@/utils/types';

export type OpeningHoursData = Record<string, DayHours>;

// Orden y etiquetas cortas — claves en inglés, alineadas con la config de GoAuto.
const DAYS: { key: string; short: string }[] = [
  { key: 'monday', short: 'Lun' },
  { key: 'tuesday', short: 'Mar' },
  { key: 'wednesday', short: 'Mié' },
  { key: 'thursday', short: 'Jue' },
  { key: 'friday', short: 'Vie' },
  { key: 'saturday', short: 'Sáb' },
  { key: 'sunday', short: 'Dom' },
];

// Valor normalizado de un día: 'closed', 'HH:MM-HH:MM', o null (sin datos → se omite).
const dayValue = (d?: DayHours): string | null => {
  if (!d) return null;
  if (d.closed) return 'closed';
  if (d.open && d.close) return `${d.open}-${d.close}`;
  return null;
};

const formatValue = (value: string): string =>
  value === 'closed' ? 'Cerrado' : value.replace('-', ' – ');

interface Group {
  from: string;
  to: string;
  value: string;
}

// Agrupa días consecutivos (en orden de semana) que comparten el mismo horario.
// Un día sin datos rompe la racha: no se asume que herede el horario del vecino.
const buildGroups = (hours: OpeningHoursData): Group[] => {
  const groups: Group[] = [];
  let prevExtendable = false; // ¿el día inmediatamente anterior alimentó el grupo actual?
  for (const { key, short } of DAYS) {
    const value = dayValue(hours[key]);
    if (value === null) {
      prevExtendable = false; // hueco → el siguiente día abre grupo nuevo
      continue;
    }
    const last = groups[groups.length - 1];
    if (last && last.value === value && prevExtendable) {
      last.to = short;
    } else {
      groups.push({ from: short, to: short, value });
    }
    prevExtendable = true;
  }
  return groups;
};

interface OpeningHoursProps {
  hours?: OpeningHoursData | null;
  labelColor?: string;
  valueColor?: string;
}

export default function OpeningHours({ hours, labelColor, valueColor }: OpeningHoursProps) {
  if (!hours) return null;
  const groups = buildGroups(hours);
  if (groups.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {groups.map((g, i) => (
        <div key={i} className="flex gap-2 text-sm">
          <span
            className={!labelColor ? 'w-20 flex-shrink-0 text-gray-700 dark:text-gray-300' : 'w-20 flex-shrink-0'}
            style={labelColor ? { color: labelColor } : undefined}
          >
            {g.from === g.to ? g.from : `${g.from} – ${g.to}`}
          </span>
          <span
            className={!valueColor ? 'text-gray-900 dark:text-white' : ''}
            style={valueColor ? { color: valueColor } : undefined}
          >
            {formatValue(g.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
