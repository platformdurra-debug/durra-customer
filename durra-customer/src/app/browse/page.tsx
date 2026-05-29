"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dress } from "@/types";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function BrowsePage() {
  const [dresses, setDresses] = useState<Dress[]>([]);
  const [filtered, setFiltered] = useState<Dress[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("الكل");
  const [categories, setCategories] = useState<string[]>(["الكل"]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAll = async () => {
      const [dressSnap, settingsSnap] = await Promise.all([
        getDocs(query(collection(db, "dresses"), where("approved", "==", true), where("available", "==", true), orderBy("createdAt", "desc"))),
        getDoc(doc(db, "settings", "filters")),
      ]);
      const data = dressSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Dress);
      setDresses(data);
      setFiltered(data);
      // الأقسام من الأدمن فقط
      const cats = settingsSnap.exists() ? settingsSnap.data()?.categories || [] : [];
      setCategories(["الكل", ...cats]);
      setLoading(false);
    };
    fetchAll().catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = [...dresses];
    if (cat !== "الكل") r = r.filter(d => d.category === cat);
    if (search.trim()) r = r.filter(d => d.name?.includes(search) || d.color?.includes(search));
    setFiltered(r);
  }, [search, cat, dresses]);

  const toggleLike = (id: string) => setLiked(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Header */}
      <div style={{ background: "#fff", padding: "52px 20px 0", borderBottom: "1px solid #E8DDD0", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center", marginBottom: 14 }}>✦ الفساتين</div>

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAF7F2", borderRadius: 50, border: "1.5px solid #E8DDD0", padding: "11px 16px", marginBottom: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحثي عن فستان..."
            style={{ flex: 1, border: "none", background: "transparent", fontFamily: "Tajawal, sans-serif", fontSize: 14, color: "#2C1A0A", textAlign: "right", direction: "rtl", outline: "none" }}
          />
        </div>

        {/* Categories — من Firebase فقط */}
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "7px 16px", borderRadius: 50, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                background: cat === c ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "#FAF7F2",
                color: cat === c ? "#2C1A0A" : "#9B7E60",
                boxShadow: cat === c ? "0 2px 12px rgba(201,169,110,0.3)" : "none",
              }}>{c}</button>
            ))}
          </div>
        )}
        {categories.length <= 1 && <div style={{ height: 14 }} />}
      </div>

      {/* Count */}
      <div style={{ padding: "12px 20px 0", textAlign: "left" }}>
        <span style={{ fontSize: 12, color: "#9B7E60" }}>{filtered.length} فستان</span>
      </div>

      {/* Grid */}
      <div style={{ padding: "12px 14px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {loading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} style={{ borderRadius: 16, background: "#EDE4D6", aspectRatio: "3/4" }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: "span 3", textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👗</div>
            <div style={{ fontSize: 13, color: "#9B7E60" }}>لا توجد فساتين</div>
          </div>
        ) : filtered.map(dress => (
          <div key={dress.id}>
            <Link href={`/dress/${dress.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #E8DDD0", boxShadow: "0 2px 8px rgba(44,26,10,0.06)" }}>
                <div style={{ position: "relative", aspectRatio: "3/4" }}>
                  {dress.images?.[0] ? (
                    <img src={dress.images[0]} alt={dress.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #F2EDE4, #EDE4D6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                  )}
                  <button
                    onClick={e => { e.preventDefault(); toggleLike(dress.id); }}
                    style={{ position: "absolute", top: 7, right: 7, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={liked.has(dress.id) ? "#C9A96E" : "none"} stroke={liked.has(dress.id) ? "#C9A96E" : "#9B7E60"} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                <div style={{ padding: "8px 10px 12px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0A", marginBottom: 3, textAlign: "right" }}>{dress.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#A07840", textAlign: "right" }}>{dress.price} <span style={{ fontSize: 10 }}>د.ب</span></div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <Navbar />
    </div>
  );
}
