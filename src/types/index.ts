export type UserRole = 'participant' | 'admin';
export type EventStatus = 'open' | 'closed' | 'draft';
export type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  is_active: boolean;
  created_at: string;
}

export interface RaceEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  sport_type: string;
  categories: string[];
  capacity: number;
  price: number;
  currency: string;
  status: EventStatus;
  banner_url: string;
  schedule_info: string;
  route_info: string;
  created_at: string;
  registration_count?: number;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  age: number | null;
  gender: string | null;
  category: string;
  tshirt_size: string;
  bib_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_notes: string;
  status: RegistrationStatus;
  created_at: string;
  events?: RaceEvent;
}
