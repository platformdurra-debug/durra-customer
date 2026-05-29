import { create } from "zustand";
import { Booking } from "@/types";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BookingStore {
  bookings: Booking[]; loading: boolean;
  createBooking: (booking: Omit<Booking, "id">) => Promise<string>;
  fetchBookings: (userId: string) => Promise<void>;
  updateStatus: (bookingId: string, status: Booking["status"]) => Promise<void>;
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [], loading: false,

  createBooking: async (booking) => {
    const ref = await addDoc(collection(db, "bookings"), { ...booking, createdAt: new Date() });
    return ref.id;
  },

  fetchBookings: async (userId) => {
    set({ loading: true });
    const snap = await getDocs(query(collection(db, "bookings"), where("customerId", "==", userId)));
    set({ bookings: snap.docs.map(d => ({ id: d.id, ...d.data() }) as Booking), loading: false });
  },

  updateStatus: async (bookingId, status) => {
    await updateDoc(doc(db, "bookings", bookingId), { status });
    set(state => ({ bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status } : b) }));
  },
}));
