
import { supabase } from '@/lib/supabase';
import { Donor, DonorForm, DonorFilters } from '@/types';

export const fetchDonors = async (filters: DonorFilters = {}) => {
  let query = supabase
    .from('donors')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters if provided
  if (filters.blood_group) {
    query = query.eq('blood_group', filters.blood_group);
  }
  
  if (filters.province) {
    query = query.eq('province', filters.province);
  }
  
  if (filters.district) {
    query = query.eq('district', filters.district);
  }
  
  if (filters.municipality) {
    query = query.eq('municipality', filters.municipality);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching donors: ${error.message}`);
  }
  
  return data as Donor[];
};

export const fetchDonorById = async (id: string) => {
  const { data, error } = await supabase
    .from('donors')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Error fetching donor: ${error.message}`);
  }
  
  return data as Donor;
};

export const createDonor = async (donor: DonorForm) => {
  const { data, error } = await supabase
    .from('donors')
    .insert([donor])
    .select();
  
  if (error) {
    throw new Error(`Error creating donor: ${error.message}`);
  }
  
  return data[0] as Donor;
};

export const updateDonor = async (id: string, donor: Partial<DonorForm>) => {
  const { data, error } = await supabase
    .from('donors')
    .update(donor)
    .eq('id', id)
    .select();
  
  if (error) {
    throw new Error(`Error updating donor: ${error.message}`);
  }
  
  return data[0] as Donor;
};

export const deleteDonor = async (id: string) => {
  const { error } = await supabase
    .from('donors')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Error deleting donor: ${error.message}`);
  }
};

export const fetchDashboardStats = async (): Promise<{ totalDonors: number; recentDonors: Donor[] }> => {
  // Get total count
  const { count, error: countError } = await supabase
    .from('donors')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    throw new Error(`Error fetching donor count: ${countError.message}`);
  }
  
  // Get recent donors
  const { data: recentData, error: recentError } = await supabase
    .from('donors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (recentError) {
    throw new Error(`Error fetching recent donors: ${recentError.message}`);
  }
  
  return {
    totalDonors: count || 0,
    recentDonors: recentData as Donor[],
  };
};

export const getUniqueValues = async (field: keyof DonorForm) => {
  const { data, error } = await supabase
    .from('donors')
    .select(field)
    .order(field, { ascending: true });
  
  if (error) {
    throw new Error(`Error fetching unique ${field} values: ${error.message}`);
  }
  
  // Extract unique values and filter out nulls/empty values
  const uniqueValues = Array.from(new Set(
    data
      .map(item => item[field])
      .filter(value => value)
  ));
  
  return uniqueValues;
};
