import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  getDoc
} from 'firebase/firestore';
import { Promoter, SaleRecord, SaleStatus, TicketType, Floor, ComplaintRecord, FeedbackRecord } from '../types';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCfV-lQ1sAcE2VATAzIV22tqinnS2KHzc",
  authDomain: "tfw-bp.firebaseapp.com",
  projectId: "tfw-bp",
  storageBucket: "tfw-bp.firebasestorage.app",
  messagingSenderId: "26793218166",
  appId: "1:26793218166:web:fb8c980ca614354cca0f57",
  measurementId: "G-TEJQGN11ML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to snapshot data from collections
const fetchCollection = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => doc.data() as T);
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

// --- Promoters Service ---

export const getPromoters = async (): Promise<Promoter[]> => {
  return await fetchCollection<Promoter>('promoters');
};

export const addPromoter = async (promoter: Promoter) => {
  await setDoc(doc(db, 'promoters', promoter.id), promoter);
};

export const updatePromoter = async (promoter: Promoter) => {
  await setDoc(doc(db, 'promoters', promoter.id), promoter, { merge: true });
};

export const deletePromoter = async (promoterId: string) => {
  await deleteDoc(doc(db, 'promoters', promoterId));
};

// --- Floors Service ---

export const getFloors = async (): Promise<Floor[]> => {
  return await fetchCollection<Floor>('floors');
};

export const addFloor = async (floor: Floor) => {
  await setDoc(doc(db, 'floors', floor.id), floor);
};

export const deleteFloor = async (floorId: string) => {
  await deleteDoc(doc(db, 'floors', floorId));
};

// --- Sales Service ---

export const getSales = async (): Promise<SaleRecord[]> => {
  return await fetchCollection<SaleRecord>('sales');
};

export const addSale = async (sale: SaleRecord) => {
  await setDoc(doc(db, 'sales', sale.id), sale);
};

export const updateSaleStatus = async (saleId: string, status: SaleStatus) => {
  const saleRef = doc(db, 'sales', saleId);
  await updateDoc(saleRef, { status });
};

// --- Complaints Service ---

export const getComplaints = async (): Promise<ComplaintRecord[]> => {
  return await fetchCollection<ComplaintRecord>('complaints');
};

export const addComplaint = async (complaint: ComplaintRecord) => {
  await setDoc(doc(db, 'complaints', complaint.id), complaint);
};

export const updateComplaint = async (complaint: ComplaintRecord) => {
  await setDoc(doc(db, 'complaints', complaint.id), complaint);
};

// --- Feedback Service ---

export const getFeedbacks = async (): Promise<FeedbackRecord[]> => {
  return await fetchCollection<FeedbackRecord>('feedbacks');
};

export const addFeedback = async (feedback: FeedbackRecord) => {
  await setDoc(doc(db, 'feedbacks', feedback.id), feedback);
};

// --- Settings / Logo ---

export const getLogo = async (): Promise<string | null> => {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().logoUrl;
    }
    return null;
  } catch (error) {
    console.error("Error fetching logo:", error);
    return null;
  }
};

export const saveLogo = async (url: string) => {
  await setDoc(doc(db, 'settings', 'global'), { logoUrl: url }, { merge: true });
};

// Helper to generate IDs (Client side generation is fine for Firestore doc IDs)
export const generateId = () => Math.random().toString(36).substr(2, 9);
