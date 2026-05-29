"use client";
import { useState } from "react";

interface Props {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
}

export default function SafeImage({ src, alt, className, style, fallback = "👗" }: Props) {
  const [error, setError] = useState(!src);

  if (error || !src) {
    return (
      <div className={className} style={{
        ...style,
        background: "linear-gradient(135deg, #F5F0EB, #EDE8DF)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 40,
      }}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  );
}
