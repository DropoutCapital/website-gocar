'use client';

import { usePathname } from 'next/navigation';
import { useBuilderReady } from '@/hooks/useBuilderReady';
import Navbar from './Navbar';

/**
 * Shows the static Navbar ONLY when the builder is not active (or as a degraded
 * fallback if the builder structure fails to load).
 * When builder is enabled, the BuilderNavbar inside the builder data handles
 * navigation — except on /vehicles and /embed, where the builder doesn't render
 * and the static Navbar is used (it reads the client's configured links).
 *
 * While the builder structure is still loading we render NOTHING instead of the
 * static navbar, to avoid the 3-4s flash of hardcoded defaults before the real
 * builder navbar appears. See useBuilderReady.
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

  // status === 'ready': builder structure loaded.
  // /vehicles is not a builder page, so it still needs the static navbar
  // (which now reads the client's configured links from the builder).
  if (pathname?.startsWith('/vehicles')) {
    return <Navbar />;
  }

  // Other pages: the builder renders its own navbar inside the page.
  return null;
}
