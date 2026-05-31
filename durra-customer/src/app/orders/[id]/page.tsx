"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار تأكيد", color: "#92400E", bg: "#FEF3C7" },
  confirmed: { label: "مؤكد ✓",       color: "#065F46", bg: "#D1FAE5" },
  active:    { label: "نشط",          color: "#1D4ED8", bg: "#DBEAFE" },
  completed: { label: "مكتمل",        color: "#6B7280", bg: "#F3F4F6" },
  cancelled: { label: "ملغي",         color: "#991B1B", bg: "#FEE2E2" },
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Complaint
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push("/auth"); }, [user, authLoading]);

  useEffect(() => {
    if (authLoading || !user?.uid) return;
    getDoc(doc(db, "bookings", id as string))
      .then(snap => { if (snap.exists()) setOrder({ id: snap.id, ...snap.data() }); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, user, authLoading]);

  const cancelOrder = async () => {
    if (!confirm("هل تريدين إلغاء هذا الطلب؟")) return;
    setCancelling(true);
    await updateDoc(doc(db, "bookings", id as string), { status: "cancelled", cancelledAt: new Date() });
    setOrder((prev: any) => ({ ...prev, status: "cancelled" }));
    setCancelling(false);
  };

  const submitComplaint = async () => {
    if (!complaintText.trim() || !order) return;
    setSubmittingComplaint(true);
    try {
      await addDoc(collection(db, "complaints"), {
        bookingId: id,
        customerId: user?.uid,
        customerName: user?.displayName,
        sellerId: order.sellerId,
        type: "customer",
        complaint: complaintText,
        status: "open",
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        type: "new_complaint",
        title: "⚠️ شكوى جديدة من زبونة",
        body: (user?.displayName || "زبونة") + ": " + complaintText.slice(0, 60),
        bookingId: id,
        read: false,
        createdAt: serverTimestamp(),
      });
      setShowComplaint(false);
      setComplaintText("");
      alert("تم إرسال شكواك للإدارة ✅");
    } finally { setSubmittingComplaint(false); }
  };

  if (authLoading || loading) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: "#9B7E60" }}>الطلب غير موجود</div>
    </div>
  );

  const s = STATUS[order.status] || STATUS.pending;
  const startDate = order.startDate?.seconds ? new Date(order.startDate.seconds * 1000).toLocaleDateString("ar-BH") : "—";
  const endDate   = order.endDate?.seconds   ? new Date(order.endDate.seconds   * 1000).toLocaleDateString("ar-BH") : "—";
  const rentalPrice  = order.rentalPrice  || order.totalPrice || 0;
  const deliveryPrice = order.deliveryPrice || 0;
  const depositAmount = order.depositAmount || 0;
  const totalPrice   = order.totalPrice   || 0;
  const canCancel = order.status === "pending";
  const canComplain = order.status === "confirmed" || order.status === "completed";

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 40, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: 12, color: "#9B7E60" }}>رجوع</span>
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C1A0A" }}>تفاصيل الطلب</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Order Info */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "20px", marginBottom: 14, boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
          {[
            { label: "رقم الطلب",      value: `#${(id as string).slice(0, 8).toUpperCase()}` },
            { label: "تاريخ الاستلام", value: startDate },
            { label: "تاريخ الإرجاع", value: endDate },
            order.size ? { label: "المقاس", value: order.size } : null,
            { label: "حالة الدفع", value: order.paymentStatus === "held" ? "محتجز 🔒" : order.paymentStatus === "paid" ? "مدفوع ✓" : "معلّق" },
          ].filter(Boolean).map((item: any) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F2EDE4" }}>
              <span style={{ fontSize: 14, color: "#2C1A0A" }}>{item.value}</span>
              <span style={{ fontSize: 12, color: "#9B7E60" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #C9A96E", padding: "20px", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A", marginBottom: 14, textAlign: "right" }}>تفاصيل السعر</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "#2C1A0A" }}>{rentalPrice} د.ب</span>
              <span style={{ fontSize: 13, color: "#9B7E60" }}>إيجار الفستان</span>
            </div>
            {deliveryPrice > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#2C1A0A" }}>{deliveryPrice} د.ب</span>
                <span style={{ fontSize: 13, color: "#9B7E60" }}>🚚 رسوم التوصيل</span>
              </div>
            )}
            {depositAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#2C1A0A" }}>{depositAmount} د.ب</span>
                <span style={{ fontSize: 13, color: "#9B7E60" }}>🛡️ مبلغ التأمين</span>
              </div>
            )}
            <div style={{ borderTop: "1px solid #EDE8DF", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#A07840" }}>{totalPrice} د.ب</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A" }}>الإجمالي</span>
            </div>
          </div>
        </div>

        {depositAmount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "#F0FDF4", border: "1px solid #BBF7D0", marginBottom: 14 }}>
            <span>ℹ️</span>
            <span style={{ fontSize: 12, color: "#065F46" }}>مبلغ التأمين {depositAmount} د.ب يُسترد عند إرجاع الفستان سليماً</span>
          </div>
        )}

        {/* Buttons */}
        {order.status === "completed" && (
          <Link href={`/dress/${order.dressId}/review`}>
            <button style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
              ⭐ قيّمي تجربتك
            </button>
          </Link>
        )}

        {canCancel && (
          <button onClick={cancelOrder} disabled={cancelling}
            style={{ width: "100%", padding: "14px", borderRadius: 16, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", background: "rgba(239,68,68,0.05)", color: "#DC2626", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 10, opacity: cancelling ? 0.7 : 1 }}>
            {cancelling ? "جاري الإلغاء..." : "إلغاء الطلب"}
          </button>
        )}

        {canComplain && (
          <button onClick={() => setShowComplaint(true)}
            style={{ width: "100%", padding: "14px", borderRadius: 16, border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer", background: "rgba(239,68,68,0.04)", color: "#DC2626", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
            ⚠️ تقديم شكوى للإدارة
          </button>
        )}

        <Link href="/orders">
          <button style={{ width: "100%", padding: "14px", borderRadius: 16, border: "1px solid #E8DDD0", cursor: "pointer", background: "#fff", color: "#9B7E60", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 14 }}>
            رجوع للطلبات
          </button>
        </Link>
      </div>

      {/* Complaint Modal */}
      {showComplaint && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowComplaint(false)}>
          <div style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0A", textAlign: "right", marginBottom: 6 }}>تقديم شكوى</div>
            <div style={{ fontSize: 12, color: "#9B7E60", textAlign: "right", marginBottom: 16 }}>سيتم إرسال شكواك للإدارة مباشرة</div>
            <textarea value={complaintText} onChange={e => setComplaintText(e.target.value)}
              placeholder="اكتبي تفاصيل المشكلة..."
              style={{ width: "100%", height: 120, padding: "12px 14px", borderRadius: 14, border: "1.5px solid #E8DDD0", background: "#FAF7F2", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontSize: 13, outline: "none", resize: "none", textAlign: "right", direction: "rtl" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={() => setShowComplaint(false)} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "1px solid #E8DDD0", cursor: "pointer", background: "#fff", color: "#9B7E60", fontFamily: "Tajawal, sans-serif", fontWeight: 600 }}>إلغاء</button>
              <button onClick={submitComplaint} disabled={submittingComplaint || !complaintText.trim()}
                style={{ flex: 2, padding: "14px", borderRadius: 14, border: "none", cursor: !complaintText.trim() ? "not-allowed" : "pointer", background: !complaintText.trim() ? "#EDE8DF" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !complaintText.trim() ? "#9B7E60" : "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, opacity: submittingComplaint ? 0.7 : 1 }}>
                {submittingComplaint ? "جاري الإرسال..." : "إرسال للإدارة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
