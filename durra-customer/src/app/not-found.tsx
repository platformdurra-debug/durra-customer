import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center"
      style={{ background: "linear-gradient(160deg, #1a0a00, #2c1810)" }}>
      <div>
        <div style={{ fontFamily: "Playfair Display, serif", fontSize: 80, color: "#C9A96E", fontStyle: "italic", lineHeight: 1 }}>
          404
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10, marginTop: 16 }}>
          الصفحة غير موجودة
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 32, lineHeight: 1.8 }}>
          يبدو إن الصفحة اللي تبحثين عنها<br />انتقلت أو لم تعد موجودة
        </div>
        <Link href="/">
          <button className="px-8 py-3 rounded-full font-bold text-white"
            style={{ background: "linear-gradient(135deg, #C9A96E, #E8C992)", color: "#1A0A00", fontFamily: "Tajawal, sans-serif", fontSize: 14 }}>
            العودة للرئيسية
          </button>
        </Link>
      </div>
    </div>
  );
}
