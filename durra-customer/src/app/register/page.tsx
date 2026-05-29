"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const TYPES = ["مكياج", "صالون", "قاعة", "مصوّر", "ورد وديكور", "كيك وكاتيرينج"];
const PLANS = [
  { id: "free", label: "مجانية", price: "0 د.ب/شهر", desc: "للبدء" },
  { id: "gold", label: "ذهبية", price: "15 د.ب/شهر", desc: "الأكثر شيوعاً ⭐" },
  { id: "vip",  label: "VIP",   price: "35 د.ب/شهر", desc: "للمحترفين 💎" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [area, setArea] = useState("");
  const [plan, setPlan] = useState("free");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [instagram, setInstagram] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid #E8DDD0", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "#fff", color: "#2C1A0A", outline: "none", textAlign: "right", direction: "rtl" };

  const handleSubmit = async () => {
    setLoading(true);
    await addDoc(collection(db, "providerApplications"), {
      name, businessName: business, phone, email, type, area, plan, minPrice, maxPrice, instagram,
      approved: false, createdAt: serverTimestamp(),
    });
    setDone(true);
    setLoading(false);
  };

  if (done) return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: 20 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2C1A0A", marginBottom: 8 }}>تم استلام طلبك!</div>
        <div style={{ fontSize: 13, color: "#9B7E60", marginBottom: 24, lineHeight: 1.7 }}>سنراجع طلبك ونتواصل معك خلال 48 ساعة</div>
        <button onClick={() => router.push("/")} style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", border: "none", borderRadius: 50, padding: "12px 28px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>العودة للرئيسية</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "52px 20px 40px" }}>
      <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style={{ fontSize: 12, color: "#9B7E60" }}>{step > 1 ? "رجوع" : "إلغاء"}</span>
      </button>

      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2C1A0A", textAlign: "center", marginBottom: 6 }}>سجّلي محلك</div>
      <div style={{ fontSize: 12, color: "#9B7E60", textAlign: "center", marginBottom: 24 }}>الخطوة {step} من 3</div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "linear-gradient(90deg, #C9A96E, #E8D5A3)" : "#E8DDD0", transition: "all 0.3s" }} />
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "20px", boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0A", textAlign: "right", marginBottom: 4 }}>معلوماتك الشخصية</div>
            <input style={inp} placeholder="اسمك الكامل" value={name} onChange={e => setName(e.target.value)} />
            <input style={inp} placeholder="اسم المحل" value={business} onChange={e => setBusiness(e.target.value)} />
            <input style={inp} placeholder="رقم الجوال" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <input style={inp} placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} type="email" />
            <button onClick={() => setStep(2)} disabled={!name || !business || !phone || !email}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !name || !business || !phone || !email ? "#EDE4D6" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !name || !business || !phone || !email ? "#9B7E60" : "#2C1A0A", marginTop: 4 }}>
              التالي ←
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0A", textAlign: "right", marginBottom: 4 }}>تفاصيل الخدمة</div>
            <div>
              <div style={{ fontSize: 12, color: "#9B7E60", marginBottom: 8, textAlign: "right" }}>نوع الخدمة</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)} style={{ padding: "7px 14px", borderRadius: 50, border: `1px solid ${type === t ? "#C9A96E" : "#E8DDD0"}`, cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 12, background: type === t ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "#FAF7F2", color: type === t ? "#2C1A0A" : "#9B7E60" }}>{t}</button>
                ))}
              </div>
            </div>
            <input style={inp} placeholder="المنطقة (مثال: المنامة)" value={area} onChange={e => setArea(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input style={inp} placeholder="أقل سعر (د.ب)" value={minPrice} onChange={e => setMinPrice(e.target.value)} type="number" />
              <input style={inp} placeholder="أعلى سعر (د.ب)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} type="number" />
            </div>
            <input style={inp} placeholder="حساب الإنستقرام (اختياري)" value={instagram} onChange={e => setInstagram(e.target.value)} />
            <button onClick={() => setStep(3)} disabled={!type || !area}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !type || !area ? "#EDE4D6" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !type || !area ? "#9B7E60" : "#2C1A0A", marginTop: 4 }}>
              التالي ←
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0A", textAlign: "right", marginBottom: 4 }}>اختاري الباقة</div>
            {PLANS.map(p => (
              <div key={p.id} onClick={() => setPlan(p.id)}
                style={{ borderRadius: 16, border: `2px solid ${plan === p.id ? "#C9A96E" : "#E8DDD0"}`, padding: "14px 18px", cursor: "pointer", background: plan === p.id ? "#FEF9F0" : "#fff", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {plan === p.id && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#A07840" }}>{p.price}</div>
                    <div style={{ fontSize: 11, color: "#9B7E60" }}>{p.desc}</div>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0A" }}>{p.label}</div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#9B7E60", textAlign: "center", padding: "4px 0" }}>الشهر الأول مجاني لجميع الباقات ✨</div>
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? "جاري الإرسال..." : "إرسال الطلب 🎉"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
