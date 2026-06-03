"use client";
import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";

export default function ReviewPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading2, setLoading2] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  const handleSubmit = async () => {
    if (!user || rating === 0 || !comment.trim()) return;
    setLoading2(true);
    try {
      const functions = getFunctions();
      const submitReview = httpsCallable(functions, "submitReviewSecure");
      await submitReview({ targetId: id, type: "dress", rating, comment });
      setDone(true);
      setTimeout(() => router.push("/orders"), 2000);
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("بعد إتمام")) alert("يمكنك التقييم فقط بعد إتمام الحجز");
      else if (msg.includes("مسبقاً")) alert("لقد قيّمتِ هذا الفستان مسبقاً");
      else alert("حدث خطأ، حاولي مرة أخرى");
      setLoading2(false);
    }
  };

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100vh", fontFamily: "Tajawal, sans-serif", direction: "rtl", padding: "52px 20px 40px" }}>
      <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7E60" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span style={{ fontSize: 12, color: "#9B7E60" }}>رجوع</span>
      </button>

      {done ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌟</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#2C1A0A", marginBottom: 8 }}>شكراً على تقييمك!</div>
          <div style={{ fontSize: 13, color: "#9B7E60" }}>ربحتِ 10 نقاط ⭐</div>
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#2C1A0A", textAlign: "center", marginBottom: 8 }}>قيّمي تجربتك</div>
          <div style={{ fontSize: 13, color: "#9B7E60", textAlign: "center", marginBottom: 32 }}>رأيك يساعد العرايس الثانية ✨</div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 40, transition: "transform 0.1s", transform: (hover || rating) >= star ? "scale(1.1)" : "scale(1)" }}>
                <span style={{ color: (hover || rating) >= star ? "#F59E0B" : "#E8DDD0" }}>★</span>
              </button>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E8DDD0", padding: "20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(44,26,10,0.06)" }}>
            <div style={{ fontSize: 13, color: "#9B7E60", marginBottom: 10, textAlign: "right" }}>تعليقك</div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="شاركي تجربتك مع هذا الفستان..."
              style={{ width: "100%", height: 120, padding: "12px", borderRadius: 12, border: "1.5px solid #E8DDD0", fontFamily: "Tajawal, sans-serif", fontSize: 14, color: "#2C1A0A", background: "#FAF7F2", outline: "none", resize: "none", textAlign: "right", direction: "rtl" }} />
          </div>

          <button onClick={handleSubmit} disabled={loading2 || rating === 0 || !comment.trim()}
            style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: 15, transition: "all 0.2s", background: rating === 0 || !comment.trim() ? "#EDE4D6" : "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: rating === 0 || !comment.trim() ? "#9B7E60" : "#2C1A0A", opacity: loading2 ? 0.7 : 1 }}>
            {loading2 ? "جاري الإرسال..." : "إرسال التقييم"}
          </button>
        </div>
      )}
    </div>
  );
}
