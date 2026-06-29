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
      // 1) هل الـ slug فئة خدمات في Firebase؟
      const catSnap = await getDocs(query(collection(db, "serviceCategories"), where("value", "==", slug)));

      if (!catSnap.empty) {
        // وضع الفئة — اعرض المزودين
        setCategoryTitle(catSnap.docs[0].data().title);
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
      <div style={{ position: "relative", height: 170, background: "linear-gradient(135deg, #1A0E05, #3D2810)", overflow: "hidden" }}>
        {provider.coverImage && (
          <img src={provider.coverImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%)" }} />
        <button onClick={() => router.back()} style={{ position: "absolute", top: 52, right: 16, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C1A0A" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div style={{ padding: "0 20px", marginTop: -44, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 18 }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", overflow: "hidden", border: "4px solid #fff", background: "#FAF7F2", boxShadow: "0 4px 16px rgba(44,26,10,0.18)" }}>
            {provider.logoImage ? <img src={provider.logoImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>🏪</div>}
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", marginTop: 12 }}>{provider.name}</div>
          {provider.area && <div style={{ fontSize: 13, color: "#9B7E60", marginTop: 2 }}>📍 {provider.area}</div>}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 50, background: "#fff", border: "1px solid #E8DDD0", marginTop: 12, boxShadow: "0 1px 6px rgba(44,26,10,0.05)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.dot }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: status.color }}>{status.label}</span>
          </div>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 18, border: "1px solid #E8DDD0", overflow: "hidden", boxShadow: "0 2px 10px rgba(44,26,10,0.05)" }}>
                  {/* صور الخدمة */}
                  {p.images && p.images.length > 0 && (
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: p.images.length > 1 ? 6 : 0 }}>
                      {p.images.map((img: string, idx: number) => (
                        <img key={idx} src={img} style={{ width: p.images.length > 1 ? 200 : "100%", height: 160, objectFit: "cover", borderRadius: p.images.length > 1 ? 12 : 0, flexShrink: 0 }} />
                      ))}
                    </div>
                  )}
                  <div style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#A07840", whiteSpace: "nowrap" }}>{p.price} <span style={{ fontSize: 11 }}>د.ب</span></div>
                      <div style={{ textAlign: "right", flex: 1, marginRight: 10 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0A" }}>{p.name}</div>
                        {p.duration && <div style={{ fontSize: 11, color: "#9B7E60", marginTop: 2 }}>⏱ {p.duration}</div>}
                      </div>
                    </div>
                    {p.description && <div style={{ fontSize: 12.5, color: "#7A6A58", lineHeight: 1.7, textAlign: "right", marginBottom: p.addons?.length ? 10 : 0 }}>{p.description}</div>}
                    {/* الإضافات */}
                    {p.addons && p.addons.length > 0 && (
                      <div style={{ borderTop: "1px dashed #E8DDD0", paddingTop: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7E60", textAlign: "right", marginBottom: 6 }}>✨ إضافات اختيارية</div>
                        {p.addons.map((a: any, idx: number) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5A4A38", padding: "3px 0" }}>
                            <span style={{ fontWeight: 700, color: "#A07840" }}>+{a.price} د.ب</span>
                            <span>{a.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {p.hasDelivery && (
                      <div style={{ fontSize: 11, color: "#2D8A5E", textAlign: "right", marginTop: 8, fontWeight: 600 }}>🚚 خدمة توصيل متوفرة{p.deliveryPrice ? ` (${p.deliveryPrice} د.ب)` : ""}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {provider.closed ? (
          <button disabled style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", background: "#E5E0D8", color: "#9B8E7E", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, cursor: "not-allowed" }}>
            المحل مغلق حالياً
          </button>
        ) : (
        <Link href={`/services/${slug}/book`}>
          <button style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(201,169,110,0.3)" }}>
            احجزي الآن
          </button>
        </Link>
        )}
      </div>
      <Navbar />
    </div>
  );
}
