'use client';

import { useEffect, useState } from 'react';
import useClientStore from '@/store/useClientStore';

export type BuilderReadyStatus = 'loading' | 'ready' | 'fallback';

// Si el fetch en background de elements_structure (columna pesada) tarda más que
// esto, degradamos al chrome estático para que el sitio NO quede colgado en blanco
// si el fetch falla. En clientes normales la estructura llega en 1-3s.
const STRUCTURE_TIMEOUT_MS = 10000;

/**
 * Resuelve si ya podemos mostrar el contenido REAL del builder o no, evitando el
 * "flash" de los componentes estáticos hardcodeados.
 *
 * Contexto: el sitio carga en 2 etapas (ver ClientProvider). El fetch liviano trae
 * `is_enabled` pero NO `elements_structure` (la columna pesada, hasta 45MB), que
 * llega después en background. En esa ventana `is_enabled && elements_structure`
 * da false → los componentes condicionales mostraban el chrome estático y luego
 * saltaban al del builder (3-4s de parpadeo).
 *
 * Estados:
 * - 'loading'  → cliente builder con la estructura aún sin llegar → NO mostrar nada
 *                estático todavía (esperar y revelar el real).
 * - 'fallback' → cliente NO builder, o la estructura no llegó tras el timeout →
 *                mostrar el chrome estático (comportamiento tradicional / degradado).
 * - 'ready'    → estructura cargada → el builder ya puede renderizar lo real.
 */
export function useBuilderReady(): BuilderReadyStatus {
  const { client, isLoading } = useClientStore();
  const config = (client as any)?.client_website_config;
  const cfg = Array.isArray(config) ? config[0] : config;
  const isBuilderClient = !!cfg?.is_enabled;
  const structureReady = !!cfg?.elements_structure;

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!isBuilderClient || structureReady) {
      setTimedOut(false);
      return;
    }
    const id = setTimeout(() => setTimedOut(true), STRUCTURE_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [isBuilderClient, structureReady]);

  if (isLoading) return 'loading';
  if (!isBuilderClient) return 'fallback';
  if (structureReady) return 'ready';
  if (timedOut) return 'fallback';
  return 'loading';
}
