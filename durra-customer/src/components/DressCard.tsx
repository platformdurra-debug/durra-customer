"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Dress } from "@/types";

export default function DressCard({ dress }: { dress: Dress }) {
  const [liked, setLiked] = useState(false);
  return (
    <Link href={`/dress/${dress.id}`}>
      <div className="rounded-2xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-1"
        style={{ background: "#fff", border: "1px solid #EDE8DF" }}>
        <div className="relative">
          <img src={dress.images?.[0]} alt={dress.name} className="w-full object-cover" style={{ aspectRatio: "3/4" }} />
          <button onClick={e => { e.preventDefault(); setLiked(!liked); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.9)" }}>
            <Heart size={14} fill={liked ? "#C9A96E" : "none"} color="#C9A96E" />
          </button>
          {!dress.available && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>محجوز</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1810", marginBottom: 4 }}>{dress.name}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#C9A96E" }}>{dress.price} د.ب</div>
        </div>
      </div>
    </Link>
  );
}
