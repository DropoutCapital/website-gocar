'use client';

import React, { useEffect, useMemo, useState, useDeferredValue, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import useMediaQuery from '@/hooks/useMediaQuery';
import useVehiclesStore from '@/store/useVehiclesStore';
import useClientStore from '@/store/useClientStore';
import { Vehicle } from '@/utils/types';
import {
  Button,
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from '@heroui/react';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import ModalSlideFilter from '@/components/filters/ModalSlideFilter';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import { useGeneralStore } from '@/store/useGeneralStore';
import useVehicleFiltersStore from '@/store/useVehicleFiltersStore';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import NewVehicleFilters from '@/sections/vehicles/new-vehicle-filters';

// ------------------------------------
// Helpers
// ------------------------------------
const isAvailable = (v: Vehicle) =>
  v.status?.name !== 'Vendido' && v.status?.name !== 'Reservado';

const valueMatches = (
  filterVal: string | string[] | undefined,
  candidate?: number | string | null
) => {
  if (!filterVal) return true;
  const c = candidate?.toString();
  if (!c) return false;
  return Array.isArray(filterVal) ? filterVal.includes(c) : filterVal === c;
};

const asArray = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : []);

// Traducción con fallback HUMANO. Si t(key) === key -> usa fallback.
function useTx() {
  const { t } = useTranslation();
  const tx = (key: string, fallback: string) => {
    const val = t?.(key) ?? '';
    if (!val || val === key) return fallback;
    return val;
  };
  return { tx };
}

// ------------------------------------
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

const VehiclesPageInner: React.FC = () => {
  const { tx } = useTx();
  const isMd = useMediaQuery('(min-width: 768px)');

  // Promo activa vía URL (?promo=cyber). Filtra por etiqueta del vehículo.
  // Sin campo nuevo en BD: usa la misma etiqueta roja que el cliente ya pone.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const promoParam = (searchParams.get('promo') || '').trim() || null;
  // Texto del banner (opcional). Si no viene, usa la palabra del filtro.
  // Ej: ?promo=padre&titulo=Día del Padre  → filtra por "padre", banner "DÍA DEL PADRE".
  const promoTitle = (searchParams.get('titulo') || '').trim() || promoParam || '';

  const { vehicles, isLoading } = useVehiclesStore();
  const { client, isLoading: isClientLoading } = useClientStore();
  const cardTitleField = client?.card_title_field ?? 'model';
  const {
    initializeStore,
    colors,
    fuelTypes,
    conditions,
    categories: categoriesFromStore,
    isLoading: isGeneralStoreLoading,
  } = useGeneralStore();

  const {
    filters,
    setFilters,
    priceRange,
    setPriceRange,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    clearFilters,
  } = useVehicleFiltersStore();

  // cargar catálogos
  useEffect(() => { initializeStore(); }, [initializeStore]);

  // catálogos dedup
  const brands = useMemo(
    () => Array.from(new Map(vehicles.filter(v => v.brand).map(v => [v.brand!.id, v.brand!])).values()),
    [vehicles]
  );
  const models = useMemo(
    () => Array.from(new Map(vehicles.filter(v => v.model).map(v => [v.model!.id, v.model!])).values()),
    [vehicles]
  );
  const categories = useMemo(() => {
    if (categoriesFromStore?.length) return categoriesFromStore;
    return Array.from(new Map(vehicles.filter(v => v.category).map(v => [v.category!.id, v.category!])).values());
  }, [categoriesFromStore, vehicles]);

  // max price (solo disponibles)
  const maxPrice = useMemo(() => {
    const list = vehicles.filter(isAvailable).map(v => v.price || 0);
    return Math.max(0, ...list, 0);
  }, [vehicles]);

  // rango inicial una sola vez
  useEffect(() => {
    if (maxPrice > 0 && priceRange[0] === 0 && priceRange[1] === 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, priceRange, setPriceRange]);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, priceRange, searchQuery, sortOrder, promoParam]);

  // Contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.values(filters).forEach((v) => {
      if (Array.isArray(v)) count += v.length;
      else if (v) count += 1;
    });
    if (priceRange[0] > 0 || (maxPrice > 0 && priceRange[1] < maxPrice)) count += 1;
    if (searchQuery.trim()) count += 1;
    if (sortOrder !== 'date_desc') count += 1;
    return count;
  }, [filters, priceRange, maxPrice, searchQuery, sortOrder]);

  // Etiquetas con fallback (sin claves crudas)
  const sortOptions = [
    { key: 'date_desc',    label: tx('vehicles.sorting.dateDesc',    'Destacados'),       icon: 'mdi:star-outline' },
    { key: 'price_asc',    label: tx('vehicles.sorting.priceAsc',    'Precio ↑'),         icon: 'mdi:sort-ascending' },
    { key: 'price_desc',   label: tx('vehicles.sorting.priceDesc',   'Precio ↓'),         icon: 'mdi:sort-descending' },
    { key: 'year_desc',    label: tx('vehicles.sorting.yearDesc',    'Año ↓'),            icon: 'mdi:calendar' },
    { key: 'year_asc',     label: tx('vehicles.sorting.yearAsc',     'Año ↑'),            icon: 'mdi:calendar-outline' },
    { key: 'mileage_asc',  label: tx('vehicles.sorting.mileageAsc',  'Kilometraje ↑'),   icon: 'mdi:speedometer-slow' },
    { key: 'mileage_desc', label: tx('vehicles.sorting.mileageDesc', 'Kilometraje ↓'),   icon: 'mdi:speedometer' },
  ] as const;

  const titleText = tx('pages.vehicles.title', 'Vehículos');
  const foundText = tx('pages.vehicles.found', 'encontrados');
  const orderByText = tx('pages.vehicles.orderBy', 'Ordenar');
  const searchPlaceholder = tx('pages.vehicles.searchPlaceholder', 'Buscar por marca, modelo, categoría o año…');
  const noResultsText = tx('pages.vehicles.noResults', 'Sin resultados con los filtros actuales');
  const filtersTitle = tx('vehicles.filters.title', 'Filtros');
  const clearFiltersText = tx('vehicles.filters.clearFilters', 'Limpiar filtros');

  const availableYears = useMemo(
    () =>
      [...new Set(vehicles.map((v) => v.year).filter(Boolean))]
        .map(String)
        .sort((a, b) => b.localeCompare(a)),
    [vehicles]
  );

  // búsqueda con defer
  const deferredSearch = useDeferredValue(searchQuery);
  const terms = deferredSearch.trim()
    ? deferredSearch.trim().toLowerCase().split(' ').filter(Boolean)
    : [];

  // filtrar + buscar (usa data, no i18n)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      // Filtro de promo: solo autos cuya etiqueta contenga el texto (ej. "cyber").
      if (promoParam) {
        const lbl = (vehicle.label || '').toLowerCase();
        if (!lbl.includes(promoParam.toLowerCase())) return false;
      }

      if (terms.length) {
        const brand = vehicle.brand?.name?.toLowerCase() || '';
        const model = vehicle.model?.name?.toLowerCase() || '';
        const category = vehicle.category?.name?.toLowerCase() || '';
        const year = vehicle.year ? String(vehicle.year) : '';
        const text = [brand, model, category, year].join(' ');
        if (!terms.every((t) => text.includes(t))) return false;
      }

      if (!valueMatches(filters.brand as any, vehicle?.brand?.id)) return false;
      if (!valueMatches(filters.model as any, vehicle?.model?.id)) return false;
      if (!valueMatches(filters.category as any, vehicle?.category?.id)) return false;
      if (!valueMatches(filters.fuel_type as any, vehicle?.fuel_type?.id)) return false;
      if (!valueMatches(filters.condition as any, vehicle?.condition?.id)) return false;
      if (!valueMatches(filters.color as any, vehicle?.color?.id)) return false;

      const yf = filters.year as any;
      if (yf) {
        const y = vehicle?.year?.toString() ?? '';
        if (Array.isArray(yf) ? !yf.includes(y) : y !== yf) return false;
      }

      if (typeof vehicle?.price === 'number') {
        if (vehicle.price < priceRange[0] || vehicle.price > priceRange[1]) return false;
      }

      return true;
    });
  }, [vehicles, filters, priceRange, terms, promoParam]);

  const isPageLoading = isClientLoading || isLoading || isGeneralStoreLoading;

  // ordenamiento
  const sortVehicles = useCallback((list: Vehicle[]) => {
    const stateScore = (v: Vehicle) =>
      v.status?.name === 'Vendido' ? 2 : v.status?.name === 'Reservado' ? 1 : 0;
    return [...list].sort((a, b) => {
      const s = stateScore(a) - stateScore(b);
      if (s !== 0) return s;
      switch (sortOrder) {
        case 'date_desc':
          return +new Date(b.created_at || 0) - +new Date(a.created_at || 0);
        case 'date_asc':
          return +new Date(a.created_at || 0) - +new Date(b.created_at || 0);
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'year_desc':
          return (b.year || 0) - (a.year || 0);
        case 'year_asc':
          return (a.year || 0) - (b.year || 0);
        case 'mileage_asc':
          return (a.mileage || 0) - (b.mileage || 0);
        case 'mileage_desc':
          return (b.mileage || 0) - (a.mileage || 0);
        default:
          return 0;
      }
    });
  }, [sortOrder]);

  // chips aplicados (labels desde DATA)
  const labelOf = (list: { id: string | number; name?: string }[], id: string) =>
    list.find(i => String(i.id) === String(id))?.name || id;

  const removeOne = (key: keyof typeof filters, id: string) => {
    const current = asArray(filters[key]);
    const next = current.filter((x) => x !== id);
    const nf = { ...filters } as any;
    if (next.length) nf[key] = next; else delete nf[key];
    setFilters(nf);
  };

  // Limpia los filtros del store Y saca ?promo=/?titulo= de la URL, para que
  // "Limpiar filtros" siempre devuelva a la lista completa (no quede atascado
  // en una campaña sin resultados). Se usa en todos los botones de limpiar.
  const clearAllFilters = useCallback(() => {
    clearFilters(maxPrice);
    if (typeof window !== 'undefined' && window.location.search) {
      router.replace(pathname);
    }
  }, [clearFilters, maxPrice, router, pathname]);

  // Estilo CTA (backend → CSS var). No rompe SSR.
  const CTA_STYLE: React.CSSProperties = {
    backgroundColor: 'var(--brand-color)',
    borderColor: 'var(--brand-color)',
    color: 'var(--on-brand-color, #fff)',
  };

  const LoadingState = () => (
    <div className="w-full">
      <div className="mb-4 ">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="w-40 rounded-lg dark:bg-dark-card">
              <div className="h-7 w-40 rounded-lg bg-default-300 dark:bg-dark-border" />
            </Skeleton>
            <Skeleton className="w-56 rounded-lg dark:bg-dark-card">
              <div className="h-4 w-56 rounded-lg bg-default-200 dark:bg-dark-border" />
            </Skeleton>
          </div>
          {!isMd && (
            <Skeleton className="w-24 rounded-lg dark:bg-dark-card">
              <div className="h-9 w-24 rounded-lg bg-default-300 dark:bg-dark-border" />
            </Skeleton>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <ClientOnly>
      {/* Botones flotantes - Solo móvil, siempre visibles */}
      <div className='md:hidden fixed bottom-6 left-6 z-[99999] flex items-center gap-2'>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className='flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#0B0B0F] rounded-full border border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-200'
        >
          <Icon icon='solar:filter-linear' className='text-lg text-primary' />
          <span className='text-sm font-medium text-gray-700 dark:text-white'>{filtersTitle}</span>
          {activeFiltersCount > 0 && (
            <span className='w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-medium'>
              {activeFiltersCount}
            </span>
          )}
        </button>

        <Dropdown placement='top'>
          <DropdownTrigger>
            <button
              className='flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#0B0B0F] rounded-full border border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-200'
            >
              <Icon icon='mdi:sort' className='text-lg text-primary' />
              <span className='text-sm font-medium text-gray-700 dark:text-white'>{orderByText}</span>
            </button>
          </DropdownTrigger>
          <DropdownMenu
            selectionMode='single'
            selectedKeys={new Set([sortOrder])}
            onSelectionChange={(keys) => {
              const k = Array.from(keys)[0];
              if (k) setSortOrder(String(k));
            }}
          >
            {sortOptions.map((option) => (
              <DropdownItem key={option.key} startContent={<Icon icon={option.icon} className='text-sm' />}>
                {option.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="min-h-screen bg-slate-50/50 dark:bg-black">
        <main className="grid grid-cols-1 md:grid-cols-4">
          {/* Sidebar (desktop) - STICKY y CENTRADO */}
          {isMd && (
            <aside className="col-span-1 mt-20 w-[272px] mx-auto justify-self-center">
              <div className="md:sticky md:top-[5rem]">
                <div className="rounded-2xl shadow-sm border border-slate-200/60 dark:border-neutral-800 backdrop-blur">
                  <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-neutral-700">
                    <NewVehicleFilters
                      brands={brands as any[]}
                      models={models as any[]}
                      categories={categories as any[]}
                      fuelTypes={fuelTypes as any[]}
                      conditions={conditions as any[]}
                      colors={colors as any[]}
                      availableYears={availableYears}
                      maxPrice={maxPrice}
                      ctaColor="var(--brand-color)"
                      onClearFilters={clearAllFilters}
                    />
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Modal (mobile) */}
          {!isMd && (
            <ModalSlideFilter
              isOpen={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
            >
              <NewVehicleFilters
                brands={brands as any[]}
                models={models as any[]}
                categories={categories as any[]}
                fuelTypes={fuelTypes as any[]}
                conditions={conditions as any[]}
                colors={colors as any[]}
                availableYears={availableYears}
                maxPrice={maxPrice}
                ctaColor="var(--brand-color)"
                onClearFilters={clearAllFilters}
              />
            </ModalSlideFilter>
          )}

          {/* Contenido principal */}
          <div className="col-span-1 md:col-span-3 flex-1 transition-all duration-300 md:ml-4 md:mr-4 mx-1">
            <div className="px-4 sm:px-6 pt-20">
              {isPageLoading ? (
                <LoadingState />
              ) : (
                <>
                  {/* Banner de campaña (solo con ?promo=...) */}
                  {promoParam && (
                    <div
                      className="relative mb-6 overflow-hidden rounded-3xl border border-fuchsia-500/30"
                      style={{ background: 'linear-gradient(110deg,#070713 0%,#1a0b2e 45%,#2d0b4e 100%)' }}
                    >
                      {/* glow decorativo */}
                      <div
                        className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full opacity-40 blur-3xl"
                        style={{ background: 'radial-gradient(circle,#d946ef,transparent 70%)' }}
                      />
                      <div
                        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full opacity-40 blur-3xl"
                        style={{ background: 'radial-gradient(circle,#22d3ee,transparent 70%)' }}
                      />
                      <div className="relative px-6 py-7 sm:px-10 sm:py-9 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-fuchsia-300">
                            <Icon icon="mdi:flash" className="text-base" />
                            Tiempo limitado
                          </span>
                          <h2 className="mt-1.5 text-3xl sm:text-5xl font-black tracking-tight text-white">
                            OFERTAS{' '}
                            <span
                              className="text-transparent bg-clip-text"
                              style={{ backgroundImage: 'linear-gradient(90deg,#22d3ee,#d946ef)' }}
                            >
                              {promoTitle.toUpperCase()}
                            </span>
                          </h2>
                          <p className="mt-1.5 text-sm text-white/70">
                            {filteredVehicles.length} {filteredVehicles.length === 1 ? 'auto en promoción' : 'autos en promoción'}
                          </p>
                        </div>
                        <Icon icon="mdi:tag-multiple" className="hidden sm:block text-7xl text-white/10 shrink-0" />
                      </div>
                    </div>
                  )}

                  <div className="mb-4 sm:mb-6">
                    <div className="flex-1 flex flex-col max-w-full">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            {titleText}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredVehicles.length} {foundText}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                variant="light"
                                startContent={<Icon icon="mdi:sort" className="text-base" />}
                                className="hidden sm:flex items-center gap-x-1 px-3 min-h-[40px] text-sm bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 rounded-2xl border border-slate-200/60 dark:border-neutral-800"
                              >
                                {sortOptions.find((o) => o.key === sortOrder)?.label || orderByText}
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              selectionMode="single"
                              selectedKeys={new Set([sortOrder])}
                              onSelectionChange={(keys) => {
                                const k = Array.from(keys)[0];
                                if (k) setSortOrder(String(k));
                              }}
                            >
                              {sortOptions.map((option) => (
                                <DropdownItem key={option.key} startContent={<Icon icon={option.icon} className="text-sm" />}>
                                  {option.label}
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </Dropdown>

                          {/* Filtros (mobile) */}
                          <Button
                            onPress={() => setIsFilterModalOpen(true)}
                            className="md:hidden h-9 px-3 text-sm"
                            variant="solid"
                            startContent={<Icon icon="solar:filter-linear" width={18} className="dark:text-white" />}
                            aria-label="Abrir filtros"
                            color="primary"
                            style={CTA_STYLE}
                          >
                            {filtersTitle}
                          </Button>
                        </div>
                      </div>

                      {/* Chips de filtros aplicados */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {(Object.keys(filters) as (keyof typeof filters)[]).flatMap((k) =>
                          asArray(filters[k]).map((id) => {
                            const label =
                              k === 'brand' ? labelOf(brands as any[], String(id)) :
                              k === 'model' ? labelOf(models as any[], String(id)) :
                              k === 'category' ? labelOf(categories as any[], String(id)) :
                              k === 'fuel_type' ? labelOf(fuelTypes as any[], String(id)) :
                              k === 'condition' ? labelOf(conditions as any[], String(id)) :
                              k === 'color' ? labelOf(colors as any[], String(id)) :
                              k === 'year' ? String(id) : String(id);

                            return (
                              <Chip
                                key={`${String(k)}-${id}`}
                                variant="flat"
                                color="primary"
                                onClose={() => removeOne(k, String(id))}
                                className="h-7"
                              >
                                {label}
                              </Chip>
                            );
                          })
                        )}

                        {(priceRange[0] > 0 || (maxPrice > 0 && priceRange[1] < maxPrice)) && (
                          <Chip
                            variant="flat"
                            color="primary"
                            onClose={() => setPriceRange([0, maxPrice])}
                            className="h-7"
                          >
                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(priceRange[0])}
                            {' — '}
                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(priceRange[1])}
                          </Chip>
                        )}

                        {searchQuery.trim() && (
                          <Chip variant="flat" color="primary" onClose={() => setSearchQuery('')} className="h-7">
                            {searchQuery}
                          </Chip>
                        )}

                        {sortOrder !== 'date_desc' && (
                          <Chip variant="flat" color="primary" onClose={() => setSortOrder('date_desc')} className="h-7">
                            {orderByText}
                          </Chip>
                        )}

                        <Button
                          size="sm"
                          variant="light"
                          className="h-7"
                          onPress={clearAllFilters}
                          startContent={<Icon icon="mdi:filter-remove-outline" className="text-base" />}
                        >
                          {clearFiltersText}
                        </Button>
                      </div>

                      {/* Search + Sort (mobile) */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                        <div className="w-full sm:flex-[3] relative mt-1">
                          <Icon
                            icon="mdi:magnify"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                            width={20}
                          />
                          <Input
                            id="vehicles-search"
                            type="text"
                            placeholder={searchPlaceholder}
                            className="pl-11 pr-3 py-2 min-h-[42px] rounded-2xl border border-slate-200/60 dark:border-neutral-800 bg-white/80 dark:bg-[#121219] text-sm text-gray-800 dark:text-gray-200 shadow-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/40 transition-all w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Grid */}
                  {filteredVehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-300 dark:border-neutral-800 rounded-3xl bg-white/50 dark:bg-white/[0.03]">
                      <Icon icon="mdi:car-off" className="text-5xl text-gray-400 mb-3" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        {noResultsText}
                      </p>
                      <Button
                        className="mt-4"
                        variant="light"
                        onPress={clearAllFilters}
                        startContent={<Icon icon="mdi:filter-remove-outline" />}
                      >
                        {clearFiltersText}
                      </Button>
                    </div>
                  ) : (() => {
                    const sorted = sortVehicles(filteredVehicles);
                    const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
                    const paginatedVehicles = sorted.slice(0, currentPage * ITEMS_PER_PAGE);
                    return (
                      <>
                        <div className="grid gap-4 sm:gap-6 pb-4 mt-2 sm:mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                          {paginatedVehicles.map((vehicle) => (
                            <VehicleVerticalCard key={vehicle.id} vehicle={vehicle} cardTitleField={cardTitleField} />
                          ))}
                        </div>
                        {currentPage < totalPages && (
                          <div className="flex justify-center pb-12 pt-2">
                            <Button
                              variant="bordered"
                              className="px-8 rounded-2xl border-slate-200 dark:border-neutral-700"
                              onPress={() => setCurrentPage((p) => p + 1)}
                              startContent={<Icon icon="mdi:chevron-down" className="text-lg" />}
                            >
                              {tx('pages.vehicles.loadMore', 'Ver más vehículos')} ({paginatedVehicles.length}/{sorted.length})
                            </Button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </ClientOnly>
  );
};

const VehiclesPage: React.FC = () => (
  <Suspense fallback={null}>
    <VehiclesPageInner />
  </Suspense>
);

export default VehiclesPage;
