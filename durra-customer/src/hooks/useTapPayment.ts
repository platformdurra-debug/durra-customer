"use client";
import { getFunctions, httpsCallable } from "firebase/functions";

// ═══════════════════════════════════════════════════════
// Hook الدفع — جاهز لـ Tap Payments
//
// الوضع الحالي: يستدعي createPaymentSession (Cloud Function)
// التي ترجّع رابط الدفع. الـ Function تدعم PayTabs الآن،
// وستدعم Tap بمجرد إضافة مفاتيح Tap في البيئة.
//
// ربط Tap (لاحقاً):
// في Cloud Function createPaymentSession، استبدل منطق PayTabs
// بـ Tap charge API:
//   POST https://api.tap.company/v2/charges
//   Authorization: Bearer {TAP_SECRET_KEY}
//   body: { amount, currency: "BHD", source: {id: "src_all"},
//           redirect: {url: SUCCESS_URL}, ... }
// ثم أرجع response.transaction.url كرابط التحويل.
// ═══════════════════════════════════════════════════════

export interface PaymentParams {
  bookingId: string;          // معرّف الحجز أو cartGroupId
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  method: string;             // card | applepay | googlepay | benefit
  type?: "dress" | "service"; // نوع الحجز
}

export function useTapPayment() {
  const startPayment = async (params: PaymentParams) => {
    const functions = getFunctions();
    // نفس الـ Function الحالية — ستتحول داخلياً لـ Tap عند تجهيز المفاتيح
    const createSession = httpsCallable(functions, "createPaymentSession");
    const result: any = await createSession(params);
    return result.data as {
      redirect_url?: string;
      status?: string;       // "dev_mode" لو لم تُضف المفاتيح بعد
      message?: string;
    };
  };

  return { startPayment };
}
