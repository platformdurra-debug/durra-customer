"use client";

export type PayMethod = "paytabs" | "cod";

// دول الخليج لاختيار مفتاح الدولة عند الدفع الإلكتروني
export const GCC_COUNTRIES = [
  { code: "BH", dial: "973", name: "البحرين", flag: "🇧🇭" },
  { code: "SA", dial: "966", name: "السعودية", flag: "🇸🇦" },
  { code: "KW", dial: "965", name: "الكويت", flag: "🇰🇼" },
  { code: "AE", dial: "971", name: "الإمارات", flag: "🇦🇪" },
  { code: "QA", dial: "974", name: "قطر", flag: "🇶🇦" },
  { code: "OM", dial: "968", name: "عُمان", flag: "🇴🇲" },
];

interface Props {
  amount: number;
  onSelect: (method: PayMethod) => void;
  allowCOD?: boolean;
  allowOnline?: boolean;
  selected: PayMethod;
}

export default function PaymentMethods({ onSelect, allowCOD = true, allowOnline = true, selected }: Props) {
  const methods: { id: PayMethod; label: string; sub: string; icon: string; show: boolean; bg: string }[] = [
    { id: "paytabs", label: "الدفع الإلكتروني", sub: "بنفت · بطاقة · Apple Pay", icon: "💳", show: allowOnline, bg: "#1A2B4A" },
    { id: "cod",     label: "الدفع عند الاستلام", sub: "نقداً عند استلام الفستان", icon: "💵", show: allowCOD, bg: "#FAF7F2" },
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
            <div style={{ width: 44, height: 44, borderRadius: 12, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {m.icon}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
