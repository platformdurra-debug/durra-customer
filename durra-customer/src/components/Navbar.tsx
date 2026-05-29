"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    href: "/profile", label: "حسابي",
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  },
  {
    href: "/orders", label: "طلباتي",
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  },
  {
    href: "/search", label: "بحث",
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
  },
  {
    href: "/browse", label: "فساتيني",
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  },
  {
    href: "/", label: "الرئيسية",
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
];

export default function Navbar() {
  const path = usePathname();
  const hidden = ["/auth","/admin","/seller","/provider","/warehouse"].some(p => path.startsWith(p));
  if (hidden) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }}>
      <div style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid #E8DDD0",
        boxShadow: "0 -4px 24px rgba(44,26,10,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "10px 0 20px",
      }}>
        {nav.map(item => {
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, position: "relative" }}>
              {active && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", width: 28, height: 3, borderRadius: "0 0 4px 4px", background: "linear-gradient(90deg, #C9A96E, #E8D5A3)" }} />
              )}
              <div style={{ color: active ? "#A07840" : "#9B7E60", transition: "color 0.2s" }}>{item.svg}</div>
              <span style={{ fontSize: 10, fontFamily: "Tajawal, sans-serif", fontWeight: active ? 700 : 400, color: active ? "#A07840" : "#9B7E60" }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
