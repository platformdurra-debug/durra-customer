"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const TASKS = [
  { id: "dress",      label: "فستان الزفاف",     icon: "👗" },
  { id: "makeup",     label: "مكياج العروس",     icon: "💄" },
  { id: "salon",      label: "صالون التجميل",    icon: "💇" },
  { id: "hall",       label: "صالة الأفراح",     icon: "🏛" },
  { id: "photographer", label: "المصوّر",        icon: "📸" },
  { id: "flowers",    label: "الورد والديكور",   icon: "🌸" },
  { id: "cake",       label: "الكيك",            icon: "🎂" },
  { id: "invitation", label: "الدعوات",          icon: "✉️" },
];

export default function PlannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [weddingDate, setWeddingDate] = useState("");
  const [budget, setBudget] = useState("");
  const [spent, setSpent] = useState("");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "planners", user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setWeddingDate(d.weddingDate || "");
        setBudget(d.budget || "");
        setSpent(d.spent || "");
        setDone(new Set(d.completedTasks || []));
        if (d.weddingDate) {
          const days = Math.ceil((new Date(d.weddingDate).getTime() - Date.now()) / 86400000);
          setDaysLeft(days);
        }
      }
    });
  }, [user]);

  const handleDateChange = (v: string) => {
    setWeddingDate(v);
    const days = Math.ceil((new Date(v).getTime() - Date.now()) / 86400000);
    setDaysLeft(days);
  };

  const toggleTask = (id: string) => setDone(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await setDoc(doc(db, "planners", user.uid), { weddingDate, budget, spent, completedTasks: Array.from(done) }, { merge: true });
    setSaving(false);
  };

  const remaining = budget && spent ? Number(budget) - Number(spent) : null;
  const progress = done.size / TASKS.length * 100;

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", paddingBottom: 90, fontFamily: "Tajawal, sans-serif", direction: "rtl" }}>
      <div style={{ background: "#fff", padding: "52px 20px 16px", borderBottom: "1px solid #E8DDD0" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", textAlign: "center" }}>📅 مخطط الزفاف</div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Countdown */}
        {daysLeft !== null && (
          <div style={{ background: "linear-gradient(135deg, #1A0E05, #3D2810)", borderRadius: 20, padding: "20px", textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>{daysLeft > 0 ? daysLeft : 0}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{daysLeft > 0 ? "يوم متبقي" : "يوم زفافك! 🎉"}</div>
          </div>
        )}

        {/* Date & Budget */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "18px 20px", marginBottom: 16, boxShadow: "0 2px 8px rgba(44,26,10,0.05)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#9B7E60", marginBottom: 6, textAlign: "right" }}>تاريخ الزفاف</div>
              <input type="date" value={weddingDate} onChange={e => handleDateChange(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E8DDD0", fontFamily: "Tajawal, sans-serif", fontSize: 14, color: "#2C1A0A", background: "#FAF7F2", outline: "none" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: "#9B7E60", marginBottom: 6, textAlign: "right" }}>الميزانية (د.ب)</div>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E8DDD0", fontFamily: "Tajawal, sans-serif", fontSize: 14, color: "#2C1A0A", background: "#FAF7F2", outline: "none", textAlign: "right" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#9B7E60", marginBottom: 6, textAlign: "right" }}>المصروف (د.ب)</div>
                <input type="number" value={spent} onChange={e => setSpent(e.target.value)} placeholder="0"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #E8DDD0", fontFamily: "Tajawal, sans-serif", fontSize: 14, color: "#2C1A0A", background: "#FAF7F2", outline: "none", textAlign: "right" }} />
              </div>
            </div>
            {remaining !== null && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: remaining >= 0 ? "#D1FAE5" : "#FEE2E2" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: remaining >= 0 ? "#065F46" : "#991B1B" }}>{remaining} د.ب</span>
                <span style={{ fontSize: 12, color: remaining >= 0 ? "#065F46" : "#991B1B" }}>المتبقي من الميزانية</span>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "18px 20px", marginBottom: 16, boxShadow: "0 2px 8px rgba(44,26,10,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#C9A96E", fontWeight: 700 }}>{done.size}/{TASKS.length}</span>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#2C1A0A" }}>قائمة المهام</div>
          </div>
          <div style={{ background: "#F2EDE4", borderRadius: 50, height: 6, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #C9A96E, #E8D5A3)", borderRadius: 50, transition: "width 0.3s" }} />
          </div>
          {TASKS.map(task => (
            <div key={task.id} onClick={() => toggleTask(task.id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F2EDE4", cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: done.has(task.id) ? "none" : "2px solid #E8DDD0", background: done.has(task.id) ? "linear-gradient(135deg, #C9A96E, #E8D5A3)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done.has(task.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: done.has(task.id) ? "#9B7E60" : "#2C1A0A", textDecoration: done.has(task.id) ? "line-through" : "none" }}>{task.label}</span>
                <span style={{ fontSize: 20 }}>{task.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#2C1A0A", opacity: saving ? 0.7 : 1 }}>
          {saving ? "جاري الحفظ..." : "حفظ التخطيط"}
        </button>
      </div>
      <Navbar />
    </div>
  );
}
