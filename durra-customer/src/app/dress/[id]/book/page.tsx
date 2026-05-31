"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dress } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { useAuth } from "@/hooks/useAuth";
import { usePayTabs } from "@/hooks/usePayTabs";
import { ArrowRight } from "lucide-react";

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { createBooking } = useBookingStore();
  const { createSession } = usePayTabs();
  const [dress, setDress] = useState<Dress | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [size, setSize] = useState("");
  const [delivery, setDelivery] = useState(true); // إجباري
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, "dresses", id as string)),
      getDoc(doc(db, "settings", "legal")),
    ]).then(([dressSnap, settingsSnap]) => {
      if (dressSnap.exists()) setDress({ id: dressSnap.id, ...dressSnap.data() } as Dress);
      if (settingsSnap.exists()) {
        setDeliveryPrice(settingsSnap.data()?.deliveryPrice || 0);
        setDepositAmount(settingsSnap.data()?.depositAmount || 0);
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id]);

  const calcDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  };

  const rentalPrice  = dress ? dress.price * calcDays() : 0;
  const totalPrice   = rentalPrice + deliveryPrice + depositAmount;
  const commission   = Math.round(rentalPrice * 0.3);
  const sellerAmount = rentalPrice - commission;

  const handleBook = async () => {
    if (!user) { router.push("/auth"); return; }
    if (!startDate || !endDate || !size) { alert("أكملي جميع الحقول"); return; }
    setLoading(true);
    try {
      const bookingId = await createBooking({
        customerId: user.uid,
        dressId: id as string,
        sellerId: dress!.sellerId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        size,
        rentalPrice,
        deliveryPrice,
        depositAmount,
        totalPrice,
        commission,
        sellerAmount,
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date(),
      });

      const session = await createSession({
        bookingId,
        amount: totalPrice,
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
      alert("حدث خطأ، حاولي مرة ثانية");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #EDE8DF", fontSize: 14, fontFamily: "Tajawal, sans-serif",
    background: "#fff", color: "#2C1810", outline: "none", marginBottom: 16,
  };

  if (fetching) return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--gold)", fontSize: 32 }}>✦</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 120, background: "var(--cream)", fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "52px 20px 16px", borderBottom: "1px solid #EDE8DF", background: "#fff" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowRight size={20} color="#2C1810" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1810" }}>تأكيد الحجز</div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* Dress Info */}
        {dress && (
          <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 20, marginBottom: 20, background: "#fff", border: "1px solid #EDE8DF" }}>
            <img src={dress.images?.[0]} alt={dress.name} style={{ width: 80, height: 96, objectFit: "cover", borderRadius: 12 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1810", marginBottom: 4 }}>{dress.name}</div>
              <div style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>{dress.price} د.ب / يوم</div>
            </div>
          </div>
        )}

        {/* Dates */}
        <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6, textAlign: "right" }}>تاريخ الاستلام</label>
        <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />

        <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6, textAlign: "right" }}>تاريخ الإرجاع</label>
        <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />

        {/* Size */}
        <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6, textAlign: "right" }}>المقاس</label>
        <select style={{ ...inputStyle, textAlign: "right" }} value={size} onChange={e => setSize(e.target.value)}>
          <option value="">اختاري المقاس</option>
          {dress?.size?.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Delivery — إجباري */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE8DF", padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(201,169,110,0.1)", color: "#A07840" }}>إجباري</span>
              <span style={{ fontSize: 14, color: "#C9A96E", fontWeight: 700 }}>{deliveryPrice} د.ب</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810" }}>🚚 التوصيل والاستلام</div>
              <div style={{ fontSize: 11, color: "#9B7E60" }}>توصيل واستلام من موقعك</div>
            </div>
          </div>
        </div>

        {/* Deposit */}
        {depositAmount > 0 && (
          <div style={{ background: "#FEF9EC", borderRadius: 16, border: "1px solid #F5D88A", padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#A07840", fontWeight: 700 }}>{depositAmount} د.ب</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810" }}>🛡️ مبلغ التأمين</div>
                <div style={{ fontSize: 11, color: "#9B7E60" }}>يُسترد عند إرجاع الفستان سليماً</div>
              </div>
            </div>
          </div>
        )}

        {/* Price Summary */}
        {startDate && endDate && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #C9A96E", padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810", marginBottom: 12, textAlign: "right" }}>ملخص السعر</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#A07840", fontWeight: 600 }}>{rentalPrice} د.ب</span>
                <span style={{ fontSize: 13, color: "#9B8577" }}>{dress?.price} د.ب × {calcDays()} أيام</span>
              </div>
              {deliveryPrice > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#A07840", fontWeight: 600 }}>{deliveryPrice} د.ب</span>
                  <span style={{ fontSize: 13, color: "#9B8577" }}>رسوم التوصيل</span>
                </div>
              )}
              {depositAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#A07840", fontWeight: 600 }}>{depositAmount} د.ب</span>
                  <span style={{ fontSize: 13, color: "#9B8577" }}>مبلغ التأمين (مسترد)</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #EDE8DF", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#C9A96E" }}>{totalPrice} د.ب</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1810" }}>الإجمالي</span>
              </div>
              {depositAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>{totalPrice - depositAmount} د.ب</span>
                  <span style={{ fontSize: 12, color: "#9B8577" }}>المبلغ الفعلي (بعد استرداد التأمين)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security note */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "#F0FDF4", border: "1px solid #BBF7D0", marginBottom: 8 }}>
          <span>🔒</span>
          <span style={{ fontSize: 12, color: "#065F46" }}>دفع آمن عبر PayTabs — المبلغ محتجز حتى استلام الفستان</span>
        </div>
      </div>

      {/* Bottom Button */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px 28px", background: "rgba(250,247,242,0.97)", borderTop: "1px solid #EDE8DF", backdropFilter: "blur(10px)" }}>
        <button onClick={handleBook} disabled={loading || !startDate || !endDate || !size}
          style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: loading || !startDate || !endDate || !size ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !startDate || !endDate || !size ? "#EDE8DF" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !startDate || !endDate || !size ? "#9B7E60" : "#2C1810", opacity: loading ? 0.7 : 1, transition: "all 0.2s", boxShadow: startDate && endDate && size ? "0 4px 16px rgba(201,169,110,0.3)" : "none" }}>
          {loading ? "جاري التوجيه للدفع..." : `ادفعي الآن${startDate && endDate ? ` — ${totalPrice} د.ب` : ""}`}
        </button>
      </div>
    </div>
  );
}
