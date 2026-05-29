"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen flex items-center justify-center px-6 text-center"
          style={{ background: "linear-gradient(160deg, #1a0a00, #2c1810)", fontFamily: "Tajawal, sans-serif" }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10 }}>حدث خطأ غير متوقع</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
              نعتذر — تم إبلاغ الفريق التقني تلقائياً
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-full font-bold"
              style={{ background: "linear-gradient(135deg, #C9A96E, #E8C992)", color: "#1A0A00", fontFamily: "Tajawal, sans-serif" }}>
              حاولي مرة ثانية
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
