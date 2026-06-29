"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
import { Dress } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PaymentMethods, { PayMethod } from "@/components/PaymentMethods";
import { getAuth } from "firebase/auth";
import { ArrowRight } from "lucide-react";

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [payMethod, setPayMethod] = useState<PayMethod>("paytabs");
  const [dress, setDress] = useState<Dress | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weddingDate, setWeddingDate] = useState("");

  const isWedding = dress?.rentalType === "wedding";
  const rentalDays = dress?.rentalDays || (isWedding ? 3 : 1);

  useEffect(() => {
    if (isWedding && weddingDate) {
      const wd = new Date(weddingDate);
      const start = new Date(wd); start.setDate(wd.getDate() - 1);
      const end = new Date(wd); end.setDate(wd.getDate() + 1);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    }
  }, [weddingDate, isWedding]);

  useEffect(() => {
    if (!isWedding && startDate && dress) {
      const s = new Date(startDate);
      const e = new Date(s); e.setDate(s.getDate() + (rentalDays - 1));
      setEndDate(e.toISOString().split("T")[0]);
    }
  }, [startDate, isWedding, dress, rentalDays]);

  const [size, setSize] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  // إعدادات الدفع من الأدمن (تفعيل/إيقاف)
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  // حالة تفعيل البريد
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    Promise.all([
      getDoc(doc(db, "dresses", id as string)),
      getDoc(doc(db, "settings", "legal")),
      getDoc(doc(db, "settings", "payment")),
    ]).then(([dressSnap, settingsSnap, paySnap]) => {
      if (dressSnap.exists()) setDress({ id: dressSnap.id, ...dressSnap.data() } as Dress);
      if (settingsSnap.exists()) {
        setDeliveryPrice(settingsSnap.data()?.deliveryPrice || 0);
        setDepositAmount(settingsSnap.data()?.depositAmount || 0);
      }
      if (paySnap.exists()) {
        const pd = paySnap.data();
        // الافتراضي مفعّل ما لم يُغلق صراحة
        setOnlineEnabled(pd?.onlineEnabled !== false);
        setCodEnabled(pd?.codEnabled !== false);
        // لو الإلكتروني مغلق، حوّلي الاختيار لكاش
        if (pd?.onlineEnabled === false && pd?.codEnabled !== false) setPayMethod("cod");
        if (pd?.codEnabled === false && pd?.onlineEnabled !== false) setPayMethod("paytabs");
      }
      // تحقق من تفعيل البريد
      const a = getAuth();
      setEmailVerified(a.currentUser?.emailVerified ?? false);
      // اجلب العنوان المحفوظ للكستمر
      if (a.currentUser) {
        getDoc(doc(db, "users", a.currentUser.uid)).then(us => {
          if (us.exists() && us.data()?.address) setAddress(us.data()!.address);
        }).catch(() => {});
      }
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id]);

  const calcDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  };

  // للعرض فقط — الحساب الفعلي في السيرفر
  const rentalPrice = dress ? dress.price * calcDays() : 0;
  const totalPrice  = rentalPrice + deliveryPrice + depositAmount;

  const handleBook = async () => {
    if (!user) { router.push("/auth"); return; }
    // حاجز تفعيل البريد
    const a = getAuth();
    if (a.currentUser && !a.currentUser.emailVerified) {
      await a.currentUser.reload();
      if (!a.currentUser.emailVerified) {
        setEmailVerified(false);
        alert("فعّلي بريدك الإلكتروني أولاً لإتمام الحجز");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setEmailVerified(true);
    }
    if (!startDate || !endDate || !size) { alert("أكملي جميع الحقول"); return; }
    if (!address.trim()) { alert("أضيفي عنوان التوصيل"); return; }
    // منع التواريخ الماضية
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(startDate) < today) { alert("لا يمكن اختيار تاريخ في الماضي"); return; }
    if (new Date(endDate) < new Date(startDate)) { alert("تاريخ الإرجاع يجب أن يكون بعد الاستلام"); return; }
    setLoading(true);
    try {
      const functions = getFunctions();
      // احفظي العنوان في بيانات الكستمر (عشان يجي محفوظ المرة الجاية)
      const au = getAuth();
      if (au.currentUser) {
        try { await updateDoc(doc(db, "users", au.currentUser.uid), { address: address.trim() }); } catch {}
      }

      // 1) أنشئي الحجز في السيرفر (يحسب السعر/العمولة)
      const createBooking = httpsCallable(functions, "createBookingSecure");
      const result: any = await createBooking({
        dressId: id as string, startDate, endDate, size, address: address.trim(),
        paymentMethod: payMethod === "cod" ? "cod" : "online",
      });
      const { bookingId, totalPrice: serverTotal } = result.data;

      // 2) الدفع عند الاستلام — انتهينا
      if (payMethod === "cod") {
        router.push("/orders");
        return;
      }

      // 3) الدفع الإلكتروني — جلسة PayTabs (رمز الدولة من رقم الحساب المحفوظ)
      const createSession = httpsCallable(functions, "createPaymentSession");
      // رمز الدولة من حساب العميلة (محفوظ عند التسجيل) → ISO
      // استخرج رمز الدولة من رقم الجوال المحفوظ (يبدأ بمفتاح الدولة)
      const DIAL_TO_ISO: Record<string, string> = { "973": "BH", "966": "SA", "965": "KW", "971": "AE", "974": "QA", "968": "OM" };
      const phoneDigits = String(user.phone || "").replace(/\D/g, "");
      const userDial = ["973","966","965","971","974","968"].find(d => phoneDigits.startsWith(d)) || "973";
      const session: any = await createSession({
        bookingId,
        amount: serverTotal,
        customerName: user.displayName,
        customerEmail: user.email,
        customerPhone: user.phone,
        countryCode: userDial,
        country: DIAL_TO_ISO[userDial] || "BH",
        type: "dress",
      });

      if (session.data?.redirect_url) {
        window.location.href = session.data.redirect_url;
      } else if (session.data?.status === "dev_mode") {
        alert("بوابة الدفع غير مفعّلة بعد. تم حفظ طلبك.");
        router.push("/orders");
      } else {
        alert("تعذّر بدء الدفع، حاولي مرة ثانية");
      }
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("محجوز")) alert("عذراً، الفستان محجوز في هذه الفترة");
      else if (msg.includes("غير متاح")) alert("هذا الفستان غير متاح للحجز حالياً");
      else alert("حدث خطأ، حاولي مرة ثانية");
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

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "52px 20px 16px", borderBottom: "1px solid #EDE8DF", background: "#fff" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowRight size={20} color="#2C1810" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1810" }}>تأكيد الحجز</div>
      </div>

      <div style={{ padding: "20px" }}>

        {dress && (
          <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 20, marginBottom: 20, background: "#fff", border: "1px solid #EDE8DF" }}>
            <img src={dress.images?.[0]} alt={dress.name} style={{ width: 80, height: 96, objectFit: "cover", borderRadius: 12 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1810", marginBottom: 4 }}>{dress.name}</div>
              <div style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>{dress.price} د.ب / يوم</div>
            </div>
          </div>
        )}

        {isWedding ? (
          <>
            <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6, textAlign: "right" }}>تاريخ الزفاف 👰</label>
            <input type="date" style={inputStyle} value={weddingDate} onChange={e => setWeddingDate(e.target.value)} min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} />
            {weddingDate && (
              <div style={{ fontSize: 12, color: "#A07840", background: "rgba(201,169,110,0.08)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "right", lineHeight: 1.8 }}>
                📅 فترة التأجير 3 أيام:<br/>
                الاستلام: {new Date(startDate).toLocaleDateString("ar-BH", { weekday: "long", day: "numeric", month: "long" })}<br/>
                يوم الزفاف: {new Date(weddingDate).toLocaleDateString("ar-BH", { weekday: "long", day: "numeric", month: "long" })}<br/>
                الإرجاع: {new Date(endDate).toLocaleDateString("ar-BH", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            )}
          </>
        ) : (
          <>
            <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6, textAlign: "right" }}>تاريخ الاستلام</label>
            <input type="date" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
            {startDate && endDate && (
              <div style={{ fontSize: 12, color: "#A07840", background: "rgba(201,169,110,0.08)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "right" }}>
                مدة التأجير {rentalDays} {rentalDays === 1 ? "يوم" : "أيام"} · الإرجاع: {new Date(endDate).toLocaleDateString("ar-BH", { day: "numeric", month: "long" })}
              </div>
            )}
          </>
        )}

        <label style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, display: "block", marginBottom: 6, textAlign: "right" }}>المقاس</label>
        <select style={{ ...inputStyle, textAlign: "right" }} value={size} onChange={e => setSize(e.target.value)}>
          <option value="">اختاري المقاس</option>
          {dress?.size?.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <textarea value={address} onChange={e => setAddress(e.target.value)}
          placeholder="عنوان التوصيل (المنطقة، المبنى، الشارع، رقم المنزل...)"
          style={{ ...inputStyle, textAlign: "right", minHeight: 64, resize: "vertical", marginTop: 12 }} />

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

        {/* اختيار طريقة الدفع — يحترم تفعيل/إيقاف الأدمن */}
        <div style={{ marginBottom: 12 }}>
          {onlineEnabled || codEnabled ? (
            <PaymentMethods amount={totalPrice} selected={payMethod} onSelect={setPayMethod}
              allowCOD={codEnabled} allowOnline={onlineEnabled} />
          ) : (
            <div style={{ padding: 16, borderRadius: 14, background: "#FEF2F2", border: "1px solid #FCA5A5", textAlign: "center", fontSize: 13, color: "#991B1B", fontWeight: 600 }}>
              الدفع غير متاح حالياً، حاولي لاحقاً
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px 28px", background: "rgba(250,247,242,0.97)", borderTop: "1px solid #EDE8DF", backdropFilter: "blur(10px)" }}>
        <button onClick={handleBook} disabled={loading || !startDate || !endDate || !size || (!onlineEnabled && !codEnabled)}
          style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: loading || !startDate || !endDate || !size ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !startDate || !endDate || !size ? "#EDE8DF" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !startDate || !endDate || !size ? "#9B7E60" : "#2C1810", opacity: loading ? 0.7 : 1, transition: "all 0.2s", boxShadow: startDate && endDate && size ? "0 4px 16px rgba(201,169,110,0.3)" : "none" }}>
          {loading ? "جاري المعالجة..." : payMethod === "cod" ? `تأكيد الحجز${startDate && endDate ? ` — ${totalPrice} د.ب` : ""}` : `المتابعة للدفع${startDate && endDate ? ` — ${totalPrice} د.ب` : ""}`}
        </button>
      </div>
    </div>
  );
}
