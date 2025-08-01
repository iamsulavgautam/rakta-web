
export interface Donor {
  id: string;
  name: string;
  blood_group: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  created_at: string;
}

export type DonorForm = Omit<Donor, 'id' | 'created_at'>;

export interface DonorFilters {
  blood_group?: string;
  province?: string;
  district?: string;
  municipality?: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  donation_date: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DonationWithDonor extends Donation {
  donor: Donor;
}

export type DonationForm = Omit<Donation, 'id' | 'created_at' | 'updated_at'>;

export interface DashboardStats {
  totalDonors: number;
  recentDonors: Donor[];
  totalSms: number;
}

export interface AuthData {
  email: string;
  password: string;
}
