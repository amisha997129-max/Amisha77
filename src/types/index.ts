export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export type Donor = {
  id: string;
  name: string;
  age: number;
  blood_group: BloodGroup;
  phone: string;
  email: string | null;
  last_donation_date: string | null;
  city: string;
  eligible: boolean;
  created_at: string;
};

export type BloodInventory = {
  id: string;
  blood_group: BloodGroup;
  units: number;
  updated_at: string;
};

export type Urgency = 'Critical' | 'Urgent' | 'Normal';
export type RequestStatus = 'Pending' | 'Approved' | 'Fulfilled' | 'Rejected';

export type BloodRequest = {
  id: string;
  patient_name: string;
  blood_group: BloodGroup;
  units_needed: number;
  urgency: Urgency;
  hospital_name: string;
  contact: string;
  status: RequestStatus;
  created_at: string;
};

export type Camp = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string | null;
  registered: number;
  created_at: string;
};

export type Page = 'dashboard' | 'donors' | 'inventory' | 'requests' | 'camps';
