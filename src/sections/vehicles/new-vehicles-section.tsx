'use client';

// Vehículos vendidos y reservados se muestran solo por 3 días desde la fecha de venta/reserva
// Sold and reserved vehicles are shown only for 3 days from the sale/reservation date

import { useState, useEffect, useMemo, useRef } from 'react';

import {
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ScrollShadow,
} from '@heroui/react';
import {
  Drawer as VaulDrawer,
  DrawerContent as VaulDrawerContent,
  DrawerHeader as VaulDrawerHeader,
  DrawerTitle as VaulDrawerTitle,
} from '@/components/ui/drawer';

import { Icon } from '@iconify/react';
import NewVehicleFilters from './new-vehicle-filters';
import useVehiclesStore from '@/store/useVehiclesStore';
import { Vehicle } from '@/utils/types';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import VehicleHorizontalCard from '@/components/vehicles/VehicleHorizontalCard';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import useMediaQuery from '@/hooks/useMediaQuery';
import useThemeStore from '@/store/useThemeStore';
import Link from 'next/link';
import useClientStore from '@/store/useClientStore';
import { buildWhatsAppUrl } from '@/utils/contact-utils';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useVehicleFiltersStore from '@/store/useVehicleFiltersStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';

// ============================================
// MOTOR DE BÚSQUEDA INTELIGENTE v6.0 - IA + LOCAL
// ============================================
// - Usa IA (GPT) para parsear búsquedas en lenguaje natural
// - Fallback local para búsqueda básica de texto
// - Cache inteligente para reducir llamadas API
// ============================================

import { parseSearchQuery } from '@/lib/ai-search';

// Normalizar texto (quitar acentos, minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Interfaz para filtros parseados por IA
interface AIFilters {
  brand?: string;
  model?: string;
  category?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  features?: string[];
  searchTerms?: string[];
}

// ============================================
// BÚSQUEDA LOCAL SIMPLIFICADA (Fallback)
// ============================================

// Aplicar filtros de IA a vehículos
const applyAIFilters = (vehicles: Vehicle[], filters: AIFilters): Vehicle[] => {
  return vehicles.filter(vehicle => {
    // Filtro de marca
    if (filters.brand) {
      const vehicleBrand = normalizeText(vehicle.brand?.name || '');
      const filterBrand = normalizeText(filters.brand);
      if (!vehicleBrand.includes(filterBrand) && !filterBrand.includes(vehicleBrand)) {
        return false;
      }
    }

    // Filtro de modelo
    if (filters.model) {
      const vehicleModel = normalizeText(vehicle.model?.name || '');
      const filterModel = normalizeText(filters.model);
      if (!vehicleModel.includes(filterModel)) {
        return false;
      }
    }

    // Filtro de categoría
    if (filters.category) {
      const vehicleCategory = normalizeText(vehicle.category?.name || '');
      const filterCategory = normalizeText(filters.category);
      if (!vehicleCategory.includes(filterCategory) && !filterCategory.includes(vehicleCategory)) {
        return false;
      }
    }

    // Filtros de año
    if (filters.yearMin && (vehicle.year || 0) < filters.yearMin) return false;
    if (filters.yearMax && (vehicle.year || 0) > filters.yearMax) return false;

    // Filtros de precio
    if (filters.priceMin && (vehicle.price || 0) < filters.priceMin) return false;
    if (filters.priceMax && (vehicle.price || 0) > filters.priceMax) return false;

    // Filtros de kilometraje
    if (filters.mileageMin && (vehicle.mileage || 0) < filters.mileageMin) return false;
    if (filters.mileageMax && (vehicle.mileage || 0) > filters.mileageMax) return false;

    // Filtro de transmisión
    if (filters.transmission) {
      const vehicleTransmission = normalizeText(vehicle.transmission || '');
      const filterTransmission = normalizeText(filters.transmission);
      if (!vehicleTransmission.includes(filterTransmission)) {
        return false;
      }
    }

    // Filtro de combustible
    if (filters.fuelType) {
      const vehicleFuel = normalizeText(vehicle.fuel_type?.name || '');
      const filterFuel = normalizeText(filters.fuelType);
      if (!vehicleFuel.includes(filterFuel) && !filterFuel.includes(vehicleFuel)) {
        return false;
      }
    }

    // Filtro de color
    if (filters.color) {
      const vehicleColor = normalizeText(vehicle.color?.name || '');
      const filterColor = normalizeText(filters.color);
      if (!vehicleColor.includes(filterColor)) {
        return false;
      }
    }

    return true;
  });
};

// Búsqueda de texto simple para términos restantes
const textSearch = (vehicles: Vehicle[], searchTerms: string[]): Vehicle[] => {
  if (!searchTerms || searchTerms.length === 0) return vehicles;

  return vehicles.filter(vehicle => {
    const searchableText = normalizeText([
      vehicle.brand?.name,
      vehicle.model?.name,
      vehicle.category?.name,
      vehicle.color?.name,
      vehicle.fuel_type?.name,
      vehicle.transmission,
      vehicle.title,
      vehicle.description,
      vehicle.year?.toString(),
    ].filter(Boolean).join(' '));

    return searchTerms.every(term =>
      searchableText.includes(normalizeText(term))
    );
  });
};

// Búsqueda local básica (fallback cuando IA no disponible)
const localSearch = (vehicles: Vehicle[], query: string): Vehicle[] => {
  if (!query.trim()) return vehicles;

  const terms = normalizeText(query).split(/\s+/).filter(t => t.length >= 2);
  if (terms.length === 0) return vehicles;

  return vehicles.filter(vehicle => {
    const searchableText = normalizeText([
      vehicle.brand?.name,
      vehicle.model?.name,
      vehicle.category?.name,
      vehicle.color?.name,
      vehicle.fuel_type?.name,
      vehicle.transmission,
      vehicle.title,
      vehicle.year?.toString(),
    ].filter(Boolean).join(' '));

    // Al menos un término debe coincidir
    return terms.some(term => searchableText.includes(term));
  });
};

// Generar autocompletado básico
const generateAutocomplete = (vehicles: Vehicle[], query: string): string[] => {
  if (!query || query.length < 2) return [];

  const normalized = normalizeText(query);
  const suggestions = new Set<string>();

  vehicles.forEach(v => {
    if (v.brand?.name && normalizeText(v.brand.name).includes(normalized)) {
      suggestions.add(v.brand.name);
    }
    if (v.model?.name && normalizeText(v.model.name).includes(normalized)) {
      suggestions.add(`${v.brand?.name || ''} ${v.model.name}`.trim());
    }
  });

  return [...suggestions].slice(0, 5);
};

// ID interno de la pestaña de ofertas (campaña). No es una categoría real.
const OFFER_TAB_ID = '__offers__';

const CATEGORY_ICONS: Record<string, string> = {
  all: 'mdi:car-multiple',
  SUV: 'mdi:car-suv',
  Sedan: 'mdi:car',
  Hatchback: 'mdi:car-hatchback',
  Pickup: 'mdi:truck-pickup',
  Van: 'mdi:van-passenger',
  Coupe: 'mdi:car-sports',
  Wagon: 'mdi:car-estate',
};

interface NewVehiclesSectionProps {
  /** Ocultar título y buscador (para landing page) */
  minimal?: boolean;
  /** Which field to use as card title: 'model' (default), 'brand' or 'brand_model' */
  cardTitleField?: 'model' | 'brand' | 'brand_model';
  /** Filter style: 'buttons' (default, icon+text) or 'images' (photo cards) */
  filterStyle?: 'buttons' | 'images';
  /** Builder color overrides */
  filterBarBgColor?: string;
  filterBarBorderColor?: string;
  filterTextColor?: string;
  filterActiveTextColor?: string;
  accentColor?: string;
  sectionBgColor?: string;
  /** Category image overrides (only for filterStyle='images') */
  categoryImage_all?: string;
  categoryImage_SUV?: string;
  categoryImage_Sedan?: string;
  categoryImage_Hatchback?: string;
  categoryImage_Pickup?: string;
  categoryImage_Van?: string;
  categoryImage_Coupe?: string;
  categoryImage_Wagon?: string;
  /** Badge visibility */
  showBadgeCondition?: boolean;
  showBadgePromo?: boolean;
  showBadgeNew?: boolean;
  showBadgeCustom?: boolean;
  showRibbonSold?: boolean;
  showRibbonReserved?: boolean;
  showBadgeDiscount?: boolean;
  /** Grid columns per breakpoint */
  gridColsSm?: string;
  gridColsMd?: string;
  gridColsLg?: string;
  gridColsXl?: string;
  /** Campaña de ofertas: nombre visible de la pestaña (ej. "Ofertas Cyber") */
  offerTabLabel?: string;
  /** Campaña de ofertas: palabra a buscar dentro de la etiqueta del auto (ej. "cyber").
   *  La pestaña solo aparece si hay autos cuya etiqueta la contenga. */
  offerTabFilter?: string;
  /** Card color overrides from builder */
  cardBgColor?: string;
  cardBorderColor?: string;
  cardTitleColor?: string;
  cardSubtitleColor?: string;
  cardSpecsColor?: string;
  cardPriceColor?: string;
}

const NewVehiclesSection = ({ minimal = false, cardTitleField = 'model', filterStyle = 'buttons', filterBarBgColor, filterBarBorderColor, filterTextColor, filterActiveTextColor, accentColor, sectionBgColor, categoryImage_all, categoryImage_SUV, categoryImage_Sedan, categoryImage_Hatchback, categoryImage_Pickup, categoryImage_Van, categoryImage_Coupe, categoryImage_Wagon, showBadgeCondition = true, showBadgePromo = true, showBadgeNew = true, showBadgeCustom = true, showRibbonSold = true, showRibbonReserved = true, showBadgeDiscount = true, gridColsSm = '2', gridColsMd = '3', gridColsLg = '3', gridColsXl = '4', offerTabLabel, offerTabFilter, cardBgColor, cardBorderColor, cardTitleColor, cardSubtitleColor, cardSpecsColor, cardPriceColor }: NewVehiclesSectionProps) => {
  const { theme } = useThemeStore();
  const { vehicles, isLoading } = useVehiclesStore();
  const { client } = useClientStore();
  const isMd = useMediaQuery('(min-width: 768px)');
  const { t } = useTranslation();

  // Extract unique values for filters
  const brands = useMemo(() => {
    const uniqueBrands = new Map();
    vehicles.forEach((v) => {
      if (v.brand?.id && v.brand?.name) {
        uniqueBrands.set(v.brand.id, v.brand);
      }
    });
    return Array.from(uniqueBrands.values());
  }, [vehicles]);

  const models = useMemo(() => {
    const uniqueModels = new Map();
    vehicles.forEach((v) => {
      if (v.model?.id && v.model?.name) {
        uniqueModels.set(v.model.id, { ...v.model, brand_id: v.brand?.id });
      }
    });
    return Array.from(uniqueModels.values());
  }, [vehicles]);

  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    vehicles.forEach((v) => {
      if (v.category?.id && v.category?.name) {
        uniqueCategories.set(v.category.id, v.category);
      }
    });
    return Array.from(uniqueCategories.values());
  }, [vehicles]);

  const fuelTypes = useMemo(() => {
    const uniqueFuelTypes = new Map();
    vehicles.forEach((v) => {
      if (v.fuel_type?.id && v.fuel_type?.name) {
        uniqueFuelTypes.set(v.fuel_type.id, v.fuel_type);
      }
    });
    return Array.from(uniqueFuelTypes.values());
  }, [vehicles]);

  const conditions = useMemo(() => {
    const uniqueConditions = new Map();
    vehicles.forEach((v) => {
      if (v.condition?.id && v.condition?.name) {
        uniqueConditions.set(v.condition.id, v.condition);
      }
    });
    return Array.from(uniqueConditions.values());
  }, [vehicles]);

  const colors = useMemo(() => {
    const uniqueColors = new Map();
    vehicles.forEach((v) => {
      if (v.color?.id && v.color?.name) {
        uniqueColors.set(v.color.id, v.color);
      }
    });
    return Array.from(uniqueColors.values());
  }, [vehicles]);

  const availableYears = useMemo(() => {
    return [...new Set(vehicles.map((v) => v.year).filter(Boolean))]
      .map(String)
      .sort((a, b) => b.localeCompare(a));
  }, [vehicles]);

  // Calcular el precio máximo real de todos los vehículos disponibles
  const maxPrice = Math.max(
    ...vehicles
      .filter((v) => v.price && v.price > 0) // Only filter by having a valid price
      .map((v) => v.price || 0)
  );

  // Estado de filtros global con Zustand
  const {
    filters,
    priceRange,
    sortOrder,
    searchQuery,
    setPriceRange,
    setSortOrder,
    setSearchQuery,
    clearFilters,
  } = useVehicleFiltersStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
  const [aiFilters, setAiFilters] = useState<AIFilters>({});
  const [isAISearching, setIsAISearching] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);
  const activeView = 'grid'; // Fixed to grid view

  // Llamar a la IA para parsear la búsqueda (con debounce)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setAiFilters({});
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsAISearching(true);
      try {
        const result = await parseSearchQuery(searchQuery, {
          brands: brands.map(b => ({ id: b.id, name: b.name })),
          categories: categories.map(c => ({ id: c.id, name: c.name })),
        });
        setAiFilters(result.filters || {});
      } catch (error) {
        console.warn('AI search error, using local fallback:', error);
        setAiFilters({});
      } finally {
        setIsAISearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, brands, categories]);

  // Generar autocompletado cuando cambia el query
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const suggestions = generateAutocomplete(vehicles, searchQuery);
      setAutocompleteResults(suggestions);
      setShowAutocomplete(suggestions.length > 0);
    } else {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
    }
  }, [searchQuery, vehicles]);

    // Localized categories and sort options
  // Mapeo de IDs de filtro a posibles nombres en la DB (con variantes de acentos/idioma)
  const categoryVariants: Record<string, string[]> = {
    SUV: ['SUV', 'Suv', 'suv', 'Crossover', 'crossover', 'Todoterreno', '4x4'],
    Sedan: ['Sedan', 'Sedán', 'sedan', 'sedán', 'Berlina', 'Automóvil', 'automóvil', 'Clásico', 'clásico'],
    Hatchback: ['Hatchback', 'hatchback', 'Compacto', 'City Car', 'city car'],
    Pickup: ['Pickup', 'pickup', 'Pick-up', 'Camioneta', 'camioneta'],
    Van: ['Van', 'van', 'Minivan', 'minivan', 'Furgoneta', 'Furgón', 'furgón'],
    Coupe: ['Coupe', 'Coupé', 'coupe', 'coupé', 'Deportivo', 'deportivo', 'Convertible', 'convertible'],
    Wagon: ['Wagon', 'wagon', 'Station Wagon', 'station wagon', 'Familiar'],
  };

  // Obtener categorías que tienen vehículos
  const categoriesWithVehicles = useMemo(() => {
    const categorySet = new Set<string>();
    vehicles.forEach(v => {
      if (v.category?.name) {
        categorySet.add(v.category.name);
      }
    });
    return categorySet;
  }, [vehicles]);

  // Verificar si un filtro tiene vehículos (comparando con variantes)
  const categoryHasVehicles = (catId: string): boolean => {
    if (catId === 'all') return true;
    const variants = categoryVariants[catId] || [catId];
    return variants.some(variant => categoriesWithVehicles.has(variant));
  };

  const allCategories = [
    { id: 'all', name: t('vehicles.categories.all'), icon: CATEGORY_ICONS.all, description: t('vehicles.categoryDescriptions.all') },
    { id: 'SUV', name: t('vehicles.categories.suv'), icon: CATEGORY_ICONS.SUV, description: t('vehicles.categoryDescriptions.suv') },
    { id: 'Sedan', name: t('vehicles.categories.sedan'), icon: CATEGORY_ICONS.Sedan, description: t('vehicles.categoryDescriptions.sedan') },
    { id: 'Hatchback', name: t('vehicles.categories.hatchback'), icon: CATEGORY_ICONS.Hatchback, description: t('vehicles.categoryDescriptions.hatchback') },
    { id: 'Pickup', name: t('vehicles.categories.pickup'), icon: CATEGORY_ICONS.Pickup, description: t('vehicles.categoryDescriptions.pickup') },
    { id: 'Van', name: t('vehicles.categories.van'), icon: CATEGORY_ICONS.Van, description: t('vehicles.categoryDescriptions.van') },
    { id: 'Coupe', name: t('vehicles.categories.coupe'), icon: CATEGORY_ICONS.Coupe, description: t('vehicles.categoryDescriptions.coupe') },
    { id: 'Wagon', name: t('vehicles.categories.wagon'), icon: CATEGORY_ICONS.Wagon, description: t('vehicles.categoryDescriptions.wagon') },
  ];

  // Filtrar solo categorías que tienen vehículos (siempre mostrar "all")
  const baseCategories = allCategories.filter(cat => categoryHasVehicles(cat.id));

  // ── Pestaña de OFERTAS (campaña) ──
  // Solo aparece si hay autos cuya etiqueta contiene la palabra configurada.
  // Cuando la campaña termina (se borran las etiquetas), la pestaña desaparece sola.
  const offerKeyword = (offerTabFilter || '').trim().toLowerCase();
  const hasOfferVehicles = useMemo(() => {
    if (!offerKeyword) return false;
    return vehicles.some(v => (v.label || '').toLowerCase().includes(offerKeyword));
  }, [vehicles, offerKeyword]);

  const vehicleCategories = useMemo(() => {
    if (!hasOfferVehicles) return baseCategories;
    const offerTab = {
      id: OFFER_TAB_ID,
      name: (offerTabLabel || '').trim() || 'Ofertas',
      icon: 'mdi:fire',
      description: '',
    };
    return [offerTab, ...baseCategories];
  }, [hasOfferVehicles, baseCategories, offerTabLabel]);

  // Resolver nombre de categoría DB → ID de filtro
  const resolveCategoryId = (dbName: string): string | null => {
    for (const [catId, variants] of Object.entries(categoryVariants)) {
      if (variants.some(v => v.toLowerCase() === dbName.toLowerCase())) return catId;
    }
    return null;
  };

  // Build category → image map for image-style filters
  const categoryImages = useMemo(() => {
    if (filterStyle !== 'images') return {};
    const map: Record<string, string | null> = { all: vehicles.find(v => v.main_image)?.main_image ?? null };
    for (const v of vehicles) {
      const catName = v.category?.name;
      if (catName && v.main_image) {
        // Mapear tanto el nombre exacto de la DB como el ID del filtro
        if (!map[catName]) map[catName] = v.main_image;
        const catId = resolveCategoryId(catName);
        if (catId && !map[catId]) map[catId] = v.main_image;
      }
    }
    // Apply custom overrides
    if (categoryImage_all) map.all = categoryImage_all;
    if (categoryImage_SUV) map.SUV = categoryImage_SUV;
    if (categoryImage_Sedan) map.Sedan = categoryImage_Sedan;
    if (categoryImage_Hatchback) map.Hatchback = categoryImage_Hatchback;
    if (categoryImage_Pickup) map.Pickup = categoryImage_Pickup;
    if (categoryImage_Van) map.Van = categoryImage_Van;
    if (categoryImage_Coupe) map.Coupe = categoryImage_Coupe;
    if (categoryImage_Wagon) map.Wagon = categoryImage_Wagon;
    return map;
  }, [filterStyle, vehicles, categoryImage_all, categoryImage_SUV, categoryImage_Sedan, categoryImage_Hatchback, categoryImage_Pickup, categoryImage_Van, categoryImage_Coupe, categoryImage_Wagon]);

  const sortOptions = [
    { key: 'date_desc',    label: t('vehicles.sorting.dateDesc') || 'Destacados',     icon: 'mdi:star-outline' },
    { key: 'price_asc',    label: t('vehicles.sorting.priceAsc') || 'Precio ↑',       icon: 'mdi:sort-ascending' },
    { key: 'price_desc',   label: t('vehicles.sorting.priceDesc') || 'Precio ↓',      icon: 'mdi:sort-descending' },
    { key: 'year_desc',    label: t('vehicles.sorting.yearDesc') || 'Año ↓',          icon: 'mdi:calendar' },
    { key: 'year_asc',     label: t('vehicles.sorting.yearAsc') || 'Año ↑',           icon: 'mdi:calendar-outline' },
    { key: 'mileage_asc',  label: t('vehicles.sorting.mileageAsc') || 'Kilometraje ↑', icon: 'mdi:speedometer-slow' },
    { key: 'mileage_desc', label: t('vehicles.sorting.mileageDesc') || 'Kilometraje ↓', icon: 'mdi:speedometer' },
  ];

  const clearAllFilters = () => {
    clearFilters(maxPrice);
    setSelectedCategory('all');
  };

  // Filtrado de vehículos usando IA + búsqueda local
  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    // PASO 1: Aplicar filtros de IA (si hay)
    if (Object.keys(aiFilters).length > 0) {
      result = applyAIFilters(result, aiFilters);

      // También aplicar búsqueda de texto para términos adicionales
      if (aiFilters.searchTerms && aiFilters.searchTerms.length > 0) {
        result = textSearch(result, aiFilters.searchTerms);
      }
    } else if (searchQuery.trim()) {
      // Fallback: búsqueda local simple mientras IA carga o si falla
      result = localSearch(result, searchQuery);
    }

    // Helper para verificar si un valor está en un filtro (soporta arrays y strings)
    const matchesFilter = (filterValue: string | string[] | undefined, vehicleValue: string | undefined): boolean => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;
      if (!vehicleValue) return false;
      if (Array.isArray(filterValue)) {
        return filterValue.includes(vehicleValue);
      }
      return filterValue === vehicleValue;
    };

    // PASO 2: Aplicar filtros adicionales
    result = result.filter((vehicle) => {
      let matches = true;

      // Tab de OFERTAS: filtra por etiqueta del auto en vez de categoría.
      if (selectedCategory === OFFER_TAB_ID) {
        if (offerKeyword && !(vehicle.label || '').toLowerCase().includes(offerKeyword)) {
          matches = false;
        }
      } else if (selectedCategory !== 'all') {
        // Category from tabs (usar variantes para matchear nombres con acentos/sinónimos)
        const variants = categoryVariants[selectedCategory] || [selectedCategory];
        const vehicleCatName = vehicle?.category?.name || '';
        if (!variants.some(v => v.toLowerCase() === vehicleCatName.toLowerCase())) {
          matches = false;
        }
      }

      // Filters from sidebar (ahora soportan multi-select)
      if (!matchesFilter(filters.brand, vehicle?.brand?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.model, vehicle?.model?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.category, vehicle?.category?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.fuel_type, vehicle?.fuel_type?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.condition, vehicle?.condition?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.color, vehicle?.color?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.year, vehicle?.year?.toString())) {
        matches = false;
      }

      if (vehicle?.price < priceRange[0] || vehicle?.price > priceRange[1]) {
        matches = false;
      }

      return matches;
    });

    // PASO 3: Ordenar (solo si NO hay búsqueda activa, ya que smartSearch ya ordena por relevancia)
    if (searchQuery.trim() === '') {
      result = [...result].sort((a, b) => {
        switch (sortOrder) {
          case 'date_desc':
            return (
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
            );
          case 'date_asc':
            return (
              new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime()
            );
          case 'price_asc': {
            const priceA = (a.price || 0) * (1 - (a.discount_percentage || 0) / 100);
            const priceB = (b.price || 0) * (1 - (b.discount_percentage || 0) / 100);
            return priceA - priceB;
          }
          case 'price_desc': {
            const priceA = (a.price || 0) * (1 - (a.discount_percentage || 0) / 100);
            const priceB = (b.price || 0) * (1 - (b.discount_percentage || 0) / 100);
            return priceB - priceA;
          }
          case 'year_desc':
            return (b.year || 0) - (a.year || 0);
          case 'year_asc':
            return (a.year || 0) - (b.year || 0);
          case 'mileage_asc':
            return (a.mileage || 0) - (b.mileage || 0);
          case 'mileage_desc':
            return (b.mileage || 0) - (a.mileage || 0);
          default:
            return (
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
            );
        }
      });
    }

    return result;
  }, [vehicles, searchQuery, selectedCategory, filters, priceRange, sortOrder, aiFilters, offerKeyword]);

  // Generar sugerencias cuando no hay resultados
  const noResultsSuggestions = useMemo(() => {
    if (filteredVehicles.length === 0 && searchQuery.trim()) {
      return generateAutocomplete(vehicles, searchQuery);
    }
    return [];
  }, [filteredVehicles.length, searchQuery, vehicles]);

  const activeFiltersCount =
    Object.keys(filters).length +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (sortOrder !== 'date_desc' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const selectedCategoryData = vehicleCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const whatsappUrl = buildWhatsAppUrl(client?.contact);

  // Estado para controlar la visibilidad de los botones flotantes en móvil
  const [showMobileButtons, setShowMobileButtons] = useState(false);

  // Detectar si estamos dentro de la sección de vehículos
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('vehicles-section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const windowHeight = window.innerHeight;

      // Mostrar botones cuando la sección está visible y hemos scrolleado un poco dentro
      const isInSection = sectionTop < windowHeight * 0.7 && sectionBottom > windowHeight * 0.3;

      setShowMobileButtons(isInSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  return (
    <div id='vehicles-section' className='bg-slate-50/50 dark:bg-dark-bg vehicle-grid-wrapper'>
      <style>{`
        .vehicle-grid-wrapper .vehicle-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        @media (min-width: 640px) { .vehicle-grid-wrapper .vehicle-grid { grid-template-columns: repeat(var(--grid-sm), minmax(0, 1fr)); } }
        @media (min-width: 768px) { .vehicle-grid-wrapper .vehicle-grid { grid-template-columns: repeat(var(--grid-md), minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .vehicle-grid-wrapper .vehicle-grid { grid-template-columns: repeat(var(--grid-lg), minmax(0, 1fr)); } }
        @media (min-width: 1280px) { .vehicle-grid-wrapper .vehicle-grid { grid-template-columns: repeat(var(--grid-xl), minmax(0, 1fr)); } }
      `}</style>
      {/* Botón de WhatsApp - Siempre visible, derecha. Solo se muestra si el cliente tiene un número válido configurado. */}
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='fixed bottom-6 right-6 z-[60] p-3 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
        >
          <Icon icon='logos:whatsapp-icon' className='text-xl' />
        </a>
      )}

      {/* Botones flotantes móvil - Solo visibles en sección vehículos, izquierda */}
      <div
        className={`md:hidden fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2 transition-all duration-300 ${
          showMobileButtons
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className='flex items-center gap-2 px-4 py-3 bg-white dark:bg-dark-card rounded-full border border-slate-200 dark:border-dark-border shadow-lg hover:shadow-xl transition-all duration-200'
        >
          <Icon icon='solar:filter-linear' className='text-lg text-primary' />
          <span className='text-sm font-medium text-gray-700 dark:text-white'>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className='w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-medium'>
              {activeFiltersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsSortDrawerOpen(true)}
          className='flex items-center gap-2 px-4 py-3 bg-white dark:bg-dark-card rounded-full border border-slate-200 dark:border-dark-border shadow-lg hover:shadow-xl transition-all duration-200'
        >
          <Icon icon='mdi:sort' className='text-lg text-primary' />
          <span className='text-sm font-medium text-gray-700 dark:text-white'>{t('pages.vehicles.orderBy') || 'Ordenar'}</span>
        </button>
      </div>

      {/* Fixed Categories Navigation */}
      <div
        className={`sticky top-[var(--navbar-height)] z-30 border-b ${!filterBarBgColor ? 'bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border' : ''}`}
        style={filterBarBgColor ? {
          backgroundColor: filterBarBgColor,
          borderColor: filterBarBorderColor || undefined,
        } : undefined}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2'>
          <div className='flex flex-col gap-2'>
            {/* Title and Actions - Oculto en modo minimal */}
            {!minimal && (
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                      {selectedCategoryData?.name || t('vehicles.categories.all')}

                      <Chip size='sm' variant='flat' color='primary'>
                        {filteredVehicles.length}
                      </Chip>
                    </h1>

                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                      {selectedCategoryData?.description || t('home.featuredVehicles.subtitle')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}

            <ScrollShadow orientation='horizontal' className='w-full'>
              <div className='flex justify-start lg:justify-center items-center w-full'>
                <div className={`flex ${filterStyle === 'images' ? 'gap-2.5' : 'gap-2'} pt-2 pb-2 min-w-max`}>
                  {vehicleCategories.map((category) => {
                    const isActive = selectedCategory === category.id;
                    const isOfferTab = category.id === OFFER_TAB_ID;
                    const hasBuilderColors = filterTextColor || filterActiveTextColor || accentColor;

                    {/* Image style filter */}
                    if (filterStyle === 'images') {
                      const img = categoryImages[category.id];
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`relative flex flex-col items-center gap-1 transition-all duration-200 hover:-translate-y-0.5 group ${
                            isActive ? 'scale-[1.02]' : ''
                          }`}
                        >
                          <div
                            className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden transition-all duration-200 ${
                              isActive
                                ? 'ring-2 shadow-md'
                                : 'ring-1 group-hover:ring-2 group-hover:shadow-sm'
                            }`}
                            style={{
                              '--tw-ring-color': isActive ? (accentColor || 'var(--color-primary)') : (filterBarBorderColor || 'var(--color-default-300)'),
                            } as React.CSSProperties}
                          >
                            {img ? (
                              <div
                                className='absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105'
                                style={{ backgroundImage: `url(${img})` }}
                              />
                            ) : (
                              <div className='absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700'>
                                <Icon icon={category.icon} className='text-2xl text-gray-500 dark:text-gray-400' />
                              </div>
                            )}
                            <div className={`absolute inset-0 transition-opacity duration-200 ${
                              isActive ? 'bg-black/30' : 'bg-black/10 group-hover:bg-black/20'
                            }`} />
                            {isActive && (
                              <div className='absolute bottom-0 left-0 right-0 h-[3px]' style={{ backgroundColor: accentColor || 'var(--color-primary)' }} />
                            )}
                          </div>
                          <span
                            className={`text-[11px] sm:text-xs font-medium transition-colors duration-200 ${
                              isActive || isOfferTab ? 'font-semibold' : ''
                            }`}
                            style={{
                              color: isOfferTab
                                ? '#dc2626'
                                : isActive
                                  ? (accentColor || undefined)
                                  : (filterTextColor || undefined),
                            }}
                          >
                            {category.name}
                          </span>
                        </button>
                      );
                    }

                    {/* Button style filter (default) */}
                    return (
                      <Button
                        key={category.id}
                        variant={isOfferTab || isActive ? 'solid' : 'light'}
                        color={isOfferTab || hasBuilderColors ? undefined : (isActive ? 'primary' : 'default')}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`whitespace-nowrap hover:-translate-y-0.5 transition-all px-4 py-2 rounded-full ${
                          isActive ? 'shadow-md' : ''
                        } ${isActive && theme === 'dark' && !hasBuilderColors && !isOfferTab ? 'text-black' : ''}`}
                        style={isOfferTab
                          ? { color: '#ffffff', backgroundColor: isActive ? '#b91c1c' : '#dc2626', fontWeight: 600 }
                          : (hasBuilderColors ? {
                              color: isActive ? (filterActiveTextColor || '#ffffff') : (filterTextColor || undefined),
                              backgroundColor: isActive ? (accentColor || undefined) : undefined,
                            } : undefined)}
                        startContent={
                          <Icon icon={category.icon} className='text-xl' />
                        }
                        size='md'
                      >
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </ScrollShadow>
          </div>
        </div>
      </div>

      {/* Search Bar - Oculto en modo minimal */}
      {!minimal && (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-1 sm:mb-2 flex flex-col sm:flex-row gap-2 sm:gap-4'>
          {/* Buscador con Autocompletado */}
          <div className='w-full sm:flex-[3] relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10'
              size={16}
            />
            <Input
              type='text'
              placeholder={t('pages.vehicles.searchPlaceholder')}
              className='
                pl-12 pr-10 py-2 min-h-[36px]
                rounded-xl
                border border-slate-300
                bg-slate-100 dark:bg-dark-card dark:border-dark-border
                text-sm text-gray-700 dark:text-gray-200
                shadow-md
                focus:border-primary focus:ring-2 focus:ring-primary
                transition-all
                w-full
                max-w-xxl
              '
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowAutocomplete(autocompleteResults.length > 0)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            />
            {/* Botón para limpiar búsqueda */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
              >
                <Icon icon='mdi:close-circle' className='text-lg' />
              </button>
            )}

            {/* Dropdown de Autocompletado */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl shadow-lg z-50 overflow-hidden'>
                <div className='py-1'>
                  {autocompleteResults.map((suggestion, index) => (
                    <button
                      key={index}
                      className='w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center gap-3 transition-colors'
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowAutocomplete(false);
                      }}
                    >
                      <Icon icon='mdi:magnify' className='text-gray-400 text-base' />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
                {/* Tip de búsqueda */}
                <div className='px-4 py-2 bg-slate-50 dark:bg-dark-bg border-t border-slate-200 dark:border-dark-border'>
                  <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5'>
                    <Icon icon='mdi:lightbulb-outline' className='text-yellow-500' />
                    Prueba: "bajo 15 millones", "no diesel", "con sunroof"
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Selector de orden */}
          <div className='w-full sm:flex-1 min-w-[80px] flex mt-2 sm:mt-0 -mb-4'>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant='light'
                  startContent={<Icon icon='mdi:sort' className='text-base' />}
                  className='w-full flex items-center gap-x-1 px-3 py-2 min-h-[36px] text-sm shadow-none bg-transparent border-none hover:bg-slate-100 focus:bg-slate-100 transition-colors'
                >
                  {sortOptions.find((option) => option.key === sortOrder)?.label ||
                    t('pages.vehicles.orderBy')}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode='single'
                selectedKeys={new Set([sortOrder])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected) setSortOrder(selected.toString());
                }}
              >
                {sortOptions.map((option) => (
                  <DropdownItem
                    key={option.key}
                    startContent={<Icon icon={option.icon} className='text-xl' />}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      )}

      {/* Main Content */}

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20'>
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Filtro en desktop - sticky y colapsable */}
          {isMd && !isFiltersCollapsed && (
            <aside className='w-72 shrink-0'>
              <div className='sticky top-24'>
                <div className='max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden'>
                  <NewVehicleFilters
                    brands={brands}
                    models={models}
                    categories={categories}
                    fuelTypes={fuelTypes}
                    conditions={conditions}
                    colors={colors}
                    initialOpenAccordion={filters.color ? 'color' : undefined}
                    availableYears={availableYears}
                    maxPrice={maxPrice}
                    isCollapsed={isFiltersCollapsed}
                    onToggleCollapse={() => setIsFiltersCollapsed(true)}
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Botones para expandir filtros y ordenar cuando están colapsados */}
          {isMd && isFiltersCollapsed && (
            <div className='sticky top-24 h-fit shrink-0 flex flex-col items-center gap-2'>
              <button
                onClick={() => setIsFiltersCollapsed(false)}
                className='p-3 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-2'
                aria-label='Mostrar filtros'
              >
                <Icon icon='solar:filter-linear' className='text-xl text-primary' />
                {activeFiltersCount > 0 && (
                  <span className='w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-medium'>
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <Dropdown placement='right'>
                <DropdownTrigger>
                  <button
                    className='p-3 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-2'
                    aria-label='Ordenar'
                  >
                    <Icon icon='mdi:sort' className='text-xl text-primary' />
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
          )}

          {/* Vehicles Content */}

          <div className='flex-1 min-w-0'>
            {/* Vehicle Cards */}

            <div
              className={`vehicle-grid grid gap-4 sm:gap-5 transition-all duration-500 ${
                activeView === 'grid'
                  ? 'grid-cols-1'
                  : 'grid-cols-1'
              } mx-auto`}
              style={activeView === 'grid' ? {
                '--grid-sm': isFiltersCollapsed ? gridColsSm : String(Math.max(1, Number(gridColsSm) - 1)),
                '--grid-md': isFiltersCollapsed ? gridColsMd : String(Math.max(1, Number(gridColsMd) - 1)),
                '--grid-lg': isFiltersCollapsed ? gridColsLg : String(Math.max(1, Number(gridColsLg) - 1)),
                '--grid-xl': isFiltersCollapsed ? gridColsXl : String(Math.max(1, Number(gridColsXl) - 1)),
              } as React.CSSProperties : undefined}
            >
              {isLoading
                ? Array(6)
                    .fill(null)

                    .map((_, index) => <VehicleCardSkeleton key={index} />)
                : filteredVehicles.map((vehicle) =>
                    activeView === 'grid' ? (
                      <VehicleVerticalCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        cardTitleField={cardTitleField}
                        showBadgeCondition={showBadgeCondition}
                        showBadgePromo={showBadgePromo}
                        showBadgeNew={showBadgeNew}
                        showBadgeCustom={showBadgeCustom}
                        showRibbonSold={showRibbonSold}
                        showRibbonReserved={showRibbonReserved}
                        showBadgeDiscount={showBadgeDiscount}
                        cardBgColor={cardBgColor}
                        cardBorderColor={cardBorderColor}
                        cardTitleColor={cardTitleColor}
                        cardSubtitleColor={cardSubtitleColor}
                        cardSpecsColor={cardSpecsColor}
                        cardPriceColor={cardPriceColor}
                      />
                    ) : (
                      <VehicleHorizontalCard
                        key={vehicle.id}
                        vehicle={vehicle}
                      />
                    )
                  )}
            </div>

            {/* No Results State - Mejorado con sugerencias inteligentes */}

            {!isLoading && filteredVehicles.length === 0 && (
              <div className='text-center py-12 max-w-md mx-auto'>
                <div className='w-20 h-20 bg-slate-100 dark:bg-dark-card rounded-full flex items-center justify-center mx-auto mb-6'>
                  <Icon
                    icon='mdi:car-search'
                    className='text-4xl text-gray-400 dark:text-gray-500'
                  />
                </div>

                <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                  {t('vehicles.page.noResults')}
                </h3>

                <p className='text-gray-500 dark:text-gray-400 mb-6'>
                  {searchQuery.trim()
                    ? `No encontramos vehículos para "${searchQuery}"`
                    : t('vehicles.page.noResultsDescription')
                  }
                </p>

                {/* Sugerencias inteligentes */}
                {noResultsSuggestions.length > 0 && (
                  <div className='mb-6'>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
                      ¿Quisiste decir?
                    </p>
                    <div className='flex flex-wrap justify-center gap-2'>
                      {noResultsSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(suggestion)}
                          className='px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors'
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips de búsqueda */}
                <div className='bg-slate-50 dark:bg-dark-card/50 rounded-xl p-4 mb-6 text-left'>
                  <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2'>
                    <Icon icon='mdi:lightbulb-on' className='text-yellow-500' />
                    Tips de búsqueda inteligente
                  </p>
                  <ul className='text-xs text-gray-500 dark:text-gray-400 space-y-2'>
                    <li className='flex items-start gap-2'>
                      <Icon icon='mdi:currency-usd' className='text-green-500 mt-0.5 shrink-0' />
                      <span><strong>"bajo 15 millones"</strong> - Filtra por precio máximo</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <Icon icon='mdi:calendar' className='text-blue-500 mt-0.5 shrink-0' />
                      <span><strong>"2020 o más nuevo"</strong> - Filtra por año mínimo</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <Icon icon='mdi:close-circle' className='text-red-500 mt-0.5 shrink-0' />
                      <span><strong>"no diesel"</strong> - Excluye un tipo de combustible</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <Icon icon='mdi:star' className='text-purple-500 mt-0.5 shrink-0' />
                      <span><strong>"con sunroof"</strong> - Busca por características</span>
                    </li>
                  </ul>
                </div>

                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                  <Button
                    color='primary'
                    variant='solid'
                    onPress={clearAllFilters}
                    startContent={<Icon icon='mdi:refresh' />}
                  >
                    Ver todos los vehículos
                  </Button>
                  <Button
                    color='default'
                    variant='light'
                    onPress={() => setSearchQuery('')}
                    startContent={<Icon icon='mdi:eraser' />}
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer — Vaul (arrastrable) */}
      <VaulDrawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <VaulDrawerContent className='max-h-[90vh]'>
          <VaulDrawerHeader>
            <VaulDrawerTitle>{t('vehicles.filters.title') || 'Filtros'}</VaulDrawerTitle>
          </VaulDrawerHeader>
          <div className='overflow-y-auto px-4 pb-4 flex-1'>
            <NewVehicleFilters
              brands={brands}
              initialOpenAccordion={filters.color ? 'color' : undefined}
              availableYears={availableYears}
              maxPrice={maxPrice}
            />
          </div>
          <div className='border-t border-gray-200 dark:border-dark-border px-4 py-4'>
            <Button color='primary' onPress={() => setIsFilterDrawerOpen(false)} className='w-full'>
              {t('vehicles.filters.applyFilters')}
            </Button>
          </div>
        </VaulDrawerContent>
      </VaulDrawer>

      {/* Mobile Sort Drawer — Vaul (arrastrable) */}
      <VaulDrawer open={isSortDrawerOpen} onOpenChange={setIsSortDrawerOpen}>
        <VaulDrawerContent>
          <VaulDrawerHeader>
            <VaulDrawerTitle>{t('pages.vehicles.orderBy') || 'Ordenar'}</VaulDrawerTitle>
          </VaulDrawerHeader>
          <div className='flex flex-col pb-6'>
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setSortOrder(option.key);
                  setIsSortDrawerOpen(false);
                }}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                  sortOrder === option.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-dark-card'
                }`}
              >
                <Icon icon={option.icon} className='text-lg' />
                <span className='text-sm'>{option.label}</span>
                {sortOrder === option.key && (
                  <Icon icon='mdi:check' className='ml-auto text-primary text-lg' />
                )}
              </button>
            ))}
          </div>
        </VaulDrawerContent>
      </VaulDrawer>
    </div>
  );
};

export default NewVehiclesSection;
