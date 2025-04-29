
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

export interface DashboardStats {
  totalDonors: number;
  recentDonors: Donor[];
  totalSms: number;
}

export interface AuthData {
  email: string;
  password: string;
}
