import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#1A0A00", borderTop: "1px solid rgba(201,169,110,0.2)", padding: "28px 20px", textAlign: "center", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 22, color: "#C9A96E", fontStyle: "italic", marginBottom: 6 }}>درّة</div>
      <div style={{ fontSize: 11, color: "rgba(201,169,110,0.5)", marginBottom: 16 }}>لتأجير فساتين الزفاف في البحرين</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
        <Link href="/terms" style={{ fontSize: 11, color: "rgba(201,169,110,0.6)", textDecoration: "none" }}>شروط الاستخدام</Link>
        <Link href="/privacy" style={{ fontSize: 11, color: "rgba(201,169,110,0.6)", textDecoration: "none" }}>سياسة الخصوصية</Link>
        <Link href="/cancellation" style={{ fontSize: 11, color: "rgba(201,169,110,0.6)", textDecoration: "none" }}>سياسة الإلغاء</Link>
        <Link href="/contact" style={{ fontSize: 11, color: "rgba(201,169,110,0.6)", textDecoration: "none" }}>تواصل معنا</Link>
        <Link href="/join" style={{ fontSize: 11, color: "rgba(201,169,110,0.6)", textDecoration: "none" }}>انضمي كمعرِضة ✦</Link>
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>© 2025 درّة — جميع الحقوق محفوظة</div>
    </footer>
  );
}
