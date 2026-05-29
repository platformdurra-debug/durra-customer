"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dress } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function DressDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [dress, setDress] = useState<Dress | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [dressSnap, reviewsSnap] = await Promise.all([
        getDoc(doc(db, "dresses", id as string)),
        getDocs(query(collection(db, "reviews"), where("targetId", "==", id))),
      ]);
      if (dressSnap.exists()) setDress({ id: dressSnap.id, ...dressSnap.data() } as Dress);
      setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  if (!dress) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: "#9B7E60" }}>الفستان غير موجود</div>
    </div>
  );

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 100, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Images */}
      <div style={{ position: "relative", background: "#F2EDE4" }}>
        <div style={{ height: "65vw", maxHeight: 460, overflow: "hidden" }}>
          {dress.images?.[activeImg] ? (
            <img src={dress.images[activeImg]} alt={dress.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>👗</div>
          )}
        </div>

        {/* Back */}
        <button onClick={() => router.back()} style={{ position: "absolute", top: 52, right: 16, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2C1A0A" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Like */}
        <button onClick={() => setLiked(!liked)} style={{ position: "absolute", top: 52, left: 16, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "#C9A96E" : "none"} stroke="#C9A96E" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Image dots */}
        {dress.images && dress.images.length > 1 && (
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
            {dress.images.map((_: any, i: number) => (
              <button key={i} onClick={() => setActiveImg(i)} style={{ width: activeImg === i ? 20 : 6, height: 6, borderRadius: 3, border: "none", cursor: "pointer", background: activeImg === i ? "#C9A96E" : "rgba(255,255,255,0.6)", transition: "all 0.2s", padding: 0 }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "20px 20px 0" }}>

        {/* Name & Price */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#A07840" }}>{dress.price} <span style={{ fontSize: 14 }}>د.ب</span></div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", marginBottom: 4 }}>{dress.name}</div>
            {dress.rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#9B7E60" }}>({reviews.length})</span>
                <span style={{ fontSize: 12, color: "#F59E0B" }}>{"★".repeat(Math.floor(dress.rating || 0))}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Try-On Banner */}
        <Link href={`/dress/${id}/try-on`}>
          <div style={{ background: "linear-gradient(135deg, #1A0E05, #3D2810)", borderRadius: 18, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>✨ جرّبي الفستان بالذكاء الاصطناعي</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>ارفعي صورتك وشوفي الفستان عليك</div>
            </div>
          </div>
        </Link>

        {/* Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "الفئة", value: dress.category },
            { label: "اللون", value: dress.color },
            { label: "الحالة", value: dress.available ? "متاح ✓" : "محجوز" },
          ].map(item => (
            <div key={item.label} style={{ background: "#fff", borderRadius: 14, padding: "12px 10px", textAlign: "center", border: "1px solid #E8DDD0" }}>
              <div style={{ fontSize: 10, color: "#9B7E60", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0A" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Sizes */}
        {dress.size && dress.size.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A", marginBottom: 10, textAlign: "right" }}>المقاسات المتاحة</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {dress.size.map((s: string) => (
                <span key={s} style={{ padding: "6px 16px", borderRadius: 50, border: "1.5px solid #C9A96E", color: "#A07840", fontSize: 13, fontWeight: 700 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {dress.description && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E8DDD0", padding: "16px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A", marginBottom: 8, textAlign: "right" }}>الوصف</div>
            <div style={{ fontSize: 13, color: "#6B4F35", lineHeight: 1.8, textAlign: "right" }}>{dress.description}</div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A", marginBottom: 12, textAlign: "right" }}>التقييمات ({reviews.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map((review: any) => (
                <div key={review.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8DDD0", padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#9B7E60" }}>{new Date((review.createdAt?.seconds || 0) * 1000).toLocaleDateString("ar-BH")}</span>
                    <span style={{ fontSize: 13, color: "#F59E0B" }}>{"★".repeat(review.rating)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#2C1A0A", lineHeight: 1.6, textAlign: "right" }}>{review.comment}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(250,247,242,0.97)", backdropFilter: "blur(10px)", borderTop: "1px solid #E8DDD0", padding: "12px 20px 24px" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/dress/${id}/try-on`}>
            <div style={{ height: 50, padding: "0 16px", borderRadius: 14, border: "1.5px solid #C9A96E", background: "rgba(201,169,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A07840" strokeWidth="2" strokeLinecap="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#A07840", fontFamily: "Tajawal, sans-serif" }}>جرّبي</span>
            </div>
          </Link>
          {dress.available ? (
            <Link href={`/dress/${id}/book`} style={{ flex: 1 }}>
              <button style={{ width: "100%", height: 50, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, boxShadow: "0 4px 16px rgba(201,169,110,0.3)" }}>
                احجزي الآن — {dress.price} د.ب
              </button>
            </Link>
          ) : (
            <button disabled style={{ flex: 1, height: 50, borderRadius: 14, border: "none", background: "#EDE4D6", color: "#9B7E60", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15 }}>
              الفستان محجوز حالياً
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
