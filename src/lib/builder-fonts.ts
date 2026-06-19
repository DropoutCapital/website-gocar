// Lista curada de fuentes para el selector inline del builder (lado público).
//
// IMPORTANTE: espejo de goautos-admin/src/components/builder2/constants/builderFonts.ts
// Mantener AMBAS en sincronía: el editor ofrece estas fuentes y acá se cargan
// para que el sitio público las pueda renderizar. Si difieren, una fuente
// elegida en el editor no se carga acá y se ve el fallback.
//
// Pesos 400;700: únicos soportados por todas estas familias (pedir 500/600 a
// una que no los tiene rompe el request combinado de Google Fonts).

export interface BuilderFont {
  name: string;
  stack: string;
}

export const BUILDER_FONTS: BuilderFont[] = [
  { name: 'Inter', stack: "'Inter', sans-serif" },
  { name: 'Roboto', stack: "'Roboto', sans-serif" },
  { name: 'Montserrat', stack: "'Montserrat', sans-serif" },
  { name: 'Poppins', stack: "'Poppins', sans-serif" },
  { name: 'Lato', stack: "'Lato', sans-serif" },
  { name: 'Oswald', stack: "'Oswald', sans-serif" },
  { name: 'Raleway', stack: "'Raleway', sans-serif" },
  { name: 'Playfair Display', stack: "'Playfair Display', serif" },
  { name: 'Merriweather', stack: "'Merriweather', serif" },
  { name: 'Lora', stack: "'Lora', serif" },
];

/** URL combinada de Google Fonts que carga TODA la lista en un solo request. */
export const BUILDER_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  BUILDER_FONTS.map((f) => `family=${f.name.replace(/ /g, '+')}:wght@400;700`).join('&') +
  '&display=swap';
