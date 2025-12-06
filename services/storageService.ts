import { Promoter, SaleRecord, SaleStatus, TicketType, Floor, ComplaintRecord } from '../types';

// Mock Initial Data
const INITIAL_PROMOTERS: Promoter[] = [
  { id: 'p1', name: 'Alice Johnson', assignedFloors: ['Ground Floor - Main Entrance'] },
  { id: 'p2', name: 'Bob Smith', assignedFloors: ['1st Floor - Food Court'] },
  { id: 'p3', name: 'Charlie Davis', assignedFloors: ['2nd Floor - Arcade Zone', '3rd Floor - Cinema Lobby'] },
];

const INITIAL_FLOORS: Floor[] = [
  { id: 'f1', name: 'Ground Floor - Main Entrance' },
  { id: 'f2', name: '1st Floor - Food Court' },
  { id: 'f3', name: '2nd Floor - Arcade Zone' },
  { id: 'f4', name: '3rd Floor - Cinema Lobby' },
];

const INITIAL_SALES: SaleRecord[] = [];
const INITIAL_COMPLAINTS: ComplaintRecord[] = [];

const STORAGE_KEYS = {
  PROMOTERS: 'pp_promoters',
  SALES: 'pp_sales',
  LOGO: 'pp_logo_url',
  FLOORS: 'pp_floors',
  COMPLAINTS: 'pp_complaints',
};

export const getPromoters = (): Promoter[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROMOTERS);
  if (data) {
    const parsed = JSON.parse(data);
    // Backward compatibility: ensure assignedFloors exists
    return parsed.map((p: any) => ({
      ...p,
      assignedFloors: Array.isArray(p.assignedFloors) 
        ? p.assignedFloors 
        : (p.assignedFloor ? [p.assignedFloor] : [])
    }));
  }
  return INITIAL_PROMOTERS;
};

export const savePromoters = (promoters: Promoter[]) => {
  localStorage.setItem(STORAGE_KEYS.PROMOTERS, JSON.stringify(promoters));
};

export const getFloors = (): Floor[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FLOORS);
  return data ? JSON.parse(data) : INITIAL_FLOORS;
};

export const saveFloors = (floors: Floor[]) => {
  localStorage.setItem(STORAGE_KEYS.FLOORS, JSON.stringify(floors));
};

export const getSales = (): SaleRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  return data ? JSON.parse(data) : INITIAL_SALES;
};

export const addSale = (sale: SaleRecord) => {
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
};

export const updateSaleStatus = (saleId: string, status: SaleStatus) => {
  const sales = getSales();
  const index = sales.findIndex((s) => s.id === saleId);
  if (index !== -1) {
    sales[index].status = status;
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }
};

// --- Complaints Service ---

export const getComplaints = (): ComplaintRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
  return data ? JSON.parse(data) : INITIAL_COMPLAINTS;
};

export const addComplaint = (complaint: ComplaintRecord) => {
  const complaints = getComplaints();
  complaints.push(complaint);
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
};

export const updateComplaint = (updatedComplaint: ComplaintRecord) => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === updatedComplaint.id);
  if (index !== -1) {
    complaints[index] = updatedComplaint;
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }
};

export const saveComplaints = (complaints: ComplaintRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
};

export const getLogo = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LOGO);
};

export const saveLogo = (url: string) => {
  localStorage.setItem(STORAGE_KEYS.LOGO, url);
};

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);