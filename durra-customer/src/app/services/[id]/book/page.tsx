"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePayTabs } from "@/hooks/usePayTabs";
import { ArrowRight } from "lucide-react";

export default function ServiceBookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { createSession } = usePayTabs();

  const [provider, setProvider] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getDoc(doc(db, "providers", id as string)),
      getDocs(query(collection(db, "providerProducts"), where("providerId", "==", id), where("active", "==", true))),
    ]).then(([provSnap, prodSnap]) => {
      if (provSnap.exists()) setProvider({ id: provSnap.id, ...provSnap.data() });
      const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(prods);
      if (prods.length > 0) setSelectedProduct(prods[0]);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id, user]);

  const handleBook = async () => {
    if (!user) { router.push("/auth"); return; }
    if (!date || !time || !selectedProduct) { alert("أكملي جميع الحقول"); return; }
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "serviceBookings"), {
        customerId: user.uid,
        customerName: user.displayName || "",
        customerEmail: user.email || "",
        customerPhone: user.phone || "",
        providerId: id,
        providerName: provider?.name || "",
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        date,
        time,
        notes,
        totalPrice: selectedProduct.price,
        providerAmount: Math.round(selectedProduct.price * 0.7),
        commission: Math.round(selectedProduct.price * 0.3),
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date(),
      });

      const session = await createSession({
        bookingId: ref.id,
        amount: selectedProduct.price,
        customerName: user.displayName,
        customerEmail: user.email,
        customerPhone: user.phone,
      });

      if (session.redirect_url) {
        window.location.href = session.redirect_url;
      } else {
        router.push("/orders");
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ، حاولي مرة ثانية");
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #EDE8DF", fontSize: 14,
    fontFamily: "Tajawal, sans-serif", background: "#fff",
    color: "#2C1810", outline: "none", marginBottom: 16,
    textAlign: "right", direction: "rtl",
  };

  if (fetching) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  if (!provider) return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: "#9B7E60" }}>المزوّد غير موجود</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 120, background: "#FAF7F2", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Header */}
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #EDE8DF", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowRight size={20} color="#2C1810" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1810" }}>تأكيد الحجز</div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Provider Info */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #EDE8DF", padding: "16px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", background: "#FAF7F2", flexShrink: 0 }}>
            {provider.logoImage
              ? <img src={provider.logoImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏪</div>
            }
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1810" }}>{provider.name}</div>
            <div style={{ fontSize: 12, color: "#9B7E60" }}>{provider.area}</div>
          </div>
        </div>

        {/* Select Service */}
        {products.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#6B5744", fontWeight: 600, marginBottom: 10, textAlign: "right" }}>اختاري الخدمة</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {products.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)}
                  style={{ background: selectedProduct?.id === p.id ? "rgba(201,169,110,0.08)" : "#fff", borderRadius: 16, border: `1.5px solid ${selectedProduct?.id === p.id ? "#C9A96E" : "#EDE8DF"}`, padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#A07840" }}>{p.price} <span style={{ fontSize: 11 }}>د.ب</span></div>
                    {p.duration && <div style={{ fontSize: 11, color: "#9B7E60" }}>{p.duration}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810" }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 11, color: "#9B7E60" }}>{p.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date */}
        <div style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, marginBottom: 6, textAlign: "right" }}>تاريخ الموعد</div>
        <input type="date" style={inp} value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />

        {/* Time */}
        <div style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, marginBottom: 6, textAlign: "right" }}>وقت الموعد</div>
        <input type="time" style={inp} value={time} onChange={e => setTime(e.target.value)} />

        {/* Notes */}
        <div style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, marginBottom: 6, textAlign: "right" }}>ملاحظات (اختياري)</div>
        <textarea style={{ ...inp, height: 80, resize: "none", marginBottom: 16 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية..." />

        {/* Summary */}
        {selectedProduct && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #C9A96E", padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810", marginBottom: 12, textAlign: "right" }}>ملخص الحجز</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#9B7E60" }}>{selectedProduct.price} د.ب</span>
              <span style={{ fontSize: 13, color: "#2C1810" }}>{selectedProduct.name}</span>
            </div>
            {date && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#9B7E60" }}>{new Date(date).toLocaleDateString("ar-BH")}</span>
              <span style={{ fontSize: 13, color: "#2C1810" }}>التاريخ</span>
            </div>}
            {time && <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#9B7E60" }}>{time}</span>
              <span style={{ fontSize: 13, color: "#2C1810" }}>الوقت</span>
            </div>}
            <div style={{ borderTop: "1px solid #EDE8DF", paddingTop: 10, marginTop: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#C9A96E" }}>{selectedProduct.price} د.ب</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1810" }}>الإجمالي</span>
            </div>
          </div>
        )}

        {/* Security note */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "#F0FDF4", border: "1px solid #BBF7D0", marginBottom: 16 }}>
          <span>🔒</span>
          <span style={{ fontSize: 12, color: "#065F46" }}>دفع آمن عبر PayTabs</span>
        </div>
      </div>

      {/* Bottom Button */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px 28px", background: "rgba(250,247,242,0.97)", borderTop: "1px solid #EDE8DF", backdropFilter: "blur(10px)" }}>
        <button onClick={handleBook} disabled={loading || !date || !time || !selectedProduct}
          style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: loading || !date || !time ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !date || !time ? "#EDE8DF" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !date || !time ? "#9B7E60" : "#2C1810", opacity: loading ? 0.7 : 1, transition: "all 0.2s", boxShadow: date && time ? "0 4px 16px rgba(201,169,110,0.3)" : "none" }}>
          {loading ? "جاري التوجيه للدفع..." : `ادفعي الآن${selectedProduct ? ` — ${selectedProduct.price} د.ب` : ""}`}
        </button>
      </div>
    </div>
  );
}
