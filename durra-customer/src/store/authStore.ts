import { create } from "zustand";
import { User } from "@/types";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const isDev = process.env.NODE_ENV === "development";
const APP_URLS: Record<string, string> = {
  customer:  isDev ? "http://localhost:3000" : (process.env.NEXT_PUBLIC_CUSTOMER_URL  || "https://durrahonline.com"),
  seller:    isDev ? "http://localhost:3001" : (process.env.NEXT_PUBLIC_SELLER_URL    || "https://seller.durrahonline.com"),
  provider:  isDev ? "http://localhost:3002" : (process.env.NEXT_PUBLIC_PROVIDER_URL  || "https://provider.durrahonline.com"),
  admin:     isDev ? "http://localhost:3003" : (process.env.NEXT_PUBLIC_ADMIN_URL     || "https://admin.durrahonline.com"),
  warehouse: isDev ? "http://localhost:3004" : (process.env.NEXT_PUBLIC_WAREHOUSE_URL || "https://warehouse.durrahonline.com"),
};

function setRoleCookie(role: string) {
  if (typeof document !== "undefined") {
    const host = window.location.hostname;
    // على durrahonline.com نشارك الكوكي بين البوابات؛ غير ذلك (vercel.app/localhost) نتركه للدومين الحالي
    const domainPart = host.endsWith("durrahonline.com") ? ";domain=.durrahonline.com" : "";
    document.cookie = `durra-role=${role};path=/${domainPart};max-age=604800;samesite=lax`;
  }
}

function clearRoleCookie() {
  if (typeof document !== "undefined") {
    const host = window.location.hostname;
    const domainPart = host.endsWith("durrahonline.com") ? ";domain=.durrahonline.com" : "";
    document.cookie = `durra-role=;path=/${domainPart};max-age=0`;
  }
}

function redirectToCorrectApp(role: string) {
  const targetUrl = APP_URLS[role] || APP_URLS.customer;
  if (typeof window === "undefined") return;
  const current = window.location.origin;
  const target = targetUrl.replace(/\/$/, "");
  if (!current.includes(target.replace("http://", "").replace("https://", "").split(":")[0])) {
    window.location.href = target;
  }
}

let unsubscribe: (() => void) | null = null;

interface AuthStore {
  user: User | null; loading: boolean; error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<boolean>;
  checkEmailVerified: () => Promise<boolean>;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null, loading: true, error: null,

  login: async (email, password) => {
    try {
      set({ error: null, loading: true });
      const result = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", result.user.uid));
      let userData = snap.data() as User;

      // احتياطي: لو وثيقة المستخدم مفقودة، أنشئها بدور customer
      if (!snap.exists() || !userData) {
        userData = {
          uid: result.user.uid,
          email: result.user.email || email,
          displayName: result.user.displayName || "",
          phone: "", role: "customer",
          createdAt: new Date(), points: 0, level: "normal",
        } as User;
        await setDoc(doc(db, "users", result.user.uid), userData);
      }

      const role = userData.role || "customer";
      setRoleCookie(role);
      set({ user: userData, loading: false });

      // redirect after login
      if (role === "customer") {
        window.location.replace("/");
      } else {
        redirectToCorrectApp(role);
      }
    } catch (e: any) {
      const msg = e.code === "auth/wrong-password" || e.code === "auth/user-not-found"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        : e.code === "auth/too-many-requests" ? "محاولات كثيرة — انتظري قليلاً" : e.message;
      set({ error: msg, loading: false });
    }
  },

  register: async (email, password, name, phone) => {
    try {
      set({ error: null, loading: true });
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = { uid: result.user.uid, email, displayName: name, phone, role: "customer", createdAt: new Date(), points: 0, level: "normal" };
      await setDoc(doc(db, "users", result.user.uid), newUser);
      // إرسال رابط تفعيل البريد — تتصفّح عادي لكن لا تحجز حتى تفعّل
      try { await sendEmailVerification(result.user); } catch (ve) { /* تجاهل فشل الإرسال، تقدر تعيده لاحقاً */ }
      setRoleCookie("customer");
      set({ user: newUser, loading: false });
      window.location.replace("/");
    } catch (e: any) {
      const msg = e.code === "auth/email-already-in-use" ? "هذا البريد مسجّل مسبقاً" : e.code === "auth/weak-password" ? "كلمة المرور ضعيفة" : e.message;
      set({ error: msg, loading: false });
    }
  },

  logout: async () => {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    await signOut(auth);
    clearRoleCookie();
    set({ user: null, loading: false });
    if (typeof window !== "undefined") window.location.href = "/auth";
  },

  // إعادة إرسال رابط التفعيل للبريد
  resendVerification: async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return true;
      }
      return false;
    } catch { return false; }
  },

  // التحقق من حالة تفعيل البريد (يعيد تحميل بيانات Firebase)
  checkEmailVerified: async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        return auth.currentUser.emailVerified;
      }
      return false;
    } catch { return false; }
  },

  init: () => {
    if (unsubscribe) return;
    unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const u = snap.data() as User;
            setRoleCookie(u.role);
            set({ user: u, loading: false });
          } else set({ user: null, loading: false });
        } catch { set({ user: null, loading: false }); }
      } else { set({ user: null, loading: false }); clearRoleCookie(); }
    });
  },
}));
