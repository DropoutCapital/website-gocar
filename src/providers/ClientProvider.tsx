'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';
import useVehiclesStore from '@/store/useVehiclesStore';
import { useInitializeStore } from '@/hooks/useInitializeStore';
import { useLanguageStore, isValidLanguage } from '@/store/useLanguageStore';

// elements_structure can grow to 10+ MB per client (LZ-compressed builder JSON).
// We exclude it from the initial fetch so the site renders fast (~5 KB instead
// of multi-MB), then hydrate it in background. BuilderPageWrapper has a
// fallback that renders default templates while elements_structure is missing.
const WEBSITE_CONFIG_LIGHT_COLS =
  'id, client_id, theme, content, why_us_items, media, integrations, ' +
  'is_enabled, sections, typography, home_html, home_css, color_scheme, ' +
  'translations, created_at, updated_at';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { setClient, setIsLoading } = useClientStore();
  const { fetchVehicles } = useVehiclesStore();
  const { isLoading } = useInitializeStore();
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    async function loadClientAndVehicles() {
      const domain = window.location.host;

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`*, dealerships(*), client_website_config(${WEBSITE_CONFIG_LIGHT_COLS})`)
        .eq('domain', domain)
        .single();

      if (clientData) {
        setClient(clientData);
        // Fetch vehicles for this client, including demo vehicles if has_demo is true
        await fetchVehicles(clientData.id, clientData.has_demo);

        // Initialize language from client default if no user preference is persisted
        try {
          const persisted = localStorage.getItem('language-storage');
          const parsed = persisted ? JSON.parse(persisted) : null;
          const existing = parsed?.state?.currentLanguage as string | undefined;
          const clientDefault = (clientData as any)?.default_language as
            | string
            | undefined;
          if (!existing && clientDefault && isValidLanguage(clientDefault)) {
            setLanguage(clientDefault);
          }
        } catch (e) {
          // ignore persistence errors
        }

        setIsLoading(false);

        // Background-hydrate elements_structure (the heavy column). When it lands,
        // BuilderPageWrapper's useMemo on client_website_config recalculates and
        // its cache gets populated, swapping the fallback for the real builder UI.
        const cfgArr = (clientData as any).client_website_config;
        const cfgRow = Array.isArray(cfgArr) ? cfgArr[0] : cfgArr;
        if (cfgRow?.id) {
          supabase
            .from('client_website_config')
            .select('id, elements_structure')
            .eq('id', cfgRow.id)
            .single()
            .then(({ data: esData }) => {
              if (!esData?.elements_structure) return;
              const current = useClientStore.getState().client;
              if (!current || (current as any).id !== (clientData as any).id) return;
              const currentCfg = (current as any).client_website_config;
              const currentRow = Array.isArray(currentCfg) ? currentCfg[0] : currentCfg;
              if (!currentRow) return;
              const updatedRow = { ...currentRow, elements_structure: esData.elements_structure };
              const updatedCfg = Array.isArray(currentCfg) ? [updatedRow] : updatedRow;
              setClient({ ...current, client_website_config: updatedCfg } as any);
            });
        }
      } else {
        setIsLoading(false);
      }
    }

    loadClientAndVehicles();
  }, []);

  return children;
}
