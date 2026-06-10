/**
 * Emite datos estructurados schema.org como <script type="application/ld+json">.
 * Usar SOLO dentro de server components (los builders viven en lib/structured-data.ts).
 * Acepta un objeto o un arreglo de objetos (se emite un <script> por cada uno).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
