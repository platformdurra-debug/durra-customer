"use client";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Dress } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Upload, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

type Stage = "upload" | "processing" | "result" | "error";

export default function TryOnPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dress, setDress] = useState<Dress | null>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading]);

  useEffect(() => {
    getDoc(doc(db, "dresses", id as string)).then(snap => {
      if (snap.exists()) setDress({ id: snap.id, ...snap.data() } as Dress);
    });
  }, [id]);

  const handlePhotoSelect = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("يرجى اختيار صورة صحيحة"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("الصورة أكبر من 10MB"); return; }
    setUserPhoto(file);
    setUserPhotoUrl(URL.createObjectURL(file));
    setError("");
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res((r.result as string).split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const urlToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return fileToBase64(new File([blob], "dress.jpg", { type: blob.type }));
  };

  const handleTryOn = async () => {
    if (!userPhoto || !dress?.images?.[0]) return;
    setStage("processing");
    setProgress(0);

    const timer = setInterval(() => {
      setProgress(p => p < 85 ? p + Math.random() * 8 : p);
    }, 800);

    try {
      const [personB64, garmentB64] = await Promise.all([
        fileToBase64(userPhoto),
        urlToBase64(dress.images[0]),
      ]);

      // استدعاء آمن عبر Cloud Function — المفتاح في السيرفر
      const functions = getFunctions();
      const fashnTryOn = httpsCallable(functions, "fashnTryOn");
      const res: any = await fashnTryOn({
        modelImage: `data:image/jpeg;base64,${personB64}`,
        garmentImage: `data:image/jpeg;base64,${garmentB64}`,
        category: "dresses",
      });

      const result = res.data?.output;
      if (!result) throw new Error("فشلت عملية التجريب");

      clearInterval(timer);
      setProgress(100);
      setResultUrl(result);
      setStage("result");

    } catch (e: any) {
      clearInterval(timer);
      setError(e.message || "حدث خطأ غير متوقع");
      setStage("error");
    }
  };

  const reset = () => {
    setStage("upload");
    setUserPhoto(null);
    setUserPhotoUrl("");
    setResultUrl("");
    setError("");
    setProgress(0);
  };

  const downloadResult = () => {
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `durra-tryon-${dress?.name || "فستان"}.jpg`;
    a.click();
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a0a00, #2c1810)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#C9A96E", fontSize: 32 }}>✦</div>
    </div>
  );

  return (
    <div className="min-h-screen pb-10" style={{ background: "linear-gradient(160deg, #1a0a00, #2c1810)" }}>

      <div className="flex items-center justify-between px-5 py-5">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
          <ArrowRight size={18} color="#C9A96E" />
        </button>
        <div className="text-center">
          <div style={{ fontSize: 16, fontWeight: 800, color: "#C9A96E" }}>تجريب الفستان</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>بتقنية الذكاء الاصطناعي ✨</div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div className="px-5">
        {dress && (
          <div className="flex gap-3 items-center p-3 rounded-2xl mb-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,169,110,0.2)" }}>
            <img src={dress.images?.[0]} alt={dress.name} className="w-14 h-18 object-cover rounded-xl flex-shrink-0" style={{ height: 70 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{dress.name}</div>
              <div style={{ fontSize: 12, color: "#C9A96E", fontWeight: 600 }}>{dress.price} د.ب/يوم</div>
            </div>
            <div className="mr-auto px-3 py-1 rounded-full" style={{ background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)" }}>
              <span style={{ fontSize: 10, color: "#C9A96E" }}>✦ AI Try-On</span>
            </div>
          </div>
        )}

        {stage === "upload" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>ارفعي صورتك</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.7 }}>
              اختاري صورة واضحة لك — وقوف كامل، إضاءة جيدة، خلفية بسيطة للحصول على أفضل نتيجة
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: "🧍‍♀️", label: "وقوف كامل" },
                { icon: "💡", label: "إضاءة جيدة" },
                { icon: "🤍", label: "خلفية بسيطة" },
              ].map(tip => (
                <div key={tip.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{tip.icon}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{tip.label}</div>
                </div>
              ))}
            </div>

            <div onClick={() => fileInputRef.current?.click()} className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all mb-4"
              style={{ height: userPhotoUrl ? "auto" : 220, background: "rgba(255,255,255,0.04)", border: `2px dashed ${userPhotoUrl ? "#C9A96E" : "rgba(255,255,255,0.15)"}`, padding: userPhotoUrl ? 0 : "40px 20px" }}>
              {userPhotoUrl ? (
                <img src={userPhotoUrl} alt="صورتك" className="w-full rounded-2xl object-cover" style={{ maxHeight: 350 }} />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(201,169,110,0.15)" }}>
                    <Upload size={28} color="#C9A96E" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>انقري لرفع صورتك</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>JPG أو PNG · حتى 10MB</div>
                </>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])} />

            {error && (
              <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <span style={{ fontSize: 13, color: "#FCA5A5" }}>⚠️ {error}</span>
              </div>
            )}

            {userPhotoUrl && (
              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 py-3 rounded-2xl font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontFamily: "Tajawal, sans-serif" }}>تغيير الصورة</button>
                <button onClick={handleTryOn} className="flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C9A96E, #E8C992)", color: "#1A0A00", fontFamily: "Tajawal, sans-serif" }}>
                  <Sparkles size={16} />جرّبي الفستان ✨
                </button>
              </div>
            )}

            {!userPhotoUrl && (
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C9A96E, #E8C992)", color: "#1A0A00", fontFamily: "Tajawal, sans-serif" }}>
                <Upload size={18} />ارفعي صورتك
              </button>
            )}
          </div>
        )}

        {stage === "processing" && (
          <div className="text-center py-10">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="absolute inset-0 w-full h-full" style={{ animation: "spin 2s linear infinite" }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(201,169,110,0.15)" strokeWidth="4" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#C9A96E" strokeWidth="4" strokeDasharray={`${progress * 2.76} 276`} strokeLinecap="round" transform="rotate(-90 50 50)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><div style={{ fontSize: 28 }}>✨</div></div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>جاري التجريب...</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>الذكاء الاصطناعي يضع الفستان عليك</div>
            <div className="rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.1)", height: 6 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #C9A96E, #E8C992)", borderRadius: 999, transition: "width .5s ease" }} />
            </div>
            <div style={{ fontSize: 12, color: "rgba(201,169,110,0.7)" }}>{Math.round(progress)}%</div>
            <div className="mt-6 flex flex-col gap-2">
              {["تحليل صورتك...", "تجهيز الفستان...", "دمج الصور بالذكاء الاصطناعي...", "تحسين النتيجة..."].map((step, i) => (
                <div key={step} className="flex items-center gap-3 px-4 py-2 rounded-xl text-right" style={{ background: progress > i * 25 ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.03)", opacity: progress > i * 20 ? 1 : 0.3 }}>
                  <span style={{ fontSize: 14 }}>{progress > (i + 1) * 22 ? "✓" : "⏳"}</span>
                  <span style={{ fontSize: 12, color: progress > (i + 1) * 22 ? "#C9A96E" : "rgba(255,255,255,0.5)" }}>{step}</span>
                </div>
              ))}
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {stage === "result" && (
          <div>
            <div className="rounded-2xl overflow-hidden mb-4 relative">
              <img src={resultUrl} alt="نتيجة التجريب" className="w-full" style={{ borderRadius: 16 }} />
              <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full" style={{ background: "rgba(201,169,110,0.9)", backdropFilter: "blur(4px)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#1A0A00" }}>✨ AI Try-On</span>
              </div>
            </div>
            {userPhotoUrl && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl overflow-hidden">
                  <div className="text-center py-1" style={{ background: "rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>قبل</div>
                  <img src={userPhotoUrl} className="w-full object-cover" style={{ height: 150 }} />
                </div>
                <div className="rounded-xl overflow-hidden">
                  <div className="text-center py-1" style={{ background: "rgba(201,169,110,0.2)", fontSize: 11, color: "#C9A96E" }}>بعد ✨</div>
                  <img src={resultUrl} className="w-full object-cover" style={{ height: 150 }} />
                </div>
              </div>
            )}
            {false && (
              <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <div style={{ fontSize: 12, color: "#F59E0B" }}>⚠️ وضع التطوير — خدمة التجريب قيد الإعداد</div>
              </div>
            )}
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>يعجبك الفستان؟ 💎</div>
            <div className="flex flex-col gap-3">
              <Link href={`/dress/${id}/book`}>
                <button className="w-full py-4 rounded-2xl font-bold text-lg" style={{ background: "linear-gradient(135deg, #C9A96E, #E8C992)", color: "#1A0A00", fontFamily: "Tajawal, sans-serif" }}>احجزي الفستان الآن ←</button>
              </Link>
              <button onClick={downloadResult} className="w-full py-3 rounded-2xl font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: "Tajawal, sans-serif" }}>📥 حفظ الصورة</button>
              <button onClick={reset} className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontFamily: "Tajawal, sans-serif" }}>
                <RefreshCw size={14} />جرّبي صورة ثانية
              </button>
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="text-center py-10">
            <div style={{ fontSize: 52, marginBottom: 16 }}>😕</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>حدث خطأ</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{error}</div>
            <div className="rounded-xl p-3 mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ fontSize: 12, color: "#FCA5A5", lineHeight: 1.7 }}>
                حدثت مشكلة في خدمة التجريب، حاولي مرة أخرى<br />
                أو تحققي من اتصالك بالإنترنت
              </div>
            </div>
            <button onClick={reset} className="px-8 py-3 rounded-full font-bold" style={{ background: "linear-gradient(135deg, #C9A96E, #E8C992)", color: "#1A0A00", fontFamily: "Tajawal, sans-serif" }}>حاولي مرة ثانية</button>
          </div>
        )}
      </div>
    </div>
  );
}
