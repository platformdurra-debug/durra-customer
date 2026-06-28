"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff } from "lucide-react";

export default function SellerAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  // حقول التسجيل
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [area, setArea] = useState("");
  const [instagram, setInstagram] = useState("");
  const { login, register, error } = useAuthStore();

  const handleLogin = async () => {
    if (!agreed) { alert("يجب الموافقة على الشروط والأحكام"); return; }
    setSubmitting(true);
    try { await login(email, password); } finally { setSubmitting(false); }
  };

  const handleRegister = async () => {
    if (!agreed) { alert("يجب الموافقة على الشروط والأحكام"); return; }
    if (!email || !password || !name || !phone || !area) { alert("أكملي الحقول المطلوبة (الاسم، البريد، كلمة المرور، الجوال، المنطقة)"); return; }
    setSubmitting(true);
    try {
      const ok = await register({ email, password, name, phone, whatsapp, area, instagram });
      if (ok) setRegistered(true);
    } finally { setSubmitting(false); }
  };

  const handleForgot = async () => {
    if (!email) { setResetError("أدخلي بريدك الإلكتروني أولاً"); return; }
    setSubmitting(true); setResetError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (e: any) {
      setResetError(e.code === "auth/user-not-found" ? "البريد غير مسجّل" : "حدث خطأ، حاولي مرة أخرى");
    } finally { setSubmitting(false); }
  };

  const inp = {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    border: "1.5px solid #2A1A08", fontSize: 14,
    fontFamily: "Tajawal, sans-serif", background: "rgba(255,255,255,0.05)",
    color: "#FAF7F2", outline: "none", textAlign: "right" as const, direction: "rtl" as const,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0F0800, #2A1408 60%, #1A0E02)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 52, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>درّة</div>
        <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, transparent, #C9A96E, transparent)", margin: "12px auto" }} />
        <div style={{ fontSize: 10, color: "rgba(201,169,110,0.45)", letterSpacing: 4 }}>بوابة المعرِضة</div>
      </div>

      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Forgot Password */}
        {isForgot ? (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(201,169,110,0.15)", padding: 28 }}>
            <button onClick={() => { setIsForgot(false); setResetSent(false); setResetError(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,0.5)", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
              ← رجوع
            </button>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#C9A96E", textAlign: "center", marginBottom: 6 }}>نسيتِ كلمة المرور؟</div>
            <div style={{ fontSize: 12, color: "rgba(201,169,110,0.4)", textAlign: "center", marginBottom: 24 }}>سنرسل لك رابط إعادة التعيين</div>

            {resetSent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📩</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#C9A96E", marginBottom: 6 }}>تم الإرسال!</div>
                <div style={{ fontSize: 12, color: "rgba(201,169,110,0.5)" }}>تحققي من بريدك الإلكتروني</div>
                <button onClick={() => { setIsForgot(false); setResetSent(false); }}
                  style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer", color: "#C9A96E", fontSize: 13, fontWeight: 700 }}>
                  رجوع للدخول
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
                {resetError && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", fontSize: 13, color: "#E87B6E" }}>⚠️ {resetError}</div>}
                <button onClick={handleForgot} disabled={submitting || !email}
                  style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: !email ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !email ? "rgba(201,169,110,0.1)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email ? "rgba(201,169,110,0.3)" : "#1A0E02", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "جاري الإرسال..." : "أرسلي رابط إعادة التعيين"}
                </button>
              </div>
            )}
          </div>

        ) : registered ? (
          /* تم التسجيل — بانتظار الموافقة */
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(201,169,110,0.15)", padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>⏳</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#C9A96E", marginBottom: 10 }}>تم استلام طلبك!</div>
            <div style={{ fontSize: 13, color: "rgba(201,169,110,0.6)", lineHeight: 1.9, marginBottom: 18 }}>
              حسابك الآن قيد المراجعة من إدارة درّة. سنفعّله بأقرب وقت، وسيصلك إشعار عند الموافقة. تقدرين تسجّلين الدخول لمتابعة حالة طلبك.
            </div>
            <button onClick={() => { setRegistered(false); setIsRegister(false); }}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E02", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15 }}>
              تسجيل الدخول
            </button>
          </div>

        ) : isRegister ? (
          /* تسجيل حساب جديد */
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(201,169,110,0.15)", padding: 28, backdropFilter: "blur(10px)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#FAF7F2", textAlign: "center", marginBottom: 6 }}>انضمي كمعرِضة</div>
            <div style={{ fontSize: 12, color: "rgba(201,169,110,0.5)", textAlign: "center", marginBottom: 20 }}>سجّلي بياناتك ويفعّل حسابك بعد موافقة الإدارة</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <input style={inp} placeholder="الاسم / اسم المعرض *" value={name} onChange={e => setName(e.target.value)} />
              <input style={inp} placeholder="البريد الإلكتروني *" value={email} onChange={e => setEmail(e.target.value)} type="email" />
              <div style={{ position: "relative" }}>
                <input style={inp} placeholder="كلمة المرور *" value={password} onChange={e => setPassword(e.target.value)} type={showPass ? "text" : "password"} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={16} color="rgba(201,169,110,0.5)" /> : <Eye size={16} color="rgba(201,169,110,0.5)" />}
                </button>
              </div>
              <input style={inp} placeholder="رقم الجوال *" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
              <input style={inp} placeholder="رقم الواتساب (اختياري)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} type="tel" />
              <input style={inp} placeholder="المنطقة / المدينة *" value={area} onChange={e => setArea(e.target.value)} />
              <input style={inp} placeholder="حساب الانستقرام (اختياري)" value={instagram} onChange={e => setInstagram(e.target.value)} />

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", fontSize: 13, color: "#E87B6E" }}>⚠️ {error}</div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 0" }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: "#C9A96E", flexShrink: 0 }} />
                <div style={{ textAlign: "right", flex: 1 }}>
                  <span style={{ fontSize: 12, color: "rgba(201,169,110,0.5)" }}>أوافق على </span>
                  <a href="/terms" target="_blank" style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>شروط الاستخدام</a>
                  <span style={{ fontSize: 12, color: "rgba(201,169,110,0.5)" }}> و</span>
                  <a href="/privacy" target="_blank" style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>سياسة الخصوصية</a>
                </div>
              </div>

              <button onClick={handleRegister} disabled={submitting}
                style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 16, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#1A0E02", opacity: submitting ? 0.7 : 1, marginTop: 4 }}>
                {submitting ? "جاري التسجيل..." : "إنشاء الحساب"}
              </button>

              <button onClick={() => { setIsRegister(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "rgba(201,169,110,0.6)", fontFamily: "Tajawal, sans-serif", marginTop: 4 }}>
                عندك حساب؟ <span style={{ color: "#C9A96E", fontWeight: 700 }}>سجّلي الدخول</span>
              </button>
            </div>
          </div>

        ) : (
          /* Login */
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 24, border: "1px solid rgba(201,169,110,0.15)", padding: 28, backdropFilter: "blur(10px)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#FAF7F2", textAlign: "center", marginBottom: 24 }}>تسجيل الدخول</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />

              <div style={{ position: "relative" }}>
                <input style={inp} placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)}
                  type={showPass ? "text" : "password"} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? <EyeOff size={16} color="rgba(201,169,110,0.5)" /> : <Eye size={16} color="rgba(201,169,110,0.5)" />}
                </button>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", fontSize: 13, color: "#E87B6E" }}>⚠️ {error}</div>
              )}

              {/* Terms */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 0" }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: "#C9A96E", flexShrink: 0 }} />
                <div style={{ textAlign: "right", flex: 1 }}>
                  <span style={{ fontSize: 12, color: "rgba(201,169,110,0.5)" }}>أوافق على </span>
                  <a href="/terms" target="_blank" style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>شروط الاستخدام</a>
                  <span style={{ fontSize: 12, color: "rgba(201,169,110,0.5)" }}> و</span>
                  <a href="/privacy" target="_blank" style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>سياسة الخصوصية</a>
                </div>
              </div>

              <button onClick={handleLogin} disabled={submitting || !email || !password || !agreed}
                style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: submitting || !email || !password || !agreed ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 16, background: !email || !password || !agreed ? "rgba(201,169,110,0.1)" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !email || !password || !agreed ? "rgba(201,169,110,0.3)" : "#1A0E02", opacity: submitting ? 0.7 : 1, transition: "all 0.2s", marginTop: 4 }}>
                {submitting ? "جاري الدخول..." : "دخول"}
              </button>

              <button onClick={() => setIsForgot(true)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "rgba(201,169,110,0.5)", fontFamily: "Tajawal, sans-serif", marginTop: 4 }}>
                نسيتِ كلمة المرور؟
              </button>

              <button onClick={() => { setIsRegister(true); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "rgba(201,169,110,0.6)", fontFamily: "Tajawal, sans-serif", marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(201,169,110,0.1)" }}>
                معرِضة جديدة؟ <span style={{ color: "#C9A96E", fontWeight: 700 }}>أنشئي حساب</span>
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "rgba(201,169,110,0.3)" }}>
              حسابك يُفعَّل من قِبَل إدارة درّة
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
