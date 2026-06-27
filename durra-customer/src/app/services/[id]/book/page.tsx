"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PaymentMethods, { PayMethod } from "@/components/PaymentMethods";
import { getAuth } from "firebase/auth";
import { ArrowRight } from "lucide-react";

export default function ServiceBookPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [payMethod, setPayMethod] = useState<PayMethod>("paytabs");

  const [provider, setProvider] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading2, setLoading2] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    if (loading || !user?.uid) return;
    setFetching(true);
    Promise.all([
      getDoc(doc(db, "providers", id as string)),
      getDocs(query(collection(db, "providerProducts"), where("providerId", "==", id), where("active", "==", true))),
      getDoc(doc(db, "settings", "payment")),
    ]).then(([provSnap, prodSnap, paySnap]) => {
      if (provSnap.exists()) setProvider({ id: provSnap.id, ...provSnap.data() });
      const prods = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(prods);
      if (prods.length > 0) setSelectedProduct(prods[0]);
      if (paySnap.exists()) {
        const pd = paySnap.data();
        setOnlineEnabled(pd?.onlineEnabled !== false);
        setCodEnabled(pd?.codEnabled !== false);
        if (pd?.onlineEnabled === false && pd?.codEnabled !== false) setPayMethod("cod");
        if (pd?.codEnabled === false && pd?.onlineEnabled !== false) setPayMethod("paytabs");
      }
      const a = getAuth();
      setEmailVerified(a.currentUser?.emailVerified ?? false);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id, user, loading]);

  // للعرض فقط
  const addonsTotal = selectedProduct?.addons
    ? selectedProduct.addons.filter((a: any) => selectedAddons.includes(a.name)).reduce((s: number, a: any) => s + a.price, 0)
    : 0;
  const displayTotal = (selectedProduct?.price || 0) + addonsTotal;

  const toggleAddon = (name: string) => {
    setSelectedAddons(prev => prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]);
  };

  const handleBook = async () => {
    if (!user) { router.push("/auth"); return; }
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
    if (!date || !time || !selectedProduct) { alert("أكملي جميع الحقول"); return; }
    setLoading2(true);
    try {
      const functions = getFunctions();
      const createServiceBooking = httpsCallable(functions, "createServiceBookingSecure");

      const result: any = await createServiceBooking({
        providerId: id,
        productId: selectedProduct.id,
        date, time, notes,
        addons: selectedAddons,
        paymentMethod: payMethod === "cod" ? "cod" : "online",
      });

      const { bookingId, totalPrice: serverTotal } = result.data;

      // الدفع عند الاستلام — انتهينا
      if (payMethod === "cod") {
        router.push("/orders");
        return;
      }

      // الدفع الإلكتروني — جلسة PayTabs (رمز الدولة من رقم الحساب المحفوظ)
      const createSession = httpsCallable(functions, "createPaymentSession");
      const DIAL_TO_ISO: Record<string, string> = { "973": "BH", "966": "SA", "965": "KW", "971": "AE", "974": "QA", "968": "OM" };
      const userDial = (user as any).dialCode || "973";
      const session: any = await createSession({
        bookingId,
        amount: serverTotal,
        customerName: user.displayName,
        customerEmail: user.email,
        customerPhone: user.phone,
        countryCode: userDial,
        country: DIAL_TO_ISO[userDial] || "BH",
        type: "service",
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
      if (msg.includes("غير متاح")) alert("هذا المزوّد غير متاح حالياً");
      else alert("حدث خطأ، حاولي مرة ثانية");
    } finally {
      setLoading2(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #EDE8DF", fontSize: 14,
    fontFamily: "Tajawal, sans-serif", background: "#fff",
    color: "#2C1810", outline: "none", marginBottom: 16,
    textAlign: "right", direction: "rtl",
  };

  if (loading || fetching) return (
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
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #EDE8DF", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ArrowRight size={20} color="#2C1810" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2C1810" }}>تأكيد الحجز</div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #EDE8DF", padding: "16px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", background: "#FAF7F2", flexShrink: 0 }}>
            {provider.logoImage ? <img src={provider.logoImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏪</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1810" }}>{provider.name}</div>
            <div style={{ fontSize: 12, color: "#9B7E60" }}>{provider.area}</div>
          </div>
        </div>

        {products.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#6B5744", fontWeight: 600, marginBottom: 10, textAlign: "right" }}>اختاري الخدمة</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {products.map(p => (
                <div key={p.id} onClick={() => { setSelectedProduct(p); setSelectedAddons([]); }}
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

        {/* الإضافات */}
        {selectedProduct?.addons && selectedProduct.addons.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#6B5744", fontWeight: 600, marginBottom: 10, textAlign: "right" }}>إضافات اختيارية</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedProduct.addons.map((addon: any) => (
                <div key={addon.name} onClick={() => toggleAddon(addon.name)}
                  style={{ background: selectedAddons.includes(addon.name) ? "rgba(201,169,110,0.08)" : "#fff", borderRadius: 14, border: `1.5px solid ${selectedAddons.includes(addon.name) ? "#C9A96E" : "#EDE8DF"}`, padding: "12px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#A07840" }}>+{addon.price} د.ب</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "#2C1810" }}>{addon.name}</span>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${selectedAddons.includes(addon.name) ? "#C9A96E" : "#EDE8DF"}`, background: selectedAddons.includes(addon.name) ? "#C9A96E" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selectedAddons.includes(addon.name) && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, marginBottom: 6, textAlign: "right" }}>تاريخ الموعد</div>
        <input type="date" style={inp} value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />

        <div style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, marginBottom: 6, textAlign: "right" }}>وقت الموعد</div>
        <input type="time" style={inp} value={time} onChange={e => setTime(e.target.value)} />

        <div style={{ fontSize: 12, color: "#6B5744", fontWeight: 600, marginBottom: 6, textAlign: "right" }}>ملاحظات (اختياري)</div>
        <textarea style={{ ...inp, height: 80, resize: "none" }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية..." />

        {selectedProduct && (
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #C9A96E", padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810", marginBottom: 12, textAlign: "right" }}>ملخص الحجز</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#9B7E60" }}>{selectedProduct.price} د.ب</span>
              <span style={{ fontSize: 13, color: "#2C1810" }}>{selectedProduct.name}</span>
            </div>
            {selectedProduct.addons?.filter((a: any) => selectedAddons.includes(a.name)).map((a: any) => (
              <div key={a.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#9B7E60" }}>+{a.price} د.ب</span>
                <span style={{ fontSize: 13, color: "#2C1810" }}>{a.name}</span>
              </div>
            ))}
            {date && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#9B7E60" }}>{new Date(date).toLocaleDateString("ar-BH")}</span>
              <span style={{ fontSize: 13, color: "#2C1810" }}>التاريخ</span>
            </div>}
            {time && <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#9B7E60" }}>{time}</span>
              <span style={{ fontSize: 13, color: "#2C1810" }}>الوقت</span>
            </div>}
            <div style={{ borderTop: "1px solid #EDE8DF", paddingTop: 10, marginTop: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#C9A96E" }}>{displayTotal} د.ب</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1810" }}>الإجمالي</span>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          {onlineEnabled || codEnabled ? (
            <PaymentMethods amount={displayTotal} selected={payMethod} onSelect={setPayMethod} allowCOD={codEnabled} allowOnline={onlineEnabled} />
          ) : (
            <div style={{ padding: 16, borderRadius: 14, background: "#FEF2F2", border: "1px solid #FCA5A5", textAlign: "center", fontSize: 13, color: "#991B1B", fontWeight: 600 }}>الدفع غير متاح حالياً، حاولي لاحقاً</div>
          )}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 20px 28px", background: "rgba(250,247,242,0.97)", borderTop: "1px solid #EDE8DF", backdropFilter: "blur(10px)" }}>
        <button onClick={handleBook} disabled={loading2 || !date || !time || !selectedProduct}
          style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: loading2 || !date || !time ? "not-allowed" : "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !date || !time ? "#EDE8DF" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !date || !time ? "#9B7E60" : "#2C1810", opacity: loading2 ? 0.7 : 1, transition: "all 0.2s", boxShadow: date && time ? "0 4px 16px rgba(201,169,110,0.3)" : "none" }}>
          {loading2 ? "جاري المعالجة..." : payMethod === "cod" ? `تأكيد الحجز${selectedProduct ? ` — ${displayTotal} د.ب` : ""}` : `المتابعة للدفع${selectedProduct ? ` — ${displayTotal} د.ب` : ""}`}
        </button>
      </div>
    </div>
  );
}
