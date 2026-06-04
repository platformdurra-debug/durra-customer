"use client";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════
// مكوّن اختيار طريقة الدفع — جاهز لربط Tap Payments
//
// كيف تربط Tap لاحقاً:
// 1. أضف مفاتيح Tap في البيئة: NEXT_PUBLIC_TAP_PUBLIC_KEY
// 2. في handlePay، استبدل القسم المعلّم بـ [TAP INTEGRATION]
//    باستدعاء Tap (Hosted Checkout أو Card SDK)
// 3. طرق الدفع المفعّلة تُدار من لوحة Tap (مو من هنا)
// ═══════════════════════════════════════════════════════

export type PayMethod = "card" | "applepay" | "googlepay" | "benefit" | "cod";

interface Props {
  amount: number;
  onSelect: (method: PayMethod) => void;
  allowCOD?: boolean;       // السماح بالدفع عند الاستلام
  selected: PayMethod;
}

export default function PaymentMethods({ amount, onSelect, allowCOD = true, selected }: Props) {
  const [isApplePayAvailable, setApplePayAvailable] = useState(false);

  useEffect(() => {
    // Apple Pay يظهر فقط على أجهزة Apple
    if (typeof window !== "undefined" && (window as any).ApplePaySession) {
      setApplePayAvailable(true);
    }
  }, []);

  const methods: { id: PayMethod; label: string; sub: string; icon: string; show: boolean }[] = [
    { id: "card",      label: "بطاقة بنكية",        sub: "Visa · Mastercard",     icon: "💳", show: true },
    { id: "benefit",   label: "بنفت",               sub: "BenefitPay",            icon: "🇧🇭", show: true },
    { id: "applepay",  label: "Apple Pay",          sub: "الدفع بلمسة",           icon: "", show: isApplePayAvailable },
    { id: "googlepay", label: "Google Pay",         sub: "الدفع السريع",          icon: "🅖", show: !isApplePayAvailable },
    { id: "cod",       label: "الدفع عند الاستلام", sub: "نقداً عند استلام الفستان", icon: "💵", show: allowCOD },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1810", marginBottom: 2, textAlign: "right" }}>اختاري طريقة الدفع</div>
      {methods.filter(m => m.show).map(m => (
        <button key={m.id} onClick={() => onSelect(m.id)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: 14, cursor: "pointer",
            border: `1.5px solid ${selected === m.id ? "#C9A96E" : "#EDE8DF"}`,
            background: selected === m.id ? "rgba(201,169,110,0.08)" : "#fff",
            fontFamily: "Tajawal, sans-serif", transition: "all 0.15s",
          }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected === m.id ? "#C9A96E" : "#D5C9B8"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {selected === m.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#C9A96E" }} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1810" }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "#9B8577" }}>{m.sub}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: m.id === "applepay" ? "#000" : m.id === "benefit" ? "#C8102E" : "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, color: "#fff", fontWeight: 800 }}>
              {m.id === "applepay" ? <span style={{ fontSize: 22 }}></span> : m.icon}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
