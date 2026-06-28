"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dress } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();
  const { user, init } = useAuthStore();
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [serviceImages, setServiceImages] = useState<Record<string, string>>({});
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db, "dresses"), where("approved", "==", true), limit(20))),
      getDoc(doc(db, "settings", "serviceImages")),
      getDocs(collection(db, "serviceCategories")),
      getDocs(query(collection(db, "providers"), where("approved", "==", true))),
    ]).then(([dressSnap, imagesSnap, catsSnap, provSnap]) => {
      // الفئات اللي فيها مزوّد معتمد فقط
      const approvedTypes = new Set(provSnap.docs.map(d => (d.data() as any).type).filter(Boolean));
      const cats = catsSnap.docs
        .map(d => ({ type: (d.data() as any).value, title: (d.data() as any).title, desc: (d.data() as any).desc || "" }))
        .filter(cat => approvedTypes.has(cat.type));
      setServices(cats);
      setDresses(dressSnap.docs
        .map(d => ({ id: d.id, ...d.data() }) as Dress)
        .filter((dr: any) => dr.available !== false)
        .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 6));
      if (imagesSnap.exists()) setServiceImages(imagesSnap.data() || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* ══ HERO ══ */}
      <div style={{ position: "relative", height: 380, overflow: "hidden" }}>
        <img src="/hero.png" alt="عروس" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(26,14,5,0.35) 0%, rgba(26,14,5,0.15) 50%, rgba(250,247,242,1) 100%)" }} />

        {/* Top Bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 20px 0" }}>
          <Link href="/vip">
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", cursor: "pointer" }}>
              <span style={{ fontSize: 15 }}>💎</span>
              <span style={{ fontSize: 7, color: "#A07840", fontWeight: 800, letterSpacing: 0.5 }}>VIP</span>
            </div>
          </Link>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 30, fontWeight: 700, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.4)", lineHeight: 1 }}>درّة</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", letterSpacing: 3, marginTop: 3, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>— لتأجير فساتين الزفاف —</div>
          </div>

          <Link href="/notifications">
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", cursor: "pointer" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C1A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* Hero Text */}
        <div style={{ position: "absolute", bottom: 55, left: 0, right: 0, textAlign: "center", padding: "0 20px" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#2C1A0A", lineHeight: 1.5 }}>
            لتكوني الأجمل<br />في يومك الخاص
          </div>
        </div>
      </div>

      {/* ══ SEARCH ══ */}
      <div style={{ padding: "0 20px", marginTop: -22, position: "relative", zIndex: 10 }}>
        <form onSubmit={handleSearch}>
          <div style={{ background: "#fff", borderRadius: 50, border: "1px solid #E8DDD0", boxShadow: "0 4px 24px rgba(44,26,10,0.1)", display: "flex", alignItems: "center", padding: "13px 20px", gap: 10 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحثي عن فستان أو مناسبة..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "Tajawal, sans-serif", fontSize: 14, color: "#2C1A0A", textAlign: "right", direction: "rtl" }} />
          </div>
        </form>
      </div>

      {/* ══ FEATURED DRESSES ══ */}
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Link href="/browse" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>عرض الكل</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C1A0A" }}>فساتين مميزة</span>
            <span style={{ color: "#C9A96E", fontSize: 18 }}>✦</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {[1,2,3].map(i => <div key={i} style={{ width: 155, height: 230, borderRadius: 18, background: "#EDE4D6", flexShrink: 0 }} />)}
          </div>
        ) : dresses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: 20, border: "1px dashed #E8DDD0" }}>
            <div style={{ fontSize: 13, color: "#9B7E60" }}>لا توجد فساتين بعد — ستظهر هنا عند إضافتها</div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {dresses.map(dress => (
              <Link href={`/dress/${dress.id}`} key={dress.id} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{ width: 155, background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", overflow: "hidden", boxShadow: "0 2px 16px rgba(44,26,10,0.07)" }}>
                  <div style={{ position: "relative", height: 195 }}>
                    {dress.images?.[0] ? (
                      <img src={dress.images[0]} alt={dress.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #F2EDE4, #EDE4D6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>👗</div>
                    )}
                    <div style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                  </div>
                  <div style={{ padding: "10px 12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0A", marginBottom: 4, textAlign: "right" }}>{dress.name}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#A07840", textAlign: "right" }}>{dress.price} <span style={{ fontSize: 12 }}>د.ب</span></div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 5 }}>
                      <span style={{ fontSize: 11, color: "#9B7E60" }}>3 أيام</span>
                      <span style={{ fontSize: 11, color: "#9B7E60" }}>📅</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ══ SERVICES ══ */}
      {services.length > 0 && (
      <div style={{ padding: "28px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Link href="/services" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>عرض الكل</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C1A0A" }}>خدمات العروس</span>
            <span style={{ color: "#C9A96E", fontSize: 18 }}>✦</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {services.map((s: any) => (
            <Link href={`/services/${s.type}`} key={s.type} style={{ textDecoration: "none" }}>
              <div style={{ borderRadius: 20, overflow: "hidden", position: "relative", height: 140, boxShadow: "0 2px 16px rgba(44,26,10,0.1)", background: "linear-gradient(135deg, #1A0E05, #3D2810)" }}>
                {serviceImages[s.type] && (
                  <>
                    <img src={serviceImages[s.type]} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(26,14,5,0.45)" }} />
                  </>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "right", marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textAlign: "right", marginBottom: 6 }}>{s.desc}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 10, color: "#E8D5A3", fontWeight: 700 }}>احجزي الآن ‹</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      )}

      {/* ══ AI BANNER ══ */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ borderRadius: 24, background: "linear-gradient(135deg, #1A0E05, #3D2810)", padding: "22px 20px", position: "relative", overflow: "hidden", boxShadow: "0 4px 24px rgba(44,26,10,0.2)" }}>
          <div style={{ position: "absolute", top: -30, left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(201,169,110,0.08)" }} />
          <div style={{ position: "absolute", bottom: -20, right: -10, width: 80, height: 80, borderRadius: "50%", background: "rgba(201,169,110,0.06)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 6 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#fff" }}>جرّبي الفستان بالذكاء الاصطناعي</div>
              <span style={{ fontSize: 18 }}>✨</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textAlign: "right", marginBottom: 14, lineHeight: 1.6 }}>
              ارفعي صورتك وشوفي كيف يبدو الفستان عليك قبل الحجز
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link href="/browse">
                <div style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E05", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, borderRadius: 50, padding: "10px 20px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  ✨ اكتشفي الفساتين
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
