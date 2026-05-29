"use client";
import { useState } from "react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const inp: React.CSSProperties = { width: "100%", padding: "13px 16px", borderRadius: 14, border: "1.5px solid #E8DDD0", fontSize: 14, fontFamily: "Tajawal, sans-serif", background: "#fff", color: "#2C1A0A", outline: "none", textAlign: "right", direction: "rtl" };

  const handleSubmit = async () => {
    if (!user?.email || !current || !newPass || newPass !== confirm) { setError("تأكدي من تطابق كلمتي المرور"); return; }
    if (newPass.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setLoading(true); setError("");
    try {
      const cred = EmailAuthProvider.credential(user.email, current);
      await reauthenticateWithCredential(user as any, cred);
      await updatePassword(user as any, newPass);
      setDone(true);
      setTimeout(() => router.push("/profile"), 2000);
    } catch (e: any) {
      setError("كلمة المرور الحالية غير صحيحة");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "52px 20px 40px" }}>
      <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style={{ fontSize: 12, color: "#9B7E60" }}>رجوع</span>
      </button>

      {done ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A" }}>تم تغيير كلمة المرور!</div>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2C1A0A", textAlign: "center", marginBottom: 28 }}>تغيير كلمة المرور</div>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "20px", boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <input style={inp} type={showCurrent ? "text" : "password"} placeholder="كلمة المرور الحالية" value={current} onChange={e => setCurrent(e.target.value)} />
                <button onClick={() => setShowCurrent(!showCurrent)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  {showCurrent ? <EyeOff size={16} color="#9B7E60" /> : <Eye size={16} color="#9B7E60" />}
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <input style={inp} type={showNew ? "text" : "password"} placeholder="كلمة المرور الجديدة" value={newPass} onChange={e => setNewPass(e.target.value)} />
                <button onClick={() => setShowNew(!showNew)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  {showNew ? <EyeOff size={16} color="#9B7E60" /> : <Eye size={16} color="#9B7E60" />}
                </button>
              </div>
              <input style={inp} type="password" placeholder="تأكيد كلمة المرور الجديدة" value={confirm} onChange={e => setConfirm(e.target.value)} />
              {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#DC2626", textAlign: "right" }}>⚠️ {error}</div>}
              <button onClick={handleSubmit} disabled={loading || !current || !newPass || !confirm}
                style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, background: !current || !newPass || !confirm ? "#EDE4D6" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: !current || !newPass || !confirm ? "#9B7E60" : "#2C1A0A", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
