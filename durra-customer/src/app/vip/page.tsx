"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function VipPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dresses, setDresses] = useState<any[]>([]);
  const [points, setPoints] = useState(0);
  const [fetching, setFetching] = useState(true);
  const isVip = points >= 1000;

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getDocs(query(collection(db, "dresses"), where("approved", "==", true), where("isVip", "==", true))),
      getDoc(doc(db, "users", user.uid)),
    ]).then(([snap, userSnap]) => {
      setDresses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPoints(userSnap.data()?.points || 0);
      setFetching(false);
    });
  }, [user]);

  if (fetching) return <div style={{ minHeight: "100vh", background: "#1A0E05", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#1A0E05", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      {/* Header */}
      <div style={{ padding: "56px 20px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>💎</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#C9A96E", marginBottom: 4 }}>VIP Closet</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>فساتين حصرية لعضوات VIP</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 50, padding: "8px 20px" }}>
          <span style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>نقاطك: {points}</span>
          {!isVip && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>· تحتاجين {1000 - points} نقطة للوصول</span>}
        </div>
      </div>

      {!isVip ? (
        <div style={{ padding: "0 20px" }}>
          <div style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 20, padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>محتوى حصري</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 16 }}>
              اجمعي 1,000 نقطة للوصول إلى فساتين VIP الحصرية
            </div>
            <Link href="/points">
              <button style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E05", border: "none", borderRadius: 50, padding: "12px 28px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>عرضي نقاطك</button>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {dresses.map(dress => (
            <Link href={`/dress/${dress.id}`} key={dress.id} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(201,169,110,0.2)" }}>
                <div style={{ aspectRatio: "3/4" }}>
                  {dress.images?.[0] ? <img src={dress.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>👗</div>}
                </div>
                <div style={{ padding: "10px 12px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{dress.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#C9A96E" }}>{dress.price} د.ب</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <Navbar />
    </div>
  );
}
