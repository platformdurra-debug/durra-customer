"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

const LABELS: Record<string, string> = {
  makeup: "مكياج العروس", salon: "الصالونات", hall: "صالات الأفراح",
  photographer: "المصورون", flowers: "الورد والديكور", catering: "الكيك والكاتيرينج"
};

export default function ServicePage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getDocs(query(collection(db, "providers"), where("approved", "==", true), where("type", "==", "salon"), orderBy("rating", "desc")))
      .then(snap => { setProviders(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: 12, color: "#9B7E60" }}>رجوع</span>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center" }}>{LABELS["salon"] || "salon"}</div>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 90, borderRadius: 18, background: "#EDE4D6" }} />)}
          </div>
        ) : providers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 14, color: "#9B7E60" }}>لا يوجد مزودون متاحون حالياً</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {providers.map(p => (
              <Link href={"/services/" + p.id} key={p.id} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(44,26,10,0.05)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, overflow: "hidden", flexShrink: 0, background: "#F2EDE4" }}>
                    {p.logoImage ? <img src={p.logoImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏪</div>}
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0A", marginBottom: 3 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9B7E60", marginBottom: 4 }}>{p.area}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                      <span style={{ fontSize: 12, color: "#9B7E60" }}>({p.reviewCount || 0})</span>
                      <span style={{ fontSize: 12, color: "#F59E0B" }}>{"★".repeat(Math.round(p.rating || 0))}</span>
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.status === "open" ? "#34D399" : p.status === "busy" ? "#F59E0B" : "#EF4444", flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}
