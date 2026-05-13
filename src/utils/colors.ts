// Devuelve el color de texto (negro o blanco) con mejor contraste sobre un
// background hex. Usado para que las etiquetas con color custom siempre se
// lean bien sin importar qué color elija el cliente.
export const readableTextOn = (hex: string | undefined | null): string => {
  if (!hex) return '#ffffff';
  const h = hex.replace('#', '');
  if (h.length !== 3 && h.length !== 6) return '#ffffff';
  const expand = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(expand.slice(0, 2), 16);
  const g = parseInt(expand.slice(2, 4), 16);
  const b = parseInt(expand.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return '#ffffff';
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111827' : '#ffffff';
};
