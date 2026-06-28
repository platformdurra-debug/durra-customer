import { create } from "zustand";
import { User } from "@/types";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const isDev = process.env.NODE_ENV === "development";
const APPS: Record<string, string> = {
  customer:  isDev ? "http://localhost:3000" : "https://durrahonline.com",
  seller:    isDev ? "http://localhost:3001" : "https://seller.durrahonline.com",
  provider:  isDev ? "http://localhost:3002" : "https://provider.durrahonline.com",
  admin:     isDev ? "http://localhost:3003" : "https://admin.durrahonline.com",
  warehouse: isDev ? "http://localhost:3004" : "https://warehouse.durrahonline.com",
};

function setRoleCookie(role: string) {
  if (typeof document !== "undefined") {
    const host = window.location.hostname;
    const domainPart = host.endsWith("durrahonline.com") ? ";domain=.durrahonline.com" : "";
    document.cookie = `durra-role-seller=${role};path=/${domainPart};max-age=604800;samesite=lax`;
  }
}

function clearRoleCookie() {
  if (typeof document !== "undefined") {
    const host = window.location.hostname;
    const domainPart = host.endsWith("durrahonline.com") ? ";domain=.durrahonline.com" : "";
    document.cookie = `durra-role-seller=;path=/${domainPart};max-age=0`;
  }
}

// Module-level unsubscribe — persists across re-renders
let unsubscribe: (() => void) | null = null;

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string; password: string; name: string; phone: string;
    whatsapp?: string; area?: string; instagram?: string; description?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true, // starts true — stays true until onAuthStateChanged fires
  error: null,

  login: async (email, password) => {
    try {
      set({ error: null, loading: true });
      const result = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", result.user.uid));
      const userData = snap.data() as User;
      setRoleCookie(userData.role);
      set({ user: userData, loading: false });
      const target = userData.role === "seller"
        ? `${APPS.seller}/dashboard`
        : (APPS[userData.role] || APPS.customer);
      window.location.replace(target);
    } catch (e: any) {
      const msg =
        e.code === "auth/wrong-password" || e.code === "auth/user-not-found"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : e.code === "auth/too-many-requests"
          ? "محاولات كثيرة — انتظري قليلاً"
          : e.message;
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (data) => {
    try {
      set({ error: null });
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const uid = result.user.uid;
      // حساب معرِضة بحالة "بانتظار الموافقة"
      const newUser: any = {
        uid, email: data.email, displayName: data.name, phone: data.phone,
        whatsapp: data.whatsapp || "", area: data.area || "",
        instagram: data.instagram || "", description: data.description || "",
        role: "seller", status: "pending",
        createdAt: new Date(),
      };
      await setDoc(doc(db, "users", uid), newUser);
      // أنشئ طلب موافقة للأدمن (يظهر ببياناته الكاملة)
      await setDoc(doc(db, "sellerApprovals", uid), {
        uid, email: data.email, name: data.name, phone: data.phone,
        whatsapp: data.whatsapp || "", area: data.area || "",
        instagram: data.instagram || "", description: data.description || "",
        status: "pending", createdAt: serverTimestamp(),
      });
      setRoleCookie("seller");
      set({ user: newUser, loading: false });
      return true;
    } catch (e: any) {
      const msg =
        e.code === "auth/email-already-in-use" ? "هذا البريد مسجّل مسبقاً"
        : e.code === "auth/weak-password" ? "كلمة المرور ضعيفة (6 أحرف على الأقل)"
        : e.message;
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: async () => {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    await signOut(auth);
    clearRoleCookie();
    set({ user: null, loading: false });
    if (typeof window !== "undefined") window.location.href = "/auth";
  },

  init: () => {
    if (unsubscribe) return; // already listening
    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const u = snap.data() as User;
            setRoleCookie(u.role);
            set({ user: u, loading: false });
          } else {
            set({ user: null, loading: false });
          }
        } catch {
          set({ user: null, loading: false });
        }
      } else {
        set({ user: null, loading: false });
        clearRoleCookie();
      }
    });
  },
}));
