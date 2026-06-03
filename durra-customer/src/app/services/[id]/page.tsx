"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  open:   { label: "مفتوح الآن", color: "#065F46", dot: "#34D399" },
  busy:   { label: "مشغول",      color: "#92400E", dot: "#F59E0B" },
  closed: { label: "مغلق",       color: "#991B1B", dot: "#EF4444" },
};

const FALLBACK_LABELS: Record<string, string> = {
  makeup: "مكياج العروس", salon: "الصالونات", hall: "صالات الأفراح",
  photographer: "المصورون", flowers: "الورد والديكور", catering: "الكيك والكاتيرينج",
};

export default function ServiceSlugPage() {
  const params = useParams();
  const slug = params?.id as string;
  const router = useRouter();

  const [mode, setMode] = useState<"loading" | "category" | "provider">("loading");
  const [providers, setProviders] = useState<any[]>([]);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [provider, setProvider] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    const resolve = async () => {
      // 1) هل الـ slug فئة خدمات؟ (نبحث في serviceCategories بالـ value، أو في الـ fallback)
      const catSnap = await getDocs(query(collection(db, "serviceCategories"), where("value", "==", slug)));
      const isFallbackCat = Object.keys(FALLBACK_LABELS).includes(slug);

      if (!catSnap.empty || isFallbackCat) {
        // وضع الفئة — اعرض المزودين
        setCategoryTitle(!catSnap.empty ? catSnap.docs[0].data().title : FALLBACK_LABELS[slug]);
        const provSnap = await getDocs(query(
          collection(db, "providers"),
          where("approved", "==", true),
          where("type", "==", slug),
          orderBy("rating", "desc")
        ));
        setProviders(provSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setMode("category");
        return;
      }

      // 2) وإلا — اعتبره ID مزوّد
      const provDoc = await getDoc(doc(db, "providers", slug));
      if (provDoc.exists()) {
        setProvider({ id: provDoc.id, ...provDoc.data() });
        const prodSnap = await getDocs(query(collection(db, "providerProducts"), where("providerId", "==", slug), where("active", "==", true)));
        setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setMode("provider");
      } else {
        setMode("provider"); // يعرض "غير موجود"
      }
    };
    resolve().catch(() => setMode("provider"));
  }, [slug]);

  // ─── شاشة التحميل ───
  if (mode === "loading") return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  // ─── وضع الفئة: قائمة المزودين ───
  if (mode === "category") return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ fontSize: 12, color: "#9B7E60" }}>رجوع</span>
        </button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center" }}>{categoryTitle}</div>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        {providers.length === 0 ? (
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

  // ─── وضع المزوّد: صفحة المزوّد ───
  if (!provider) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: "#9B7E60" }}>المزوّد غير موجود</div>
    </div>
  );

  const status = STATUS_CONFIG[provider.status] || STATUS_CONFIG.open;

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ position: "relative", height: 200, background: "#F2EDE4", overflow: "hidden" }}>
        {provider.coverImage ? (
          <img src={provider.coverImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1A0E05, #3D2810)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(250,247,242,1) 100%)" }} />
        <button onClick={() => router.back()} style={{ position: "absolute", top: 52, right: 16, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C1A0A" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div style={{ padding: "0 20px", marginTop: -40 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, overflow: "hidden", border: "3px solid #fff", background: "#FAF7F2", flexShrink: 0, boxShadow: "0 2px 12px rgba(44,26,10,0.1)" }}>
            {provider.logoImage ? <img src={provider.logoImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏪</div>}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C1A0A" }}>{provider.name}</div>
            <div style={{ fontSize: 12, color: "#9B7E60" }}>{provider.area}</div>
          </div>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 50, background: "#fff", border: "1px solid #E8DDD0", marginBottom: 16, boxShadow: "0 1px 6px rgba(44,26,10,0.05)" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.dot }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: status.color }}>{status.label}</span>
        </div>

        {provider.rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "#9B7E60" }}>({provider.reviewCount || 0} تقييم)</span>
            <span style={{ fontSize: 14, color: "#F59E0B" }}>{"★".repeat(Math.round(provider.rating))}</span>
          </div>
        )}

        {provider.description && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E8DDD0", padding: "16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#6B4F35", lineHeight: 1.8, textAlign: "right" }}>{provider.description}</div>
          </div>
        )}

        {products.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#2C1A0A", marginBottom: 14, textAlign: "right" }}>✦ الخدمات والأسعار</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 18, border: "1px solid #E8DDD0", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(44,26,10,0.04)" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#A07840" }}>{p.price} <span style={{ fontSize: 11 }}>د.ب</span></div>
                    {p.duration && <div style={{ fontSize: 11, color: "#9B7E60" }}>{p.duration}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A", marginBottom: 2 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 11, color: "#9B7E60" }}>{p.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href={`/services/${slug}/book`}>
          <button style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(201,169,110,0.3)" }}>
            احجزي الآن
          </button>
        </Link>
      </div>
      <Navbar />
    </div>
  );
}
