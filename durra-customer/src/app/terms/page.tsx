"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();
  const [content, setContent] = useState("");

  useEffect(() => {
    getDoc(doc(db, "settings", "legal")).then(snap => {
      if (snap.exists()) setContent(snap.data()?.terms || DEFAULT_TERMS);
      else setContent(DEFAULT_TERMS);
    }).catch(() => setContent(DEFAULT_TERMS));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9B7E60" }}>←</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C1A0A" }}>شروط الاستخدام</div>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 13, color: "#6B5744", lineHeight: 2, whiteSpace: "pre-wrap" }}>{content}</div>
      </div>
    </div>
  );
}

const DEFAULT_TERMS = `مرحباً بك في منصة درّة

١. القبول بالشروط
باستخدامك لمنصة درّة، فإنك توافقين على الالتزام بهذه الشروط والأحكام.

٢. الخدمات المقدمة
تقدم منصة درّة خدمة تأجير فساتين الزفاف والخدمات المرتبطة بها في مملكة البحرين.

٣. حقوق المستخدمة
- الحق في تصفح الفساتين والخدمات المتاحة
- الحق في الحجز والدفع بشكل آمن
- الحق في الإلغاء وفق سياسة الإلغاء المعتمدة

٤. واجبات المستخدمة
- تقديم معلومات صحيحة عند التسجيل
- المحافظة على سرية بيانات الدخول
- الالتزام بمواعيد الاستلام والإرجاع

٥. المسؤولية
درّة وسيط بين المستأجرة والمعرضة، ولا تتحمل مسؤولية أي خلاف يقع بين الطرفين خارج نطاق المنصة.

٦. التعديلات
تحتفظ منصة درّة بحق تعديل هذه الشروط في أي وقت مع إشعار المستخدمات.`;
