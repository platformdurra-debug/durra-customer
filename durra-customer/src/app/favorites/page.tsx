"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "favorites"), where("userId", "==", user.uid)))
      .then(snap => { setFavorites(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setFetching(false); });
  }, [user]);

  if (fetching) return <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center" }}>❤️ المفضلة</div>
      </div>
      <div style={{ padding: "16px 14px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {favorites.length === 0 ? (
          <div style={{ gridColumn: "span 2", textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
            <div style={{ fontSize: 14, color: "#9B7E60" }}>لا توجد عناصر مفضلة</div>
            <Link href="/browse"><button style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", border: "none", borderRadius: 50, padding: "12px 24px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, cursor: "pointer", marginTop: 16 }}>تصفحي الفساتين</button></Link>
          </div>
        ) : favorites.map(f => (
          <Link href={`/dress/${f.dressId}`} key={f.id} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid #E8DDD0", boxShadow: "0 2px 8px rgba(44,26,10,0.06)" }}>
              <div style={{ aspectRatio: "3/4", background: "#F2EDE4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {f.dressImage ? <img src={f.dressImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 40 }}>👗</span>}
              </div>
              <div style={{ padding: "10px 12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0A", textAlign: "right" }}>{f.dressName}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#A07840", textAlign: "right" }}>{f.dressPrice} د.ب</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Navbar />
    </div>
  );
}
