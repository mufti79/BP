import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc,
  getDoc,
  Firestore
} from 'firebase/firestore';
import { Promoter, SaleRecord, SaleStatus, Floor, ComplaintRecord, FeedbackRecord } from '../types';

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

// Initialize Firebase with Error Handling
let db: Firestore | null = null;
let isFirebaseAvailable = true; // Circuit breaker flag

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase Initialization Failed. App will run in Offline Mode using LocalStorage.", e);
  isFirebaseAvailable = false;
}

// --- FALLBACK MECHANISM (LocalStorage) ---

const STORAGE_KEYS = {
  PROMOTERS: 'pp_promoters',
  SALES: 'pp_sales',
  FLOORS: 'pp_floors',
  COMPLAINTS: 'pp_complaints',
  FEEDBACKS: 'pp_feedbacks',
  SETTINGS: 'pp_settings',
};

// Initial Mock Data to prevent empty screen on first load in Offline Mode
const INITIAL_PROMOTERS: Promoter[] = [
  { id: 'p1', name: 'Alice Johnson', assignedFloors: ['Ground Floor - Main Entrance'] },
  { id: 'p2', name: 'Bob Smith', assignedFloors: ['1st Floor - Food Court'] },
];
const INITIAL_FLOORS: Floor[] = [
  { id: 'f1', name: 'Ground Floor - Main Entrance' },
  { id: 'f2', name: '1st Floor - Food Court' },
  { id: 'f3', name: '2nd Floor - Arcade Zone' },
];

// Helper to get data from LocalStorage safely
const getLocal = <T>(key: string, defaultData: T[] = []): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch {
    return defaultData;
  }
};

// Helper to save data to LocalStorage safely
const setLocal = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("LocalStorage Write Error:", e);
  }
};

// Timeout duration for Firebase operations (to prevent hanging)
const FIREBASE_TIMEOUT_MS = 2000;

// Circuit Breaker Wrapper
// If Firebase fails with a permission/config error, OR times out, it disables Firebase for the rest of the session
const executeStorageOp = async <T>(
  firebaseOp: () => Promise<T>, 
  fallbackOp: () => T
): Promise<T> => {
  if (!db || !isFirebaseAvailable) {
    return fallbackOp();
  }

  // Create a timeout promise that rejects
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('firebase_timeout')), FIREBASE_TIMEOUT_MS);
  });

  try {
    // Race against the timeout
    return await Promise.race([firebaseOp(), timeoutPromise]);
  } catch (error: any) {
    const msg = (error.message || '').toLowerCase();
    const code = error.code || '';
    
    // Detect fatal configuration errors or timeouts
    if (
      msg === 'firebase_timeout' ||
      code === 'permission-denied' || 
      code === 'unavailable' || 
      code === 'not-found' || 
      msg.includes('api has not been used') ||
      msg.includes('database (default) does not exist') ||
      msg.includes('could not reach cloud firestore backend')
    ) {
      if (isFirebaseAvailable) {
        console.warn(`Firebase unavailable or timed out (${code || msg}). Switching to Offline Mode (LocalStorage) for this session.`);
        isFirebaseAvailable = false;
      }
    } else {
      console.warn("Firebase operation failed, using fallback.", error);
    }
    return fallbackOp();
  }
};

// --- SERVICE METHODS ---

export const getPromoters = async (): Promise<Promoter[]> => {
  return executeStorageOp(
    async () => {
      // @ts-ignore - db check handled in wrapper
      const snap = await getDocs(collection(db!, 'promoters'));
      return snap.docs.map(d => d.data() as Promoter);
    },
    () => getLocal(STORAGE_KEYS.PROMOTERS, INITIAL_PROMOTERS)
  );
};

export const addPromoter = async (item: Promoter) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await setDoc(doc(db!, 'promoters', item.id), item);
    },
    () => {
      const list = getLocal<Promoter>(STORAGE_KEYS.PROMOTERS, INITIAL_PROMOTERS);
      list.push(item);
      setLocal(STORAGE_KEYS.PROMOTERS, list);
    }
  );
};

export const updatePromoter = async (item: Promoter) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await setDoc(doc(db!, 'promoters', item.id), item, { merge: true });
    },
    () => {
      const list = getLocal<Promoter>(STORAGE_KEYS.PROMOTERS, INITIAL_PROMOTERS);
      const idx = list.findIndex(p => p.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
        setLocal(STORAGE_KEYS.PROMOTERS, list);
      }
    }
  );
};

export const deletePromoter = async (id: string) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await deleteDoc(doc(db!, 'promoters', id));
    },
    () => {
      let list = getLocal<Promoter>(STORAGE_KEYS.PROMOTERS, INITIAL_PROMOTERS);
      list = list.filter(p => p.id !== id);
      setLocal(STORAGE_KEYS.PROMOTERS, list);
    }
  );
};

// --- Floors ---

export const getFloors = async (): Promise<Floor[]> => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      const snap = await getDocs(collection(db!, 'floors'));
      return snap.docs.map(d => d.data() as Floor);
    },
    () => getLocal(STORAGE_KEYS.FLOORS, INITIAL_FLOORS)
  );
};

export const addFloor = async (item: Floor) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await setDoc(doc(db!, 'floors', item.id), item);
    },
    () => {
      const list = getLocal<Floor>(STORAGE_KEYS.FLOORS, INITIAL_FLOORS);
      list.push(item);
      setLocal(STORAGE_KEYS.FLOORS, list);
    }
  );
};

export const deleteFloor = async (id: string) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await deleteDoc(doc(db!, 'floors', id));
    },
    () => {
      let list = getLocal<Floor>(STORAGE_KEYS.FLOORS, INITIAL_FLOORS);
      list = list.filter(i => i.id !== id);
      setLocal(STORAGE_KEYS.FLOORS, list);
    }
  );
};

// --- Sales ---

export const getSales = async (): Promise<SaleRecord[]> => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      const snap = await getDocs(collection(db!, 'sales'));
      return snap.docs.map(d => d.data() as SaleRecord);
    },
    () => getLocal(STORAGE_KEYS.SALES, [])
  );
};

export const addSale = async (item: SaleRecord) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await setDoc(doc(db!, 'sales', item.id), item);
    },
    () => {
      const list = getLocal<SaleRecord>(STORAGE_KEYS.SALES, []);
      list.push(item);
      setLocal(STORAGE_KEYS.SALES, list);
    }
  );
};

export const updateSaleStatus = async (id: string, status: SaleStatus) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await updateDoc(doc(db!, 'sales', id), { status });
    },
    () => {
      const list = getLocal<SaleRecord>(STORAGE_KEYS.SALES, []);
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx].status = status;
        setLocal(STORAGE_KEYS.SALES, list);
      }
    }
  );
};

// --- Complaints ---

export const getComplaints = async (): Promise<ComplaintRecord[]> => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      const snap = await getDocs(collection(db!, 'complaints'));
      return snap.docs.map(d => d.data() as ComplaintRecord);
    },
    () => getLocal(STORAGE_KEYS.COMPLAINTS, [])
  );
};

export const addComplaint = async (item: ComplaintRecord) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await setDoc(doc(db!, 'complaints', item.id), item);
    },
    () => {
      const list = getLocal<ComplaintRecord>(STORAGE_KEYS.COMPLAINTS, []);
      list.push(item);
      setLocal(STORAGE_KEYS.COMPLAINTS, list);
    }
  );
};

export const updateComplaint = async (item: ComplaintRecord) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await setDoc(doc(db!, 'complaints', item.id), item);
    },
    () => {
      const list = getLocal<ComplaintRecord>(STORAGE_KEYS.COMPLAINTS, []);
      const idx = list.findIndex(c => c.id === item.id);
      if (idx !== -1) {
        list[idx] = item;
        setLocal(STORAGE_KEYS.COMPLAINTS, list);
      }
    }
  );
};

// --- Feedbacks ---

export const getFeedbacks = async (): Promise<FeedbackRecord[]> => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      const snap = await getDocs(collection(db!, 'feedbacks'));
      return snap.docs.map(d => d.data() as FeedbackRecord);
    },
    () => getLocal(STORAGE_KEYS.FEEDBACKS, [])
  );
};

export const addFeedback = async (item: FeedbackRecord) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await setDoc(doc(db!, 'feedbacks', item.id), item);
    },
    () => {
      const list = getLocal<FeedbackRecord>(STORAGE_KEYS.FEEDBACKS, []);
      list.push(item);
      setLocal(STORAGE_KEYS.FEEDBACKS, list);
    }
  );
};

// --- Settings (Logo) ---

export const getLogo = async (): Promise<string | null> => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      const docSnap = await getDoc(doc(db!, 'settings', 'global'));
      return docSnap.exists() ? docSnap.data().logoUrl : null;
    },
    () => {
      const settings = getLocal<any>(STORAGE_KEYS.SETTINGS, [{}]);
      return settings[0]?.logoUrl || null;
    }
  );
};

export const saveLogo = async (url: string) => {
  return executeStorageOp(
    async () => {
      // @ts-ignore
      await setDoc(doc(db!, 'settings', 'global'), { logoUrl: url }, { merge: true });
    },
    () => {
      setLocal(STORAGE_KEYS.SETTINGS, [{ logoUrl: url }]);
    }
  );
};

export const generateId = () => Math.random().toString(36).substr(2, 9);