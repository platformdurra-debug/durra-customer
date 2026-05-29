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
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "dresses", id as string)).then(snap => {
      if (snap.exists()) setDress({ id: snap.id, ...snap.data() } as Dress);
      setFetching(false);
    });
  }, [id]);

  const calcDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  };

  const totalPrice  = dress ? dress.price * calcDays() : 0;
  const commission  = Math.round(totalPrice * 0.3);
  const sellerAmount = totalPrice - commission;

  const handleBook = async () => {
    if (!user) { router.push("/auth"); return; }
    if (!startDate || !endDate || !size) { alert("أكملي جميع الحقول"); return; }
    setLoading(true);
    try {
      // أنشئ الحجز أولاً
      const bookingId = await createBooking({
        customerId: user.uid,
        dressId: id as string,
        sellerId: dress!.sellerId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice, commission, sellerAmount,
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date(),
      });

      // حاولي إنشاء جلسة PayTabs
      const session = await createSession({
        bookingId,
        amount: totalPrice,
        customerName: user.displayName,
        customerEmail: user.email,
        customerPhone: user.phone,
      });

      if (session.redirect_url) {
        // وجّهي للدفع
        window.location.href = session.redirect_url;
      } else {
        // وضع التطوير أو PayTabs غير مضبوط
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

  if (fetching) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}><div style={{ color: "var(--gold)", fontSize: 32 }}>✦</div></div>;

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--cream)" }}>
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid #EDE8DF", background: "#fff" }}>
        <button onClick={() => router.back()}><ArrowRight size={20} color="#2C1810" /></button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1810" }}>تأكيد الحجز</div>
      </div>

      <div className="px-5 py-5">
        {dress && (
          <div className="flex gap-3 p-4 rounded-2xl mb-5" style={{ background: "#fff", border: "1px solid #EDE8DF" }}>
            <img src={dress.images?.[0]} alt={dress.name} className="w-20 h-24 object-cover rounded-xl" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1810", marginBottom: 4 }}>{dress.name}</div>
              <div style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>{dress.price} د.ب / يوم</div>
            </div>
          </div>
        )}

        <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6 }}>تاريخ الاستلام</label>
        <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />

        <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6 }}>تاريخ الإرجاع</label>
        <input type="date" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />

        <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6 }}>المقاس</label>
        <select style={inputStyle} value={size} onChange={e => setSize(e.target.value)}>
          <option value="">اختاري المقاس</option>
          {dress?.size?.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {startDate && endDate && (
          <div className="rounded-2xl p-4 mb-5" style={{ background: "#fff", border: "1.5px solid #C9A96E" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810", marginBottom: 12 }}>ملخص السعر</div>
            <div className="flex justify-between mb-2">
              <span style={{ fontSize: 13, color: "#9B8577" }}>{dress?.price} د.ب × {calcDays()} أيام</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{totalPrice} د.ب</span>
            </div>
            <div style={{ borderTop: "1px solid #EDE8DF", paddingTop: 10, marginTop: 10 }}>
              <div className="flex justify-between">
                <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1810" }}>الإجمالي</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#C9A96E" }}>{totalPrice} د.ب</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <span>🔒</span>
          <span style={{ fontSize: 12, color: "#065F46" }}>دفع آمن عبر PayTabs — المبلغ محتجز حتى استلام الفستان</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3" style={{ background: "var(--cream)", borderTop: "1px solid #EDE8DF" }}>
        <button onClick={handleBook} disabled={loading} className="w-full py-4 rounded-2xl font-bold text-white text-base"
          style={{ background: loading ? "#9B8577" : "linear-gradient(135deg, #C9A96E, #E8C992)", fontFamily: "Tajawal, sans-serif" }}>
          {loading ? "جاري التوجيه للدفع..." : `ادفعي الآن — ${totalPrice} د.ب`}
        </button>
      </div>
    </div>
  );
}
