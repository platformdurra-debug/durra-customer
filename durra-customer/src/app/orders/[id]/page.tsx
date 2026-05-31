"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
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

  useEffect(() => { if (!authLoading && !user) router.push("/auth"); }, [user, authLoading]);

  useEffect(() => {
    if (authLoading || !user?.uid) return;
    getDoc(doc(db, "bookings", id as string))
      .then(snap => { if (snap.exists()) setOrder({ id: snap.id, ...snap.data() }); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, user, authLoading]);

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
  const endDate = order.endDate?.seconds ? new Date(order.endDate.seconds * 1000).toLocaleDateString("ar-BH") : "—";

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
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "20px", marginBottom: 14, boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
          {[
            { label: "رقم الطلب",      value: `#${(id as string).slice(0, 8).toUpperCase()}` },
            { label: "تاريخ الاستلام", value: startDate },
            { label: "تاريخ الإرجاع", value: endDate },
            { label: "المبلغ الإجمالي", value: `${order.totalPrice} د.ب`, bold: true, gold: true },
            { label: "حالة الدفع",     value: order.paymentStatus === "held" ? "محتجز 🔒" : order.paymentStatus === "paid" ? "مدفوع ✓" : "معلّق" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F2EDE4" }}>
              <span style={{ fontSize: item.bold ? 18 : 14, fontWeight: item.bold ? 800 : 400, color: item.gold ? "#A07840" : "#2C1A0A" }}>{item.value}</span>
              <span style={{ fontSize: 12, color: "#9B7E60" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {order.status === "completed" && (
          <Link href={`/dress/${order.dressId}/review`}>
            <button style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
              ⭐ قيّمي تجربتك
            </button>
          </Link>
        )}

        <Link href="/orders">
          <button style={{ width: "100%", padding: "14px", borderRadius: 16, border: "1px solid #E8DDD0", cursor: "pointer", background: "#fff", color: "#9B7E60", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 14 }}>
            رجوع للطلبات
          </button>
        </Link>
      </div>
    </div>
  );
}
