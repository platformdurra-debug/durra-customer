"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const [content, setContent] = useState("");

  useEffect(() => {
    getDoc(doc(db, "settings", "legal")).then(snap => {
      if (snap.exists()) setContent(snap.data()?.privacy || DEFAULT_PRIVACY);
      else setContent(DEFAULT_PRIVACY);
    }).catch(() => setContent(DEFAULT_PRIVACY));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9B7E60" }}>←</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C1A0A" }}>سياسة الخصوصية</div>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 13, color: "#6B5744", lineHeight: 2, whiteSpace: "pre-wrap" }}>{content}</div>
      </div>
    </div>
  );
}

const DEFAULT_PRIVACY = `سياسة الخصوصية — منصة درّة

١. البيانات التي نجمعها
- الاسم والبريد الإلكتروني ورقم الجوال عند التسجيل
- بيانات الحجوزات والمدفوعات
- بيانات الاستخدام لتحسين تجربتك

٢. كيف نستخدم بياناتك
- إتمام عمليات الحجز والدفع
- إرسال إشعارات متعلقة بطلباتك
- تحسين خدماتنا وتخصيص تجربتك

٣. حماية البيانات
نستخدم أحدث تقنيات التشفير لحماية بياناتك. لا نشارك بياناتك مع أطراف ثالثة إلا بموافقتك أو بموجب القانون.

٤. ملفات الارتباط (Cookies)
نستخدم ملفات الارتباط لتحسين تجربة الاستخدام والحفاظ على جلسة تسجيل الدخول.

٥. حقوقك
- طلب الاطلاع على بياناتك
- طلب تصحيح أو حذف بياناتك
- سحب موافقتك في أي وقت

٦. التواصل
لأي استفسار بخصوص خصوصيتك، تواصلي معنا عبر صفحة "تواصل معنا".`;
