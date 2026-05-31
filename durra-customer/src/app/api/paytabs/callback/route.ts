import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tran_ref, payment_result, cart_id } = body;
    // cart_id = bookingId
    const bookingId = cart_id;
    const isSuccess = payment_result?.response_status === "A";

    if (!bookingId) return NextResponse.json({ error: "missing bookingId" }, { status: 400 });

    // Try bookings first, then serviceBookings
    const bookingRef = doc(db, "bookings", bookingId);
    const serviceRef = doc(db, "serviceBookings", bookingId);

    const [bookingSnap, serviceSnap] = await Promise.all([
      getDoc(bookingRef),
      getDoc(serviceRef),
    ]);

    if (bookingSnap.exists()) {
      await updateDoc(bookingRef, {
        paymentStatus: isSuccess ? "held" : "failed",
        status: isSuccess ? "confirmed" : "cancelled",
        tranRef: tran_ref || "",
        updatedAt: new Date(),
      });
    } else if (serviceSnap.exists()) {
      await updateDoc(serviceRef, {
        paymentStatus: isSuccess ? "held" : "failed",
        status: isSuccess ? "confirmed" : "cancelled",
        tranRef: tran_ref || "",
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PayTabs callback error:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
