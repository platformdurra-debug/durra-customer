"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const DEFAULT_SERVICES = [
  { type: "makeup",       title: "مكياج العروس",      desc: "لإطلالة تخطف الأنظار",      icon: "💄" },
  { type: "salon",        title: "صالونات التجميل",   desc: "جمالك في أفضل حلة",         icon: "💇" },
  { type: "photographer", title: "تصوير العرايس",     desc: "لحظاتك تستحق أن تُخلّد",    icon: "📸" },
  { type: "hall",         title: "صالات الأفراح",     desc: "ليلة لا تُنسى",             icon: "🏛" },
  { type: "flowers",      title: "الورد والديكور",    desc: "أجواء ساحرة بلمسة طبيعية", icon: "🌸" },
  { type: "catering",     title: "الكيك والكاتيرينج", desc: "حلاوة تكمّل يومك",          icon: "🎂" },
];

export default function ServicesPage() {
  const [serviceImages, setServiceImages] = useState<Record<string, string>>({});

  useEffect(() => {
    getDoc(doc(db, "settings", "serviceImages"))
      .then(snap => { if (snap.exists()) setServiceImages(snap.data() || {}); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center" }}>✦ خدمات العروس</div>
      </div>

      <div style={{ padding: "20px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {DEFAULT_SERVICES.map(s => (
          <Link href={`/services/${s.type}`} key={s.type} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #E8DDD0", boxShadow: "0 2px 12px rgba(44,26,10,0.06)", display: "flex", height: 100 }}>
              <div style={{ width: 100, flexShrink: 0, position: "relative", background: "linear-gradient(135deg, #1A0E05, #3D2810)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {serviceImages[s.type] ? (
                  <>
                    <img src={serviceImages[s.type]} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(26,14,5,0.2)" }} />
                  </>
                ) : (
                  <span style={{ fontSize: 32, position: "relative", zIndex: 1 }}>{s.icon}</span>
                )}
              </div>
              <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#2C1A0A" }}>{s.title}</div>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 12, color: "#9B7E60", marginBottom: 10 }}>{s.desc}</div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 11, color: "#C9A96E", fontWeight: 700 }}>احجزي الآن ‹</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Navbar />
    </div>
  );
}