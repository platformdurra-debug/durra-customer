"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "انتظار تأكيد", color: "#92400E", bg: "#FEF3C7" },
  confirmed: { label: "مؤكد ✓",       color: "#065F46", bg: "#D1FAE5" },
  active:    { label: "نشط",          color: "#1D4ED8", bg: "#DBEAFE" },
  completed: { label: "مكتمل",        color: "#6B7280", bg: "#F3F4F6" },
  cancelled: { label: "ملغي",         color: "#991B1B", bg: "#FEE2E2" },
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [tab, setTab] = useState("all");

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "bookings"), where("customerId", "==", user.uid), orderBy("createdAt", "desc")))
      .then(snap => { setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); })
      .catch(err => { console.error("Orders fetch error:", err); setFetching(false); });
  }, [user, loading]);

  const tabs = [{ val: "all", label: "الكل" }, { val: "pending", label: "انتظار" }, { val: "confirmed", label: "مؤكدة" }, { val: "completed", label: "مكتملة" }];
  const filtered = tab === "all" ? orders : orders.filter(o => o.status === tab);

  if (loading || fetching) return <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 0", borderBottom: "1px solid #E8DDD0", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center", marginBottom: 14 }}>طلباتي</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
          {tabs.map(t => (
            <button key={t.val} onClick={() => setTab(t.val)} style={{
              padding: "7px 16px", borderRadius: 50, border: "none", cursor: "pointer", whiteSpace: "nowrap",
              fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
              background: tab === t.val ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "#FAF7F2",
              color: tab === t.val ? "#2C1A0A" : "#9B7E60",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0A", marginBottom: 6 }}>لا توجد طلبات</div>
            <Link href="/browse">
              <button style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", border: "none", borderRadius: 50, padding: "12px 28px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, cursor: "pointer", marginTop: 12, fontSize: 14 }}>تصفحي الفساتين</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(order => {
              const s = STATUS[order.status] || STATUS.pending;
              return (
                <Link href={`/orders/${order.id}`} key={order.id} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "16px 20px", boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                      <span style={{ fontSize: 11, color: "#9B7E60", fontFamily: "monospace" }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#A07840" }}>{order.totalPrice} <span style={{ fontSize: 13 }}>د.ب</span></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}
