export interface User {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: string;
}
export interface DayHours {
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface Dealership {
  id: string;
  client_id: string;
  address: string;
  phone: string;
  email: string;
  location: Location;
  /** { monday: { open, close } | { closed: true }, ... } — claves de día en inglés */
  opening_hours?: Record<string, DayHours> | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Client {
  id: string;
  name: string;
  domain: string;
  logo: string;
  logo_dark: string;
  favicon: string;
  theme: {
    light: {
      primary: string;
      secondary: string;
    };
    dark: {
      primary: string;
      secondary: string;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    finance_emails?: string[];
    consignments_emails?: string[];
    buy_emails?: string[];
    search_emails?: string[];
  };
  location: {
    lat: number | string;
    lng: number | string;
  };
  dealerships: Dealership[];
  has_dark_mode: boolean;
  has_language_selector?: boolean;
  default_language?: 'es' | 'en' | 'pt';
  client_website_config: ClientWebsiteConfig;
  currency: 'CLP' | 'USD';
  card_title_field?: 'model' | 'brand' | 'brand_model' | null;
}

export interface Vehicle {
  id: string;
  client_id: string;
  seller_id?: string; // ID del vendedor asociado al vehículo
  label?: string; // Campo para etiqueta personalizada
  label_color?: string; // Color CSS para el badge (null = fallback verde)

  // Información básica del vehículo
  brand: Brand;
  brand_id: string;
  model: Model;
  model_id: number;
  year: number;
  price: number;
  discount_percentage?: number; // opcional
  license_plate?: string;
  // Características principales
  mileage: number;
  transmission: 'Manual' | 'Automatic';
  status_id: string;
  status?: ClientVehicleStatus;

  // Multimedia
  main_image: string;
  gallery: string[];
  video_url?: string;

  // Características adicionales
  features: string[];

  // SEO y contenido
  slug: string;
  title: string;
  description: string;

  // Dealership
  dealership_id: string | number;
  dealership: Dealership;

  //
  fuel_type_id: number;
  fuel_type: FuelType;

  condition_id: number;
  condition: Condition;

  category_id: number;
  category: Category;

  color_id: number;
  color: Color;

  // Metadatos
  views: number;
  created_at: string;
  updated_at: string;

  // Extras
  extras: VehicleExtras[];

  // Sales and reservations data for 3-day filter
  vehicles_sales?:
    | Array<{ created_at: string; [key: string]: any }>
    | { created_at: string; [key: string]: any }
    | null;
  vehicles_reservations?:
    | Array<{ created_at: string; [key: string]: any }>
    | { created_at: string; [key: string]: any }
    | null;
  event_date?: string; // Calculated field for sale/reservation date
}

export interface VehicleExtras {
  id: string;
  title?: string;
  vehicle_id: string;
  vehicle: Vehicle;
  description?: string;
  amount?: number;
  type?: 'expense' | 'income' | 'other';
  doc_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string; // ford
  created_at: string;
  name: string; // ford
}

export interface Model {
  id: number; // 1
  created_at: string;
  brand_id: string; // ford
  brand: Brand;
  name: string; // explorer
}

export interface Customer {
  id: string;
  created_at: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  client_id: string;
  rut?: string;
  birth_date?: string;
}

export interface VehicleLike {
  id: string;
  vehicle_id: string;
  vehicle: Vehicle;
  customer_id: string;
  customer: Customer;
  created_at: string;
}

export interface VehicleSale {
  id: string;
  vehicle_id: string;
  vehicle: Vehicle;
  customer_id?: string;
  customer?: Customer;
  sale_date: string;
  sale_price: number;
  payment_method?: string;
}

export interface Mail {
  id: string;
  created_at: string;
  customer_id: string;
  customer: Customer;
  subject: string;
  body: string;
  reason: 'buy' | 'sell' | 'other';
}

export enum LeadTypes {
  // Oportunidades donde la automotora COMPRA
  BUY_DIRECT = 'buy-direct',
  BUY_CONSIGNMENT = 'buy-consignment',

  // Oportunidades donde la automotora VENDE
  SELL_VEHICLE = 'sell-vehicle',
  SELL_FINANCING = 'sell-financing',
  SELL_TRANSFER = 'sell-transfer',

  // Búsqueda de vehículos
  SEARCH_REQUEST = 'search-request',

  // Otros
  CONTACT_GENERAL = 'contact-general',
}

// Tipos auxiliares para los filtros
export type VehicleCategory = Category['name'];
export type VehicleFuelType = FuelType['name'];
export type VehicleTransmission = Vehicle['transmission'];
export type VehicleColor = Color['name'];
export type VehicleCondition = Condition['name'];
export type VehicleStatus = Vehicle['status'];

// Interfaz para filtros
export interface VehicleFilters {
  brand?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: VehicleCategory;
  maxMileage?: number;
  fuel_type?: VehicleFuelType;
  transmission?: VehicleTransmission;
  color?: VehicleColor;
  condition?: VehicleCondition;
}

export interface Lead {
  id: string;
  client_id: string;
  customer_id?: string;
  customer?: Customer;
  type: LeadTypes;
  search_params: {
    brand?: string;
    model?: string;
    year?: {
      min: number;
      max: number;
    };
    price?: {
      min: number;
      max: number;
    };
    mileage?: {
      min: number;
      max: number;
    };
    color?: VehicleColor;
    fuel_type?: VehicleFuelType;
    transmission?: VehicleTransmission;
    condition?: VehicleCondition;
  };
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string; // ID del usuario asignado para seguimiento
  matched_vehicles?: Vehicle[]; // Vehículos que coinciden con la búsqueda
}

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface FuelType {
  id: number;
  name: string;
  created_at: string;
}

export interface Condition {
  id: number;
  name: string;
  created_at: string;
}

export interface Color {
  id: number;
  name: string;
  hex: string;
  created_at: string;
}

export interface ClientVehicleStatus {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
  created_at: string;
  is_disabled: boolean;
  show_in_web?: boolean;
}

export interface ClientWebsiteConfig {
  id: string;
  client_id: string;

  // Sections configuration
  sections: {
    [key: string]: {
      id: string;
      enabled: boolean;
      order: number;
    };
  };

  // Theme configuration
  theme: {
    primary_color: string;
    secondary_color: string;
    typography: string;
  };

  // Content configuration
  content: {
    hero_title: string;
    hero_subtitle: string;
    hero_cta: string;
    why_us_title: string;
    why_us_subtitle: string;
  };
  // Why Us items
  why_us_items: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;

  // Media configuration
  media: {
    background_image_url: string;
    video_url: string;
  };

  // Integrations
  integrations: {
    google_reviews_enabled: boolean;
    pixel_id: string;
    gtm_id: string;
    ga4_id?: string;
    require_cookie_consent?: boolean;
    vambe_client_id?: string;
    vambe_channel_id?: string;
  };

  is_enabled: boolean;
  color_scheme: 'LIGHT' | 'DARK';
  elements_structure?: string; // Columna para el contenido del builder
  created_at: string;
  updated_at: string;
}
