import { create } from "zustand";
import { Provider, ProviderProduct, ServiceBooking } from "@/types";
import {
  doc, getDoc, updateDoc, collection,
  getDocs, addDoc, deleteDoc, query, where, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProviderStore {
  provider: Provider | null;
  products: ProviderProduct[];
  bookings: ServiceBooking[];
  loading: boolean;

  fetchProvider: (providerId: string) => Promise<void>;
  fetchByOwner: (ownerId: string) => Promise<void>;
  updateStatus: (providerId: string, status: Provider["status"], note?: string) => Promise<void>;
  updateProfile: (providerId: string, data: Partial<Provider>) => Promise<void>;

  fetchProducts: (providerId: string) => Promise<void>;
  addProduct: (product: Omit<ProviderProduct, "id">) => Promise<string>;
  updateProduct: (productId: string, data: Partial<ProviderProduct>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  fetchBookings: (providerId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: ServiceBooking["status"]) => Promise<void>;
}

export const useProviderStore = create<ProviderStore>((set, get) => ({
  provider: null,
  products: [],
  bookings: [],
  loading: false,

  fetchProvider: async (providerId) => {
    set({ loading: true });
    const snap = await getDoc(doc(db, "providers", providerId));
    if (snap.exists()) set({ provider: { id: snap.id, ...snap.data() } as Provider });
    set({ loading: false });
  },

  fetchByOwner: async (ownerId) => {
    set({ loading: true });
    const snap = await getDocs(query(collection(db, "providers"), where("ownerId", "==", ownerId)));
    if (!snap.empty) set({ provider: { id: snap.docs[0].id, ...snap.docs[0].data() } as Provider });
    set({ loading: false });
  },

  updateStatus: async (providerId, status, note) => {
    await updateDoc(doc(db, "providers", providerId), {
      status,
      statusNote: note || "",
      statusUpdatedAt: new Date(),
    });
    set(s => ({ provider: s.provider ? { ...s.provider, status, statusNote: note } : null }));
  },

  updateProfile: async (providerId, data) => {
    await updateDoc(doc(db, "providers", providerId), { ...data, updatedAt: new Date() });
    set(s => ({ provider: s.provider ? { ...s.provider, ...data } : null }));
  },

  fetchProducts: async (providerId) => {
    const snap = await getDocs(
      query(collection(db, "providerProducts"),
        where("providerId", "==", providerId),
        orderBy("order", "asc"))
    );
    set({ products: snap.docs.map(d => ({ id: d.id, ...d.data() }) as ProviderProduct) });
  },

  addProduct: async (product) => {
    const ref = await addDoc(collection(db, "providerProducts"), {
      ...product, createdAt: new Date(), updatedAt: new Date(),
    });
    set(s => ({ products: [...s.products, { id: ref.id, ...product } as ProviderProduct] }));
    return ref.id;
  },

  updateProduct: async (productId, data) => {
    await updateDoc(doc(db, "providerProducts", productId), { ...data, updatedAt: new Date() });
    set(s => ({ products: s.products.map(p => p.id === productId ? { ...p, ...data } : p) }));
  },

  deleteProduct: async (productId) => {
    await deleteDoc(doc(db, "providerProducts", productId));
    set(s => ({ products: s.products.filter(p => p.id !== productId) }));
  },

  fetchBookings: async (providerId) => {
    const snap = await getDocs(
      query(collection(db, "serviceBookings"),
        where("providerId", "==", providerId),
        orderBy("createdAt", "desc"))
    );
    set({ bookings: snap.docs.map(d => ({ id: d.id, ...d.data() }) as ServiceBooking) });
  },

  updateBookingStatus: async (bookingId, status) => {
    await updateDoc(doc(db, "serviceBookings", bookingId), { status, updatedAt: new Date() });
    set(s => ({ bookings: s.bookings.map(b => b.id === bookingId ? { ...b, status } : b) }));
  },
}));
