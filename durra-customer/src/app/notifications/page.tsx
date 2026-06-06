"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    getDocs(query(collection(db, "notifications"), where("userId", "==", user.uid)))
      .then(snap => { setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))); setFetching(false); })
      .catch(err => { console.error(err); setFetching(false); });
  }, [user, loading]);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading || fetching) return <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center" }}>الإشعارات</div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div style={{ fontSize: 14, color: "#9B7E60" }}>لا توجد إشعارات</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map(n => (
              <div key={n.id} onClick={() => markRead(n.id)}
                style={{ background: n.read ? "#fff" : "#FEF9F0", borderRadius: 18, border: `1px solid ${n.read ? "#E8DDD0" : "rgba(201,169,110,0.3)"}`, padding: "14px 18px", cursor: "pointer", boxShadow: "0 2px 8px rgba(44,26,10,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9A96E", flexShrink: 0, marginTop: 4 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A", marginBottom: 4, textAlign: "right" }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "#9B7E60", textAlign: "right" }}>{n.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}
