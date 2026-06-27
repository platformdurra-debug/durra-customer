"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export default function CartFab() {
  const path = usePathname();
  const items = useCartStore(s => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // نخفيه في صفحات معينة فقط — لكن يظهر دائماً (حتى فارغاً) ليعرف الزبون بوجوده
  const hidden = ["/auth", "/cart"].some(p => path.startsWith(p)) ||
    ["/admin", "/seller", "/provider", "/warehouse"].some(p => path.startsWith(p));
  if (hidden || !mounted) return null;

  return (
    <Link href="/cart" style={{ textDecoration: "none" }}>
      <div style={{
        position: "fixed", bottom: 86, left: 20, zIndex: 60,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #C9A96E, #E8D5A3)",
        boxShadow: "0 6px 20px rgba(201,169,110,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        {items.length > 0 && (
        <div style={{
          position: "absolute", top: -4, right: -4,
          minWidth: 22, height: 22, borderRadius: 11,
          background: "#C0392B", color: "#fff",
          fontSize: 12, fontWeight: 800, fontFamily: "Tajawal, sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 6px", border: "2px solid #FAF7F2",
        }}>
          {items.length}
        </div>
        )}
      </div>
    </Link>
  );
}
