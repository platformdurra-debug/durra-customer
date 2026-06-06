"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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
  const [typeFilter, setTypeFilter] = useState("all"); // all | dress | service

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    Promise.all([
      getDocs(query(collection(db, "bookings"), where("customerId", "==", user.uid))),
      getDocs(query(collection(db, "serviceBookings"), where("customerId", "==", user.uid))),
    ]).then(([dressSnap, serviceSnap]) => {
      const dressOrders = dressSnap.docs.map(d => ({ id: d.id, ...d.data(), orderType: "dress" }));
      const serviceOrders = serviceSnap.docs.map(d => ({ id: d.id, ...d.data(), orderType: "service" }));
      // مرتبة حسب التاريخ
      const all = [...dressOrders, ...serviceOrders].sort((a: any, b: any) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setOrders(all);
      setFetching(false);
    }).catch(err => { console.error("Orders fetch error:", err); setFetching(false); });
  }, [user, loading]);

  const tabs = [
    { val: "all", label: "الكل" },
    { val: "pending", label: "انتظار" },
    { val: "confirmed", label: "مؤكدة" },
    { val: "completed", label: "مكتملة" },
  ];

  const filtered = orders
    .filter(o => tab === "all" || o.status === tab)
    .filter(o => typeFilter === "all" || o.orderType === typeFilter);

  if (loading || fetching) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 0", borderBottom: "1px solid #E8DDD0", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center", marginBottom: 14 }}>طلباتي</div>

        {/* Type Filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[{ val: "all", label: "الكل" }, { val: "dress", label: "👗 فساتين" }, { val: "service", label: "✨ خدمات" }].map(t => (
            <button key={t.val} onClick={() => setTypeFilter(t.val)} style={{
              padding: "6px 14px", borderRadius: 50, border: "none", cursor: "pointer",
              fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 12,
              background: typeFilter === t.val ? "rgba(201,169,110,0.15)" : "transparent",
              color: typeFilter === t.val ? "#A07840" : "#9B7E60",
              transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Status Tabs */}
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
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
              <Link href="/browse">
                <button style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", border: "none", borderRadius: 50, padding: "11px 20px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>👗 الفساتين</button>
              </Link>
              <Link href="/services">
                <button style={{ background: "#fff", color: "#A07840", border: "1px solid #E8DDD0", borderRadius: 50, padding: "11px 20px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✨ الخدمات</button>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(order => {
              const s = STATUS[order.status] || STATUS.pending;
              const isDress = order.orderType === "dress";
              const href = isDress ? `/orders/${order.id}` : `/orders/service-${order.id}`;
              return (
                <Link href={href} key={`${order.orderType}-${order.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "16px 20px", boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>
                        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: isDress ? "rgba(201,169,110,0.1)" : "rgba(139,92,246,0.1)", color: isDress ? "#A07840" : "#7C3AED", fontWeight: 600 }}>
                          {isDress ? "👗 فستان" : "✨ خدمة"}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "#9B7E60", fontFamily: "monospace" }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#A07840" }}>{order.totalPrice} <span style={{ fontSize: 13 }}>د.ب</span></div>
                        <div style={{ fontSize: 11, color: "#9B7E60" }}>{isDress ? (order.dressName || "فستان") : (order.productName || "خدمة")}</div>
                      </div>
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
