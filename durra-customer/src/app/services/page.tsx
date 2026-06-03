"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// فئات افتراضية لو ما في فئات في Firebase بعد
const FALLBACK = [
  { value: "makeup",       title: "مكياج العروس",      desc: "لإطلالة تخطف الأنظار",      icon: "💄" },
  { value: "salon",        title: "صالونات التجميل",   desc: "جمالك في أفضل حلة",         icon: "💇" },
  { value: "photographer", title: "تصوير العرايس",     desc: "لحظاتك تستحق أن تُخلّد",    icon: "📸" },
  { value: "hall",         title: "صالات الأفراح",     desc: "ليلة لا تُنسى",             icon: "🏛" },
  { value: "flowers",      title: "الورد والديكور",    desc: "أجواء ساحرة بلمسة طبيعية", icon: "🌸" },
  { value: "catering",     title: "الكيك والكاتيرينج", desc: "حلاوة تكمّل يومك",          icon: "🎂" },
];

export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collection(db, "serviceCategories"), where("active", "==", true), orderBy("order", "asc")))
      .then(snap => {
        const cats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCategories(cats.length > 0 ? cats : FALLBACK);
        setLoading(false);
      })
      .catch(() => { setCategories(FALLBACK); setLoading(false); });
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
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {categories.map(s => (
              <Link href={`/services/${s.value}`} key={s.value} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "24px 16px", textAlign: "center", boxShadow: "0 2px 12px rgba(44,26,10,0.05)", transition: "all 0.2s", height: "100%" }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0A", marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "#9B7E60", lineHeight: 1.6 }}>{s.desc}</div>
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
