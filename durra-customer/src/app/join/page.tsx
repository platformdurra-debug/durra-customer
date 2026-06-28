"use client";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

// روابط بوابتي المعرضة والمزود (تسجيل حساب جديد هناك)
const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL || "https://seller.durrahonline.com";
const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL || "https://provider.durrahonline.com";

const SELLER_PERKS = [
  "اعرضي فساتينك لآلاف العرائس",
  "لوحة تحكم كاملة لإدارة الحجوزات",
  "استلام الأرباح بحساب بنكي آمن",
  "باقة مجانية للبداية",
];
const PROVIDER_PERKS = [
  "قدّمي خدماتك (تصوير، مكياج، تنسيق...)",
  "إشعارات واتساب فورية بكل حجز",
  "أولوية ظهور وعروض ترويجية",
  "باقة مجانية للبداية",
];

export default function JoinPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A0E05, #3D2810)", padding: "52px 20px 30px", position: "relative" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "absolute", top: 52, right: 20 }}>
          <ArrowRight size={18} color="#fff" />
        </button>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div style={{ fontSize: 38, marginBottom: 10 }}>✦</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>انضمي لعائلة درّة</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 320, margin: "0 auto" }}>
            عندك فساتين أو خدمات للعرائس؟ سجّلي في بوابتك الخاصة وابدئي استقبال الحجوزات
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>

        {/* بطاقة المعرضة */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: 22, marginBottom: 16, boxShadow: "0 2px 16px rgba(44,26,10,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>👗</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#2C1810" }}>معرِضة فساتين</div>
              <div style={{ fontSize: 12, color: "#9B7E60" }}>أعرض فساتيني للتأجير</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {SELLER_PERKS.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                <span style={{ fontSize: 13, color: "#6B5744" }}>{p}</span>
                <span style={{ color: "#2D8A5E", fontSize: 14, fontWeight: 700 }}>✓</span>
              </div>
            ))}
          </div>
          <a href={`${SELLER_URL}/auth`} style={{ textDecoration: "none" }}>
            <button style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1810", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15 }}>
              سجّلي كمعرِضة ←
            </button>
          </a>
        </div>

        {/* بطاقة المزود */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: 22, marginBottom: 20, boxShadow: "0 2px 16px rgba(44,26,10,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>✨</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#2C1810" }}>مزوّد خدمات</div>
              <div style={{ fontSize: 12, color: "#9B7E60" }}>أقدّم خدمات للعرائس</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {PROVIDER_PERKS.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                <span style={{ fontSize: 13, color: "#6B5744" }}>{p}</span>
                <span style={{ color: "#2D8A5E", fontSize: 14, fontWeight: 700 }}>✓</span>
              </div>
            ))}
          </div>
          <a href={`${PROVIDER_URL}/auth`} style={{ textDecoration: "none" }}>
            <button style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1810", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15 }}>
              سجّل كمزوّد ←
            </button>
          </a>
        </div>

        {/* ملاحظة */}
        <div style={{ background: "#FEF9EC", border: "1px solid #F5D88A", borderRadius: 14, padding: "14px 16px", textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#6B4A0A", lineHeight: 1.9 }}>
            💡 ستسجّلين بحساب جديد خاص ببوابة المعرِضات/المزوّدين (بريد وكلمة مرور مستقلين عن حساب التسوّق). بعد التسجيل توقّعين العقد وتختارين باقتك.
          </div>
        </div>
      </div>
    </div>
  );
}
