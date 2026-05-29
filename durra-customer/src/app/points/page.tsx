"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function PointsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState("عادي");
  const [history, setHistory] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getDoc(doc(db, "users", user.uid)),
      getDocs(query(collection(db, "points"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))),
    ]).then(([userSnap, pointsSnap]) => {
      if (userSnap.exists()) { setPoints(userSnap.data().points || 0); setLevel(userSnap.data().level || "عادي"); }
      setHistory(pointsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFetching(false);
    });
  }, [user]);

  const nextLevel = level === "عادي" ? { name: "ذهبي ⭐", needed: 500 } : level === "gold" ? { name: "VIP 💎", needed: 1000 } : null;
  const progress = nextLevel ? Math.min((points / nextLevel.needed) * 100, 100) : 100;

  if (fetching) return <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div></div>;

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A0E05, #3D2810)", padding: "56px 20px 28px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8, letterSpacing: 2 }}>رصيد النقاط</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>{points}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>نقطة</div>
        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,169,110,0.15)", borderRadius: 50, padding: "6px 16px" }}>
          <span style={{ fontSize: 13, color: "#C9A96E", fontWeight: 700 }}>
            {level === "vip" ? "💎 VIP" : level === "gold" ? "⭐ ذهبي" : "⚪ عادي"}
          </span>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Progress */}
        {nextLevel && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "18px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>المستوى التالي: {nextLevel.name}</span>
              <span style={{ fontSize: 12, color: "#9B7E60" }}>{points}/{nextLevel.needed}</span>
            </div>
            <div style={{ background: "#F2EDE4", borderRadius: 50, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #C9A96E, #E8D5A3)", borderRadius: 50, transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}

        {/* How to earn */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "18px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#2C1A0A", marginBottom: 14, textAlign: "right" }}>كيف تكسبين نقاط؟</div>
          {[
            { action: "أول تأجير فستان", pts: "+50" },
            { action: "كل تأجير لاحق", pts: "+20" },
            { action: "حجز خدمة", pts: "+15" },
            { action: "كتابة تقييم", pts: "+10" },
            { action: "دعوة صديقة", pts: "+30" },
          ].map(item => (
            <div key={item.action} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F2EDE4" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#A07840" }}>{item.pts}</span>
              <span style={{ fontSize: 13, color: "#2C1A0A" }}>{item.action}</span>
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "18px 20px", boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#2C1A0A", marginBottom: 14 }}>السجل</div>
            {history.map(h => (
              <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F2EDE4" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: h.amount > 0 ? "#065F46" : "#991B1B" }}>{h.amount > 0 ? `+${h.amount}` : h.amount}</span>
                <span style={{ fontSize: 12, color: "#9B7E60" }}>{h.reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}
