
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentFailPage() {
  const params = useSearchParams();
  const bookingId = params.get("booking_id") || params.get("cart_id");

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>

      {/* Fail Icon */}
      <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #EF4444, #FCA5A5)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 8px 32px rgba(239,68,68,0.2)" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>

      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2C1A0A", marginBottom: 8, textAlign: "center" }}>
        فشل الدفع
      </div>
      <div style={{ fontSize: 14, color: "#9B7E60", marginBottom: 32, textAlign: "center", lineHeight: 1.8 }}>
        لم يتم إتمام الدفع، يمكنك المحاولة مرة أخرى
      </div>

      <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => window.history.back()}
          style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15 }}>
          حاولي مرة أخرى
        </button>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{ width: "100%", padding: "15px", borderRadius: 16, border: "1px solid #E8DDD0", cursor: "pointer", background: "#fff", color: "#9B7E60", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 14 }}>
            الرئيسية
          </button>
        </Link>
      </div>
    </div>
  );
}
