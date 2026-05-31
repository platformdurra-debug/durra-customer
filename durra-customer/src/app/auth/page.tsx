"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { login, register, error } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleSubmit = async () => {
    if (!isLogin && !agreed) { alert("يجب الموافقة على الشروط والأحكام"); return; }
    setSubmitting(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password, name, phone);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async () => {
    if (!email) { setResetError("أدخلي بريدك الإلكتروني أولاً"); return; }
    setSubmitting(true);
    setResetError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (e: any) {
      setResetError(e.code === "auth/user-not-found" ? "البريد غير مسجّل" : "حدث خطأ، حاولي مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    border: "1.5px solid var(--border)", fontSize: 14,
    fontFamily: "Tajawal, sans-serif", background: "var(--white)",
    color: "var(--text)", outline: "none", textAlign: "right",
    direction: "rtl", transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>

      {/* Hero Top */}
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        <img src="/hero.png" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(26,14,5,0.4), rgba(250,247,242,1))" }} />
        <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: 40, color: "var(--dark)", fontWeight: 700 }}>درّة</div>
          <div style={{ fontSize: 12, color: "var(--text3)", letterSpacing: 2, marginTop: 4 }}>— لتأجير فساتين الزفاف —</div>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: "0 24px 40px", marginTop: -20 }}>
        <div style={{ background: "var(--white)", borderRadius: 24, border: "1px solid var(--border)", boxShadow: "0 4px 32px rgba(44,26,10,0.1)", padding: "24px" }}>

          {/* Forgot Password View */}
          {isForgot ? (
            <div>
              <button onClick={() => { setIsForgot(false); setResetSent(false); setResetError(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
                ← رجوع
              </button>
              <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, fontWeight: 700, color: "var(--dark)", textAlign: "center", marginBottom: 6 }}>نسيت كلمة المرور؟</div>
              <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", marginBottom: 20 }}>سنرسل لك رابط إعادة التعيين على بريدك</div>

              {resetSent ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📩</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#065F46", marginBottom: 6 }}>تم الإرسال!</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>تحققي من بريدك الإلكتروني</div>
                  <button onClick={() => { setIsForgot(false); setResetSent(false); }}
                    style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer", color: "var(--gold-dark)", fontSize: 13, fontWeight: 700 }}>
                    رجوع للدخول
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                  {resetError && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#DC2626" }}>⚠️ {resetError}</div>}
                  <button onClick={handleForgot} disabled={submitting || !email}
                    style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer", background: !email ? "var(--cream3)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email ? "var(--text3)" : "var(--dark)", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "جاري الإرسال..." : "أرسلي رابط إعادة التعيين"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", background: "var(--cream2)", borderRadius: 14, padding: 4, marginBottom: 24 }}>
                {["دخول", "تسجيل"].map((tab, i) => (
                  <button key={tab} onClick={() => setIsLogin(i === 0)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 14, background: (isLogin ? i === 0 : i === 1) ? "var(--white)" : "transparent", color: (isLogin ? i === 0 : i === 1) ? "var(--gold-dark)" : "var(--text3)", boxShadow: (isLogin ? i === 0 : i === 1) ? "0 2px 8px rgba(44,26,10,0.08)" : "none", transition: "all 0.2s" }}>{tab}</button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {!isLogin && (
                  <>
                    <input style={inp} placeholder="الاسم الكامل" value={name} onChange={e => setName(e.target.value)} />
                    <input style={inp} placeholder="رقم الجوال" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
                  </>
                )}
                <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                <div style={{ position: "relative" }}>
                  <input style={inp} placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} type={showPass ? "text" : "password"} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                    {showPass ? <EyeOff size={16} color="var(--text3)" /> : <Eye size={16} color="var(--text3)" />}
                  </button>
                </div>

                {error && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <span style={{ fontSize: 13, color: "#DC2626" }}>⚠️ {error}</span>
                  </div>
                )}

                {/* Terms checkbox — تسجيل فقط */}
                {!isLogin && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 0" }}>
                    <div style={{ textAlign: "right", flex: 1 }}>
                      <span style={{ fontSize: 12, color: "var(--text3)" }}>بالتسجيل أنتِ توافقين على </span>
                      <a href="/terms" target="_blank" style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700 }}>شروط الاستخدام</a>
                      <span style={{ fontSize: 12, color: "var(--text3)" }}> و</span>
                      <a href="/privacy" target="_blank" style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700 }}>سياسة الخصوصية</a>
                      <span style={{ fontSize: 12, color: "var(--text3)" }}> و</span>
                      <a href="/cancellation" target="_blank" style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700 }}>سياسة الإلغاء</a>
                    </div>
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                      style={{ width: 18, height: 18, marginTop: 2, accentColor: "#C9A96E", flexShrink: 0 }} />
                  </div>
                )}

                <button onClick={handleSubmit} disabled={submitting || !email || !password || (!isLogin && !agreed)}
                  style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer", background: (!email || !password || (!isLogin && !agreed)) ? "var(--cream3)" : "linear-gradient(135deg, #C9A96E, #E8D5A3, #C9A96E)", backgroundSize: "200% 200%", color: (!email || !password) ? "var(--text3)" : "var(--dark)", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 16, boxShadow: email && password ? "0 4px 20px rgba(201,169,110,0.3)" : "none", transition: "all 0.3s", marginTop: 4, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "جاري التحقق..." : isLogin ? "دخول" : "إنشاء حساب"}
                </button>

                {isLogin && (
                  <div style={{ textAlign: "center", marginTop: 4, display: "flex", flexDirection: "column", gap: 6 }}>
                    <button onClick={() => setIsForgot(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--gold-dark)", fontWeight: 600 }}>
                      نسيتِ كلمة المرور؟
                    </button>
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>ستُوجَّهين تلقائياً حسب نوع حسابك</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
