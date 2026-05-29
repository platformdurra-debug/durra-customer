export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--cream)" }}>
      <div className="flex flex-col items-center gap-4">
        <div style={{
          fontFamily: "Playfair Display, serif",
          fontSize: 36, color: "#C9A96E",
          fontStyle: "italic",
          animation: "pulse 1.5s ease-in-out infinite",
        }}>
          درّة
        </div>
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#C9A96E", opacity: 0.4,
              animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes bounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-6px);opacity:1} }
      `}</style>
    </div>
  );
}
