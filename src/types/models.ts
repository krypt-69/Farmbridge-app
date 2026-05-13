export type UserRole = 'buyer' | 'farmer' | 'agent' | 'admin';

export interface User {
  id: string;
  firebase_uid: string;
  role: UserRole;
  phone: string;
  full_name: string;
  is_active: boolean;
}

export interface Shipment {
  id: string;
  status: 'matching' | 'locked' | 'verifying' | 'loading' | 'in_transit' | 'arrived_urban' | 'delivered' | 'failed';
  failure_category?: string;
  region: string;
  crop: string;
  target_quantity_bags: number;
  actual_quantity_bags?: number;
  created_at: string;
  locked_at?: string;
  // ... other timestamp fields as needed
}

export interface Order {
  id: string;
  buyer_id: string;
  shipment_id?: string;
  status: 'pending' | 'reserved' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';
  quantity_bags: number;
  price_per_bag: number;
  delivery_location: string;
  crop: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationReport {
  id: string;
  agent_id: string;
  farmer_id: string;
  shipment_id: string;
  operation_id: string;
  status: 'pending' | 'approved' | 'adjusted' | 'rejected';
  claimed_quantity_bags: number;
  actual_quantity_bags?: number;
  quality_notes: string;
  image_urls: string[];
  gps_latitude: number;
  gps_longitude: number;
  client_timestamp: string;
  server_timestamp: string;
}

export interface Wallet {
  available_balance_cents: number;
  locked_balance_cents: number;
  currency: string;
}

export interface LedgerEntry {
  id: string;
  wallet_id: string;
  shipment_id?: string;
  entry_type: 'deposit' | 'reservation' | 'reservation_reversal' | 'payout' | 'refund' | 'platform_fee' | 'transport_fee';
  amount_cents: number;
  description: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}

export interface Farmer {
  id: string;
  full_name: string;
  phone: string;
}
export interface Harvest {
  id: string;
  crop: string;
  quantity_bags: number;
  region: string;
  expected_harvest_date?: string;
  status: string;
  created_at: string;
}