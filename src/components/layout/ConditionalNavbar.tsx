'use client';

import { usePathname } from 'next/navigation';
import { useBuilderReady } from '@/hooks/useBuilderReady';
import Navbar from './Navbar';

/**
 * Navbar como fuente única. El dealer configura SU navbar en la home (dentro del
 * builder). Ese navbar se muestra en todo el sitio vía el Navbar estático del
 * layout, que lee los links/CTA configurados desde pages.home (extractBuilderNav).
 *
 * Solo la home renderiza su navbar inline (para editarlo WYSIWYG en el builder);
 * en el resto de páginas usamos el Navbar del layout. Antes cada página secundaria
 * traía su propia copia del navbar horneada en su árbol, que quedaba
 * desincronizada (o ausente) cuando el dealer editaba la home. El nodo navbar de
 * las páginas no-home se elimina en getPageBuilderData para que no salga duplicado.
 *
 * Mientras la estructura del builder aún carga renderizamos NADA en vez del navbar
 * estático, para evitar el flash de defaults hardcodeados. Ver useBuilderReady.
 */
export default function ConditionalNavbar() {
  const pathname = usePathname();
  const status = useBuilderReady();

  // Embed pages always use the static navbar
  if (pathname?.startsWith('/embed')) {
    return <Navbar />;
  }

  // Builder client still hydrating elements_structure → wait, don't flash static
  if (status === 'loading') return null;

  // Non-builder client, or structure failed to load (timeout) → static navbar
  if (status === 'fallback') return <Navbar />;

  // status === 'ready': solo la home renderiza su navbar inline (editable en el
  // builder). El resto de páginas usan el Navbar del layout, que lee el navbar
  // configurado en la home → fuente única, consistente en todo el sitio.
  if (pathname === '/') return null;

  return <Navbar />;
}
