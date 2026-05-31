"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const TYPES = [
  { val: "seller",   label: "معرِضة فساتين",    icon: "👗", desc: "أعرض فساتيني للتأجير" },
  { val: "provider", label: "مزوّد خدمات",       icon: "✨", desc: "أقدم خدمات للعرائس" },
];

const SERVICE_TYPES = [
  "مكياج عروس", "صالون تجميل", "تصوير عرايس",
  "صالة أفراح", "ورد وديكور", "كيك وكاتيرينج",
];

export default function JoinPage() {
  const router = useRouter();
  const [type, setType] = useState<"seller" | "provider" | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!type || !name || !phone || !email || !area) { alert("أكملي جميع الحقول المطلوبة"); return; }
    if (type === "provider" && !serviceType) { alert("حددي نوع الخدمة"); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "providerApplications"), {
        type,
        name,
        phone,
        email,
        area,
        serviceType: type === "provider" ? serviceType : "",
        description,
        instagram,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      // إشعار للأدمن
      await addDoc(collection(db, "notifications"), {
        userId: "admin",
        type: "new_application",
        title: type === "seller" ? "🏪 طلب انضمام معرِضة جديدة" : "✨ طلب انضمام مزوّد جديد",
        body: name + " من " + area + " تقدمت للانضمام",
        read: false,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      alert("حدث خطأ، حاولي مرة أخرى");
    } finally { setSubmitting(false); }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "14px 16px", borderRadius: 14,
    border: "1.5px solid #E8DDD0", fontSize: 14,
    fontFamily: "Tajawal, sans-serif", background: "#FAF7F2",
    color: "#2C1A0A", outline: "none", textAlign: "right", direction: "rtl",
  };

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 8px 32px rgba(201,169,110,0.3)" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2C1A0A", marginBottom: 8, textAlign: "center" }}>تم استلام طلبك! 🎉</div>
      <div style={{ fontSize: 14, color: "#9B7E60", textAlign: "center", lineHeight: 1.8, marginBottom: 32, maxWidth: 300 }}>
        سيتواصل معك فريق درّة خلال 24-48 ساعة على رقم جوالك
      </div>
      <button onClick={() => router.push("/")}
        style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", border: "none", borderRadius: 50, padding: "14px 32px", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
        العودة للرئيسية
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A0E05, #3D2810)", padding: "52px 20px 32px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 40, color: "#C9A96E", marginBottom: 8 }}>درّة</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>انضمي لعائلة درّة</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>منصة تأجير فساتين الزفاف في البحرين</div>
      </div>

      <div style={{ padding: "24px 20px" }}>

        {/* اختيار النوع */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0A", marginBottom: 12, textAlign: "right" }}>كيف تريدين الانضمام؟</div>
          <div style={{ display: "flex", gap: 12 }}>
            {TYPES.map(t => (
              <button key={t.val} onClick={() => setType(t.val as any)}
                style={{ flex: 1, padding: "16px 10px", borderRadius: 18, border: `1.5px solid ${type === t.val ? "#C9A96E" : "#E8DDD0"}`, cursor: "pointer", background: type === t.val ? "rgba(201,169,110,0.08)" : "#fff", textAlign: "center", transition: "all 0.2s" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: type === t.val ? "#A07840" : "#2C1A0A", marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: "#9B7E60" }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {type && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input style={inp} placeholder="الاسم الكامل *" value={name} onChange={e => setName(e.target.value)} />
            <input style={inp} placeholder="رقم الجوال *" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
            <input style={inp} placeholder="البريد الإلكتروني *" value={email} onChange={e => setEmail(e.target.value)} type="email" />
            <input style={inp} placeholder="المنطقة *" value={area} onChange={e => setArea(e.target.value)} />

            {type === "provider" && (
              <div>
                <div style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, marginBottom: 8, textAlign: "right" }}>نوع الخدمة *</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SERVICE_TYPES.map(s => (
                    <button key={s} onClick={() => setServiceType(s)}
                      style={{ padding: "8px 16px", borderRadius: 50, border: `1px solid ${serviceType === s ? "#C9A96E" : "#E8DDD0"}`, cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 600, fontSize: 12, background: serviceType === s ? "rgba(201,169,110,0.1)" : "#fff", color: serviceType === s ? "#A07840" : "#9B7E60", transition: "all 0.2s" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea style={{ ...inp, height: 90, resize: "none" } as React.CSSProperties}
              placeholder={type === "seller" ? "وصف مختصر عن محلك وفساتينك..." : "وصف مختصر عن خدماتك وخبرتك..."}
              value={description} onChange={e => setDescription(e.target.value)} />

            <input style={inp} placeholder="حساب إنستقرام (اختياري)" value={instagram} onChange={e => setInstagram(e.target.value)} />

            {/* Benefits */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8DDD0", padding: "16px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0A", marginBottom: 10, textAlign: "right" }}>
                {type === "seller" ? "مميزات المعرِضة" : "مميزات المزوّد"}
              </div>
              {(type === "seller" ? [
                "عرض فساتينك لآلاف العرائس",
                "نظام حجز وإدارة متكامل",
                "تحويل أرباحك مباشرة لحسابك",
                "باقات اشتراك مرنة",
              ] : [
                "ظهور أمام عرائس البحرين",
                "إدارة طلباتك من مكان واحد",
                "نظام دفع آمن عبر PayTabs",
                "باقات اشتراك مرنة",
              ]).map(b => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 13, color: "#6B5744" }}>{b}</span>
                  <span style={{ color: "#C9A96E", fontSize: 14 }}>✦</span>
                </div>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={submitting || !name || !phone || !email || !area || (type === "provider" && !serviceType)}
              style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 16, opacity: submitting ? 0.7 : 1, boxShadow: "0 4px 16px rgba(201,169,110,0.3)", marginTop: 4 }}>
              {submitting ? "جاري الإرسال..." : "تقديم الطلب ←"}
            </button>

            <div style={{ textAlign: "center", fontSize: 12, color: "#9B7E60" }}>
              سيتواصل معك فريق درّة خلال 24-48 ساعة
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
