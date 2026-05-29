"use client";
import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [show, setShow]     = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // لا تعرض لو مثبّت بالفعل
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      // عرض البانر بعد 3 ثواني
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShow(false);
  };

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl shadow-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a0a00, #2c1810)", border: "1px solid rgba(201,169,110,0.3)" }}>
      <div className="flex items-center gap-3 p-4">

        {/* App Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #C9A96E, #E8C992)" }}>
          <span style={{ fontFamily: "Playfair Display, serif", fontSize: 20, color: "#1A0A00", fontStyle: "italic", fontWeight: 700 }}>د</span>
        </div>

        {/* Text */}
        <div className="flex-1">
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
            أضيفي درّة لهاتفك ✨
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            وصول أسرع — مثل أي تطبيق
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setShow(false)}
            style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", padding: "6px 10px", fontFamily: "Tajawal, sans-serif" }}>
            لاحقاً
          </button>
          <button onClick={handleInstall}
            className="px-4 py-2 rounded-xl font-bold"
            style={{ background: "linear-gradient(135deg, #C9A96E, #E8C992)", color: "#1A0A00", fontSize: 12, fontFamily: "Tajawal, sans-serif" }}>
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
