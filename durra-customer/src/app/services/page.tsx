"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Navbar from "@/components/Navbar";


export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, "serviceCategories"))
      .then(snap => {
        const cats = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(c => c.active !== false)              // الفعّالة فقط
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)); // ترتيب في الكود
        setCategories(cats);
        setLoading(false);
      })
      .catch((e) => { console.error(e); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 20px", borderBottom: "1px solid #E8DDD0" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2C1A0A", textAlign: "center" }}>خدمات الأعراس</div>
        <div style={{ fontSize: 13, color: "#9B7E60", textAlign: "center", marginTop: 4 }}>كل ما تحتاجينه ليومك الخاص</div>
      </div>

      <div style={{ padding: "20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9B7E60" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌸</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0A", marginBottom: 6 }}>لا توجد خدمات متاحة حالياً</div>
            <div style={{ fontSize: 13 }}>سيتم إضافة الخدمات قريباً</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {categories.map(s => (
              <Link href={`/services/${s.value}`} key={s.value} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", overflow: "hidden", boxShadow: "0 2px 12px rgba(44,26,10,0.05)", transition: "all 0.2s", height: "100%" }}>
                  <div style={{ width: "100%", height: 120, background: "#F2EDE4", overflow: "hidden" }}>
                    {s.image ? (
                      <img src={s.image} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{s.icon || "🌸"}</div>
                    )}
                  </div>
                  <div style={{ padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0A", marginBottom: 6 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: "#9B7E60", lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
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
