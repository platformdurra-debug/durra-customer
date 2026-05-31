"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function CancellationPage() {
  const router = useRouter();
  const [content, setContent] = useState("");

  useEffect(() => {
    getDoc(doc(db, "settings", "legal")).then(snap => {
      if (snap.exists()) setContent(snap.data()?.cancellation || DEFAULT_CANCELLATION);
      else setContent(DEFAULT_CANCELLATION);
    }).catch(() => setContent(DEFAULT_CANCELLATION));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9B7E60" }}>←</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#2C1A0A" }}>سياسة الإلغاء والاسترجاع</div>
      </div>
      <div style={{ padding: "24px 20px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 13, color: "#6B5744", lineHeight: 2, whiteSpace: "pre-wrap" }}>{content}</div>
      </div>
    </div>
  );
}

const DEFAULT_CANCELLATION = `سياسة الإلغاء والاسترجاع — منصة درّة

١. إلغاء حجز الفستان
- الإلغاء قبل ٧ أيام أو أكثر: استرداد كامل المبلغ
- الإلغاء قبل ٣-٦ أيام: استرداد ٥٠٪ من المبلغ
- الإلغاء قبل أقل من ٣ أيام: لا يوجد استرداد

٢. إلغاء حجز الخدمات
- الإلغاء قبل ٤٨ ساعة أو أكثر: استرداد كامل المبلغ
- الإلغاء قبل أقل من ٤٨ ساعة: استرداد ٥٠٪ من المبلغ

٣. التأمين
- يُسترد مبلغ التأمين كاملاً عند إعادة الفستان بحالة جيدة
- يُخصم من التأمين قيمة أي أضرار أو تلف

٤. التوصيل
- رسوم التوصيل غير قابلة للاسترداد في حال الإلغاء بعد التوصيل

٥. طريقة الاسترداد
- يتم الاسترداد على نفس وسيلة الدفع خلال ٥-٧ أيام عمل

٦. كيفية الإلغاء
يمكنك إلغاء حجزك من صفحة "طلباتي" أو التواصل معنا مباشرة.`;
