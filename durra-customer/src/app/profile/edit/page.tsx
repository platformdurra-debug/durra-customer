"use client";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const MENU = [
  { icon: "✏️", label: "تعديل بياناتي",  href: "/profile/edit" },
  { icon: "🛍️", label: "طلباتي",       href: "/orders" },
  { icon: "❤️", label: "المفضلة",      href: "/favorites" },
  { icon: "⭐", label: "نقاطي",         href: "/points" },
  { icon: "💎", label: "VIP Closet",   href: "/vip" },
  { icon: "📅", label: "مخطط الزفاف", href: "/planner" },
  { icon: "🔔", label: "الإشعارات",    href: "/notifications" },
  { icon: "🔑", label: "تغيير الباسورد", href: "/change-password" },
  { icon: "📞", label: "تواصل معنا",   href: "/contact" },
  { icon: "✦",  label: "انضمي كمعرِضة", href: "/join" },
];

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A0E05, #3D2810)", padding: "56px 20px 28px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 32 }}>👤</span>
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{user?.displayName || "مرحباً"}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{user?.email}</div>
      </div>

      {/* Menu */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", overflow: "hidden", boxShadow: "0 2px 16px rgba(44,26,10,0.06)" }}>
          {MENU.map((item, i) => (
            <Link href={item.href} key={item.label} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < MENU.length - 1 ? "1px solid #F2EDE4" : "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0A" }}>{item.label}</span>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button onClick={logout} style={{ width: "100%", marginTop: 16, padding: "15px", borderRadius: 16, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#DC2626", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          تسجيل الخروج
        </button>
      </div>
      <Navbar />
    </div>
  );
}
