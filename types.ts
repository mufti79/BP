
export enum TicketType {
  KIDDO = 'Kiddo',
  EXTREME = 'Extreme',
  INDIVIDUAL = 'Individual',
  ENTRY_ONLY = 'Entry Only',
}

export enum SaleStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  REJECTED = 'Rejected',
}

export interface CustomerData {
  name: string;
  mobile: string;
  email: string;
  location: string;
  age: number;
}

export interface SaleRecord {
  id: string;
  promoterId: string;
  promoterName: string;
  uniqueCode?: string; // Unique identifier for easy verification (Name + Mobile)
  customer: CustomerData;
  items: {
    [key in TicketType]?: number;
  };
  totalAmount: number; // calculated locally for display
  status: SaleStatus;
  timestamp: number;
}

export interface Promoter {
  id: string;
  name: string;
  assignedFloors: string[];
}

export interface Floor {
  id: string;
  name: string;
}

export type UserRole = 'LEAD' | 'PROMOTER' | 'VERIFIER';

// KPI Aggregation Type
export interface KPIStats {
  promoterId: string;
  totalKiddo: number;
  totalExtreme: number;
  totalIndividual: number;
  totalEntry: number;
  totalSalesLeads: number; // Count of records
  totalMailCollect: number; // Count of records with email
  revenue: number;
}
