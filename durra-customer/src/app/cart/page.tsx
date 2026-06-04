"use client";
import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cartStore";
import { usePayTabs } from "@/hooks/usePayTabs";
import { ArrowRight, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeItem, updateItem, clearCart } = useCartStore();
  const { createSession } = usePayTabs();
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState(0);
  const [deposit, setDeposit] = useState(0);

  useEffect(() => {
    getDoc(doc(db, "settings", "legal")).then(snap => {
      if (snap.exists()) { setDelivery(snap.data()?.deliveryPrice || 0); setDeposit(snap.data()?.depositAmount || 0); }
    });
  }, []);

  const calcDays = (s: string, e: string) => {
    if (!s || !e) return 0;
    return Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000));
  };

  const itemTotal = (it: any) => it.pricePerDay * calcDays(it.startDate, it.endDate) + delivery + deposit;
  const grandTotal = items.reduce((sum, it) => sum + itemTotal(it), 0);
  const allDatesSet = items.every(it => it.startDate && it.endDate && it.size);

  const checkout = async () => {
    if (!user) { router.push("/auth"); return; }
    if (!allDatesSet) { alert("أكملي التواريخ والمقاسات لكل الفساتين"); return; }
    setLoading(true);
    try {
      const functions = getFunctions();
      const createCart = httpsCallable(functions, "createCartBookingSecure");
      const result: any = await createCart({
        items: items.map(it => ({ dressId: it.dressId, startDate: it.startDate, endDate: it.endDate, size: it.size })),
      });
      const { cartGroupId, grandTotal: serverTotal } = result.data;

      const session = await createSession({
        bookingId: cartGroupId,
        amount: serverTotal,
        customerName: user.displayName,
        customerEmail: user.email,
        customerPhone: user.phone,
      });

      if (session.redirect_url) {
        clearCart();
        window.location.href = session.redirect_url;
      } else {
        clearCart();
        router.push("/orders");
      }
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("محجوز")) alert(msg);
      else if (msg.includes("غير متاح")) alert(msg);
      else alert("حدث خطأ، حاولي مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", paddingBottom: 140, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "52px 20px 16px", borderBottom: "1px solid #EDE8DF", background: "#fff" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowRight size={20} color="#2C1810" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1810" }}>سلة الحجز ({items.length})</div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#9B7E60" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1810", marginBottom: 6 }}>سلتك فارغة</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>أضيفي فساتين لتأجيرها معاً</div>
          <button onClick={() => router.push("/browse")} style={{ padding: "12px 28px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1810", fontFamily: "Tajawal", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            تصفّحي الفساتين
          </button>
        </div>
      ) : (
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map(it => (
              <div key={it.dressId} style={{ background: "#fff", borderRadius: 18, border: "1px solid #EDE8DF", padding: 14 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <img src={it.image} alt={it.dressName} style={{ width: 70, height: 88, objectFit: "cover", borderRadius: 12, flexShrink: 0 }} />
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810", marginBottom: 3 }}>{it.dressName}</div>
                    <div style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>{it.pricePerDay} د.ب / يوم</div>
                  </div>
                  <button onClick={() => removeItem(it.dressId)} style={{ background: "none", border: "none", cursor: "pointer", alignSelf: "flex-start" }}>
                    <Trash2 size={18} color="#C0392B" />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 10, color: "#9B7E60", display: "block", marginBottom: 2 }}>الاستلام</label>
                    <input type="date" value={it.startDate} min={new Date().toISOString().split("T")[0]}
                      onChange={e => updateItem(it.dressId, { startDate: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #EDE8DF", fontSize: 12, fontFamily: "Tajawal" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: "#9B7E60", display: "block", marginBottom: 2 }}>الإرجاع</label>
                    <input type="date" value={it.endDate} min={it.startDate}
                      onChange={e => updateItem(it.dressId, { endDate: e.target.value })}
                      style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #EDE8DF", fontSize: 12, fontFamily: "Tajawal" }} />
                  </div>
                </div>
                <input value={it.size} onChange={e => updateItem(it.dressId, { size: e.target.value })} placeholder="المقاس"
                  style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #EDE8DF", fontSize: 12, fontFamily: "Tajawal", textAlign: "right" }} />
                {it.startDate && it.endDate && (
                  <div style={{ fontSize: 12, color: "#A07840", fontWeight: 700, textAlign: "left", marginTop: 8 }}>
                    {itemTotal(it)} د.ب
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ position: "fixed", bottom: 70, left: 0, right: 0, padding: "16px 20px", background: "rgba(250,247,242,0.97)", borderTop: "1px solid #EDE8DF", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#C9A96E" }}>{grandTotal} د.ب</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1810" }}>الإجمالي</span>
          </div>
          <button onClick={checkout} disabled={loading || !allDatesSet}
            style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: loading || !allDatesSet ? "not-allowed" : "pointer", fontFamily: "Tajawal", fontWeight: 700, fontSize: 15, background: !allDatesSet ? "#EDE8DF" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !allDatesSet ? "#9B7E60" : "#2C1810" }}>
            {loading ? "جاري التوجيه للدفع..." : `ادفعي الكل — ${grandTotal} د.ب`}
          </button>
        </div>
      )}
      <Navbar />
    </div>
  );
}
