"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

// الحالات المؤكدة بعد نجاح الدفع
const PAID_STATUSES = ["confirmed", "active", "completed", "paid"];

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  // PayTabs يرجّع ?ref=<bookingId> (نضبطه في createPaymentSession)
  const bookingId = params.get("ref") || params.get("booking_id") || params.get("cart_id");
  const cartGroupId = params.get("cart_id") || (bookingId?.startsWith("cart_") ? bookingId : null);

  const [booking, setBooking] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }

    let cancelled = false;
    const check = async () => {
      try {
        // سلة: نقرأ أول حجز في المجموعة
        if (cartGroupId) {
          // لا نملك استعلام client بسهولة هنا، نكتفي بعرض حالة عامة
          setPaid(true); // الـ webhook يؤكد؛ نعرض نجاح مبدئي للسلة
          setLoading(false);
          return;
        }
        const [b, s] = await Promise.all([
          getDoc(doc(db, "bookings", bookingId)),
          getDoc(doc(db, "serviceBookings", bookingId)),
        ]);
        const data = b.exists() ? { ...b.data(), id: b.id, type: "dress" }
          : s.exists() ? { ...s.data(), id: s.id, type: "service" } : null;
        if (cancelled) return;
        if (data) {
          setBooking(data);
          setPaid(PAID_STATUSES.includes((data as any).status));
        }
        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, [bookingId, cartGroupId, tries]);

  // إعادة الفحص تلقائياً (الـ webhook قد يتأخر ثوانٍ) حتى 5 مرات
  useEffect(() => {
    if (loading || paid || tries >= 5 || !booking) return;
    const t = setTimeout(() => setTries(v => v + 1), 2500);
    return () => clearTimeout(t);
  }, [loading, paid, tries, booking]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  const pending = booking && !paid;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>

      <div style={{ width: 96, height: 96, borderRadius: "50%", background: pending ? "linear-gradient(135deg, #E5B567, #F0D9A0)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 8px 32px rgba(201,169,110,0.3)", fontSize: 40 }}>
        {pending ? "⏳" : (
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>

      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#2C1A0A", marginBottom: 8, textAlign: "center" }}>
        {pending ? "جارٍ تأكيد الدفع..." : "تم الحجز بنجاح! 🎉"}
      </div>
      <div style={{ fontSize: 14, color: "#9B7E60", marginBottom: 32, textAlign: "center", lineHeight: 1.8 }}>
        {pending
          ? "نتحقق من دفعتك الآن — قد تستغرق لحظات. يمكنك متابعة الحالة من طلباتك."
          : "تم استلام طلبك وسيتم التواصل معك قريباً"}
      </div>

      {booking && (
        <div style={{ width: "100%", maxWidth: 380, background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "20px", marginBottom: 24, boxShadow: "0 4px 20px rgba(44,26,10,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F2EDE4" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#A07840" }}>{booking.totalPrice} د.ب</span>
            <span style={{ fontSize: 13, color: "#9B7E60" }}>المبلغ</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F2EDE4" }}>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#2C1A0A" }}>#{bookingId?.slice(0, 8).toUpperCase()}</span>
            <span style={{ fontSize: 13, color: "#9B7E60" }}>رقم الطلب</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: pending ? "#FEF3C7" : "#D1FAE5", color: pending ? "#92400E" : "#065F46" }}>
              {pending ? "بانتظار التأكيد ⏳" : "مؤكد ✓"}
            </span>
            <span style={{ fontSize: 13, color: "#9B7E60" }}>الحالة</span>
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 10 }}>
        <Link href="/orders" style={{ textDecoration: "none" }}>
          <button style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15 }}>
            عرض طلباتي
          </button>
        </Link>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{ width: "100%", padding: "15px", borderRadius: 16, border: "1px solid #E8DDD0", cursor: "pointer", background: "#fff", color: "#9B7E60", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 14 }}>
            الرئيسية
          </button>
        </Link>
      </div>
    </div>
  );
}
