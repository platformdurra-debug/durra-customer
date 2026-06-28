"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

// دول الخليج لرمز الجوال
const GCC = [
  { code: "BH", dial: "973", name: "البحرين", flag: "🇧🇭" },
  { code: "SA", dial: "966", name: "السعودية", flag: "🇸🇦" },
  { code: "KW", dial: "965", name: "الكويت", flag: "🇰🇼" },
  { code: "AE", dial: "971", name: "الإمارات", flag: "🇦🇪" },
  { code: "QA", dial: "974", name: "قطر", flag: "🇶🇦" },
  { code: "OM", dial: "968", name: "عُمان", flag: "🇴🇲" },
];

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [dialCode, setDialCode] = useState("973");
  const [localPhone, setLocalPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push("/auth"); }, [user, authLoading]);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setName(d.displayName || "");
        // استخرج رمز الدولة والرقم المحلي من الرقم الكامل المحفوظ
        const digits = String(d.phone || "").replace(/\D/g, "");
        const dial = GCC.map(g => g.dial).find(dc => digits.startsWith(dc));
        if (dial) { setDialCode(dial); setLocalPhone(digits.slice(dial.length)); }
        else setLocalPhone(digits);
      }
    });
  }, [user]);

  const save = async () => {
    if (!name.trim()) { alert("الاسم مطلوب"); return; }
    if (!user?.uid) return;
    setSaving(true);
    try {
      const cleanPhone = localPhone.replace(/\D/g, "").replace(/^0+/, "");
      const fullPhone = dialCode + cleanPhone;
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name.trim(),
        phone: fullPhone,
      });
      setDone(true);
      setTimeout(() => router.push("/profile"), 1200);
    } catch {
      alert("حدث خطأ، حاولي مرة أخرى");
      setSaving(false);
    }
  };

  const inp = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #EDE8DF", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "#fff", color: "#2C1810", outline: "none" } as const;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "52px 20px 16px", borderBottom: "1px solid #EDE8DF", background: "#fff" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowRight size={20} color="#2C1810" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1810" }}>تعديل بياناتي</div>
      </div>

      <div style={{ padding: "28px 20px", maxWidth: 460, margin: "0 auto" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#2C1810" }}>تم حفظ بياناتك!</div>
          </div>
        ) : (
          <>
            <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6, textAlign: "right" }}>الاسم الكامل</label>
            <input style={{ ...inp, marginBottom: 16 }} value={name} onChange={e => setName(e.target.value)} placeholder="اسمك" />

            <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6, textAlign: "right" }}>رقم الجوال</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <select value={dialCode} onChange={e => setDialCode(e.target.value)}
                style={{ ...inp, width: 130, flexShrink: 0, fontWeight: 700 }}>
                {GCC.map(c => (<option key={c.code} value={c.dial}>{c.flag} +{c.dial}</option>))}
              </select>
              <input style={{ ...inp, flex: 1, direction: "ltr", textAlign: "left" }} value={localPhone} onChange={e => setLocalPhone(e.target.value)} type="tel" placeholder="33445566" />
            </div>

            <div style={{ fontSize: 12, color: "#9B7E60", marginBottom: 24, textAlign: "right" }}>
              البريد الإلكتروني: <span style={{ direction: "ltr", display: "inline-block" }}>{user?.email}</span> (لا يمكن تغييره)
            </div>

            <button onClick={save} disabled={saving}
              style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: saving ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1810", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, opacity: saving ? 0.7 : 1 }}>
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
