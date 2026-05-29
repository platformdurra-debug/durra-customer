"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid #E8DDD0", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "#fff", color: "#2C1A0A", outline: "none", textAlign: "right", direction: "rtl" };

  const handleSend = () => {
    if (!name.trim() || !message.trim()) return;
    setSent(true);
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center" }}>تواصل معنا</div>
      </div>

      <div style={{ padding: "24px 20px" }}>
        {/* WhatsApp & Instagram */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <a href="https://wa.me/97366000000" target="_blank" style={{ textDecoration: "none" }}>
            <div style={{ background: "#25D366", borderRadius: 18, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>💬</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>واتساب</div>
            </div>
          </a>
          <a href="https://instagram.com/durrahonline" target="_blank" style={{ textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg, #E1306C, #833AB4)", borderRadius: 18, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>📷</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>إنستقرام</div>
            </div>
          </a>
        </div>

        {/* Form */}
        {sent ? (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0A" }}>تم إرسال رسالتك!</div>
            <div style={{ fontSize: 13, color: "#9B7E60", marginTop: 6 }}>سنتواصل معك قريباً</div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "20px", boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#2C1A0A", marginBottom: 16, textAlign: "right" }}>أرسلي رسالة</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input style={inp} placeholder="اسمك" value={name} onChange={e => setName(e.target.value)} />
              <textarea style={{ ...inp, height: 120, resize: "none" }} placeholder="رسالتك..." value={message} onChange={e => setMessage(e.target.value)} />
              <button onClick={handleSend} disabled={!name || !message}
                style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !name || !message ? "#EDE4D6" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !name || !message ? "#9B7E60" : "#2C1A0A", transition: "all 0.2s" }}>
                إرسال
              </button>
            </div>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}
