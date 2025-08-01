// src/services/donationService.ts

import { supabase } from "@/lib/supabase";
import { Donation, DonationWithDonor, DonationForm } from "@/types";

// Fetch all donations with donor information
export const fetchDonationsWithDonors = async (): Promise<DonationWithDonor[]> => {
  const { data, error } = await supabase
    .from("donations")
    .select(`
      *,
      donor:donors(*)
    `)
    .order("donation_date", { ascending: false });

  if (error) {
    throw new Error(`Error fetching donations: ${error.message}`);
  }

  return data as unknown as DonationWithDonor[];
};

// Fetch donations for a specific donor
export const fetchDonationsByDonor = async (donorId: string): Promise<Donation[]> => {
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("donor_id", donorId)
    .order("donation_date", { ascending: false });

  if (error) {
    throw new Error(`Error fetching donor donations: ${error.message}`);
  }

  return data as Donation[];
};

// Create new donation record
export const createDonation = async (donation: DonationForm): Promise<Donation> => {
  const { data, error } = await supabase
    .from("donations")
    .insert([donation])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating donation: ${error.message}`);
  }

  return data as Donation;
};

// Update donation record
export const updateDonation = async (id: string, donation: Partial<DonationForm>): Promise<Donation> => {
  const { data, error } = await supabase
    .from("donations")
    .update({ ...donation, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating donation: ${error.message}`);
  }

  return data as Donation;
};

// Delete donation record
export const deleteDonation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("donations")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error deleting donation: ${error.message}`);
  }
};

// Get donors with their last donation date and eligibility status
export const fetchDonorsWithLastDonation = async () => {
  try {
    // First, try to fetch with donations relationship
    const { data, error } = await supabase
      .from("donors")
      .select(`
        *,
        donations(
          donation_date
        )
      `)
      .order("name", { ascending: true });

    if (error) {
      // If donations table doesn't exist or relationship fails, fall back to just donors
      console.warn("Donations table not found, falling back to donors only:", error.message);
      const { data: donorsOnly, error: donorsError } = await supabase
        .from("donors")
        .select("*")
        .order("name", { ascending: true });

      if (donorsError) {
        throw new Error(`Error fetching donors: ${donorsError.message}`);
      }

      // Return donors with empty donation data
      return donorsOnly.map((donor: any) => ({
        ...donor,
        last_donation_date: null,
        is_eligible: true, // All are eligible if no donations exist
        total_donations: 0
      }));
    }

    // Process data to include last donation date and eligibility
    const processedData = data.map((donor: any) => {
      const donations = donor.donations || [];
      const lastDonationDate = donations.length > 0 
        ? donations.reduce((latest: any, current: any) => 
            new Date(current.donation_date) > new Date(latest.donation_date) ? current : latest
          ).donation_date
        : null;
      
      // Check if donor is eligible (more than 3 months since last donation)
      const isEligible = lastDonationDate 
        ? new Date().getTime() - new Date(lastDonationDate).getTime() > (3 * 30 * 24 * 60 * 60 * 1000)
        : true;

      return {
        ...donor,
        last_donation_date: lastDonationDate,
        is_eligible: isEligible,
        total_donations: donations.length
      };
    });

    return processedData;
  } catch (error) {
    throw new Error(`Error fetching donors with donations: ${error}`);
  }
};

// Get donation statistics
export const fetchDonationStats = async () => {
  const { data, error } = await supabase
    .from("donations")
    .select("donation_date");

  if (error) {
    throw new Error(`Error fetching donation stats: ${error.message}`);
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

  const totalDonations = data.length;
  const recentDonations = data.filter(d => new Date(d.donation_date) >= thirtyDaysAgo).length;
  const donationsLast90Days = data.filter(d => new Date(d.donation_date) >= ninetyDaysAgo).length;

  return {
    totalDonations,
    recentDonations,
    donationsLast90Days
  };
};
