import { cache } from 'react';
import { supabase } from './supabase';
import { Lead, Vehicle } from '../utils/types';

export const getVehiclesByClientId = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(
        `
        *,
        brand:brand_id(id, name),
        model:model_id(id, name)
      `
      )
      .eq('client_id', clientId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

// Cacheado por request (React cache): generateMetadata, los JSON-LD y el body
// comparten un único fetch del vehículo.
export const getVehicleById = cache(async (vehicleId: string) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(
        `
        *,
        brand:brand_id(id, name),
        model:model_id(id, name),
        fuel_type:fuel_type_id(id, name),
        color:color_id(id, name),
        condition:condition_id(id, name),
        category:category_id(id, name),
        seller_id
      `
      )
      .eq('id', vehicleId)
      .single();
    if (error) throw error;
    return data as unknown as Vehicle;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw error;
  }
});

// Sucursales del tenant, para el schema AutoDealer (NAP + geo + horarios).
export const getDealershipsByClientId = cache(async (clientId: string | number) => {
  try {
    // select('*') es resiliente: no rompe si opening_hours aún no existe
    // (la columna llega con la migración de SEO; antes simplemente no viene).
    const { data, error } = await supabase
      .from('dealerships')
      .select('*')
      .eq('client_id', clientId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching dealerships:', error);
    return [];
  }
});

export const incrementVehicleViews = async (vehicleId: number) => {
  try {
    const { data, error } = await supabase.rpc('increment_vehicle_views', {
      vehicle_id: vehicleId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error incrementing vehicle views:', error);
    throw error;
  }
};

interface ResponseAIQuery {
  search_params: SearchParams;
  original_query: string;
  lead: Lead;
}

interface SearchParams {
  brand?: string;
  model?: string;
  year?: {
    min?: number;
    max?: number;
  };
  price?: {
    min?: number;
    max?: number;
  };
  mileage?: {
    min?: number;
    max?: number;
  };
  transmission?: string;
  fuel_type?: string;
  condition?: string;
  color?: string;
}

export const searchVehicles = async (params: SearchParams) => {
  try {
    console.log('Searching vehicles with params:', params);
    let query = supabase.from('vehicles').select(
      `
        *,
        brand:brand_id(*),
        model:model_id(*)
      `,
      { count: 'exact' }
    );

    // Apply filters based on the search parameters
    if (params.model) {
      console.log('Model:', params.model);
      const { data: modelData } = await supabase
        .from('models')
        .select('id')
        .ilike('name', params.model)
        .maybeSingle();

      if (modelData) {
        query = query.eq('model_id', modelData.id);
      }
    } else if (params.brand) {
      console.log('Brand:', params.brand);
      const { data: brandData } = await supabase
        .from('brands')
        .select('id')
        .ilike('name', params.brand)
        .maybeSingle();

      if (brandData) {
        query = query.eq('brand_id', brandData.id);
      }
    }

    if (params.year?.min) {
      query = query.gte('year', params.year.min);
    }

    if (params.year?.max) {
      query = query.lte('year', params.year.max);
    }

    if (params.price?.min) {
      query = query.gte('price', params.price.min);
    }

    if (params.price?.max) {
      query = query.lte('price', params.price.max);
    }

    if (params.mileage?.min) {
      query = query.gte('mileage', params.mileage.min);
    }

    if (params.mileage?.max) {
      query = query.lte('mileage', params.mileage.max);
    }

    if (params.transmission) {
      query = query.ilike('transmission', params.transmission);
    }

    if (params.fuel_type) {
      query = query.ilike('fuel_type', params.fuel_type);
    }

    if (params.condition) {
      query = query.ilike('condition', params.condition);
    }

    if (params.color) {
      query = query.ilike('color', params.color);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Data:', data);

    return { vehicles: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error searching vehicles:', error);
    return { vehicles: [], count: 0 };
  }
};

export const generateAIQuery = async (
  query: string,
  client_id: string
): Promise<ResponseAIQuery> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get_vehicle_search_query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query, client_id }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to generate search parameters');
  }

  const data = await response.json();
  console.log('Data:', data);
  return data;
};
