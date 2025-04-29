// src/services/donorService.ts

import { supabase } from "@/lib/supabase";
import { Donor, DonorForm, DonorFilters } from "@/types";

// Fetch all donors with optional filters
export const fetchDonors = async (filters: DonorFilters = {}) => {
  let query = supabase
    .from("donors")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.blood_group) {
    query = query.eq("blood_group", filters.blood_group);
  }
  if (filters.province) {
    query = query.eq("province", filters.province);
  }
  if (filters.district) {
    query = query.eq("district", filters.district);
  }
  if (filters.municipality) {
    query = query.eq("municipality", filters.municipality);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching donors: ${error.message}`);
  }

  return data as Donor[];
};

// Fetch donor by ID
export const fetchDonorById = async (id: string) => {
  const { data, error } = await supabase
    .from("donors")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching donor: ${error.message}`);
  }

  return data as Donor;
};

// Create new donor
export const createDonor = async (donor: DonorForm) => {
  const { data, error } = await supabase
    .from("donors")
    .insert([donor])
    .select();

  if (error) {
    throw new Error(`Error creating donor: ${error.message}`);
  }

  return data?.[0] as Donor;
};

// Update donor
export const updateDonor = async (id: string, donor: Partial<DonorForm>) => {
  const { data, error } = await supabase
    .from("donors")
    .update(donor)
    .eq("id", id)
    .select();

  if (error) {
    throw new Error(`Error updating donor: ${error.message}`);
  }

  return data?.[0] as Donor;
};

// Delete donor
export const deleteDonor = async (id: string) => {
  const { error } = await supabase.from("donors").delete().eq("id", id);

  if (error) {
    throw new Error(`Error deleting donor: ${error.message}`);
  }
};

// Fetch dashboard stats
export const fetchDashboardStats = async (): Promise<{
  totalDonors: number;
  recentDonors: Donor[];
}> => {
  const { count, error: countError } = await supabase
    .from("donors")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Error fetching donor count: ${countError.message}`);
  }

  const { data: recentData, error: recentError } = await supabase
    .from("donors")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentError) {
    throw new Error(`Error fetching recent donors: ${recentError.message}`);
  }

  return {
    totalDonors: count || 0,
    recentDonors: recentData as Donor[],
  };
};

// Fetch total SMS count from sms_logs table
export const fetchTotalSmsSent = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("sms_logs") // assuming sms_logs table exists
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching SMS count:", error);
    return 0;
  }

  return count || 0;
};

// Fetch blood group distribution counts
export const fetchBloodGroupCounts = async (): Promise<
  Record<string, number>
> => {
  const { data, error } = await supabase.from("donors").select("blood_group");

  if (error || !data) {
    console.error("Error fetching blood groups:", error);
    return {};
  }

  const counts: Record<string, number> = {};

  data.forEach((donor) => {
    const group = donor.blood_group;
    if (group) {
      counts[group] = (counts[group] || 0) + 1;
    }
  });

  return counts;
};

// Fetch unique values for select fields
export const getUniqueValues = async (field: keyof DonorForm) => {
  const { data, error } = await supabase
    .from("donors")
    .select(field)
    .order(field, { ascending: true });

  if (error) {
    throw new Error(`Error fetching unique ${field} values: ${error.message}`);
  }

  const uniqueValues = Array.from(
    new Set(data.map((item) => item[field]).filter(Boolean))
  );

  return uniqueValues;
};
