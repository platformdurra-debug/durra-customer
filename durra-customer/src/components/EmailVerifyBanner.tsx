"use client";
import { useState } from "react";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";

// لافتة/حاجز تفعيل البريد — تظهر فقط لو البريد غير مفعّل.
// تُستخدم في صفحات الحجز لمنع الحجز قبل التفعيل.
export default function EmailVerifyBanner({ onVerified }: { onVerified?: () => void }) {
  const { resendVerification, checkEmailVerified } = useAuth();
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState("");

  // البريد مفعّل؟ نقرأ من Firebase مباشرة
  const auth = typeof window !== "undefined" ? getAuth() : null;
  const verified = auth?.currentUser?.emailVerified ?? false;
  if (verified) return null;

  const handleResend = async () => {
    setMsg("");
    const ok = await resendVerification();
    setSent(true);
    setMsg(ok ? "📧 أرسلنا رابط التفعيل لبريدك — افتحيه واضغطي الرابط" : "تعذّر الإرسال، حاولي بعد قليل");
  };

  const handleCheck = async () => {
    setChecking(true); setMsg("");
    const ok = await checkEmailVerified();
    setChecking(false);
    if (ok) { setMsg("✅ تم تفعيل بريدك! يمكنك المتابعة الآن"); onVerified?.(); }
    else setMsg("لم يتم التفعيل بعد — تأكدي من الضغط على الرابط في بريدك (وتفقّدي مجلد الإعلانات/Spam)");
  };

  return (
    <div style={{ background: "#FEF9EC", border: "1.5px solid #F5D88A", borderRadius: 16, padding: "16px 18px", marginBottom: 16, textAlign: "right", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>📧</span>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#92400E" }}>فعّلي بريدك للمتابعة</div>
      </div>
      <div style={{ fontSize: 13, color: "#6B4A0A", lineHeight: 1.8, marginBottom: 12 }}>
        للحجز، نحتاج نتأكد من بريدك الإلكتروني. أرسلنا لك رابط تفعيل — افتحي بريدك واضغطي الرابط، ثم اضغطي «تحققت».
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={handleResend}
          style={{ flex: 1, minWidth: 130, padding: "11px", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1810", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13 }}>
          {sent ? "إعادة الإرسال" : "أرسلي رابط التفعيل"}
        </button>
        <button onClick={handleCheck} disabled={checking}
          style={{ flex: 1, minWidth: 130, padding: "11px", borderRadius: 12, border: "1px solid #C9A96E", cursor: "pointer", background: "#fff", color: "#A07840", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 13, opacity: checking ? 0.6 : 1 }}>
          {checking ? "جارٍ التحقق..." : "تحققت ✓"}
        </button>
      </div>
      {msg && <div style={{ fontSize: 12, color: "#6B4A0A", marginTop: 10, fontWeight: 600 }}>{msg}</div>}
    </div>
  );
}
