"use client";
import { useState, useEffect } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push("/auth"); }, [user, authLoading]);

  const handleSendReset = async () => {
    if (!user?.email) { setError("لا يوجد بريد مرتبط بحسابك"); return; }
    setLoading(true); setError("");
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, user.email);
      setSent(true);
    } catch {
      setError("تعذّر إرسال الرابط، حاولي بعد قليل");
    } finally { setLoading(false); }
  };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "52px 20px 16px", borderBottom: "1px solid #EDE8DF", background: "#fff" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowRight size={20} color="#2C1810" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1810" }}>تغيير كلمة المرور</div>
      </div>

      <div style={{ padding: "28px 20px", maxWidth: 460, margin: "0 auto" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#2C1810", marginBottom: 10 }}>أرسلنا لك الرابط!</div>
            <div style={{ fontSize: 14, color: "#6B5744", lineHeight: 1.9, marginBottom: 6 }}>
              أرسلنا رابط إعادة تعيين كلمة المرور إلى:
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#A07840", marginBottom: 18, direction: "ltr" }}>{user?.email}</div>
            <div style={{ fontSize: 13, color: "#9B7E60", lineHeight: 1.9, marginBottom: 20 }}>
              افتحي بريدك واضغطي الرابط لتعيين كلمة مرور جديدة.
            </div>
            <div style={{ fontSize: 12, color: "#92400E", background: "#FEF9EC", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
              💡 ما وصلك الرابط؟ تأكدي من مجلد الإعلانات أو الـ Spam
            </div>
            <button onClick={() => router.push("/profile")}
              style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1810", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15 }}>
              رجوع لحسابي
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>🔐</div>
            <div style={{ fontSize: 14, color: "#6B5744", lineHeight: 1.9, marginBottom: 24, textAlign: "center" }}>
              لتغيير كلمة مرورك بأمان، سنرسل رابطاً إلى بريدك المسجّل. اضغطي الرابط واختاري كلمة مرور جديدة.
            </div>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #EDE8DF", padding: "14px 16px", marginBottom: 20, textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#9B7E60", marginBottom: 4 }}>سيُرسل الرابط إلى</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810", direction: "ltr", textAlign: "right" }}>{user?.email}</div>
            </div>
            {error && <div style={{ fontSize: 13, color: "#C0392B", marginBottom: 16, textAlign: "center", fontWeight: 600 }}>{error}</div>}
            <button onClick={handleSendReset} disabled={loading}
              style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1810", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1 }}>
              {loading ? "جاري الإرسال..." : "أرسلي رابط تغيير كلمة المرور"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
