"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(params.get("q") || "");
  const [dresses, setDresses] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"dresses" | "services">("dresses");

  const doSearch = async (q: string) => {
    setLoading(true);
    const [d, p] = await Promise.all([
      getDocs(query(collection(db, "dresses"), where("approved", "==", true))),
      getDocs(query(collection(db, "providers"), where("approved", "==", true))),
    ]);
    const term = q.trim();
    const dl = d.docs.map(x => ({ id: x.id, ...x.data() })).filter((x: any) => !term || x.name?.includes(term) || x.color?.includes(term) || x.description?.includes(term));
    const pl = p.docs.map(x => ({ id: x.id, ...x.data() })).filter((x: any) => !term || x.name?.includes(term) || x.type?.includes(term));
    setDresses(dl); setProviders(pl); setLoading(false);
  };

  useEffect(() => { doSearch(search); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); doSearch(search); };

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 0", borderBottom: "1px solid #E8DDD0", position: "sticky", top: 0, zIndex: 40 }}>
        <form onSubmit={handleSearch} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FAF7F2", borderRadius: 50, border: "1.5px solid #E8DDD0", padding: "11px 16px" }}>
            <button type="submit" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            <input value={search} onChange={e => { setSearch(e.target.value); doSearch(e.target.value); }} placeholder="ابحثي عن فستان أو خدمة..." autoFocus
              style={{ flex: 1, border: "none", background: "transparent", fontFamily: "Tajawal, sans-serif", fontSize: 14, color: "#2C1A0A", textAlign: "right", direction: "rtl", outline: "none" }} />
          </div>
        </form>
        <div style={{ display: "flex", marginBottom: 0 }}>
          {(["dresses", "services"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "10px", border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 13, background: "transparent",
              color: tab === t ? "#A07840" : "#9B7E60", borderBottom: tab === t ? "2px solid #C9A96E" : "2px solid transparent", transition: "all 0.2s",
            }}>{t === "dresses" ? `فساتين (${dresses.length})` : `خدمات (${providers.length})`}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 14px 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9B7E60" }}>جاري البحث...</div>
        ) : tab === "dresses" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {dresses.map((d: any) => (
              <Link href={`/dress/${d.id}`} key={d.id} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #E8DDD0" }}>
                  <div style={{ aspectRatio: "3/4", background: "#F2EDE4" }}>
                    {d.images?.[0] && <img src={d.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0A" }}>{d.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#A07840" }}>{d.price} د.ب</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {providers.map((p: any) => (
              <Link href={`/services/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E8DDD0", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#9B7E60" }}>{p.type} · {p.area}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && search && dresses.length === 0 && providers.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 14, color: "#9B7E60" }}>لا توجد نتائج لـ "{search}"</div>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}
