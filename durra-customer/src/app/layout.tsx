import type { Metadata, Viewport } from "next";
import "./globals.css";
import CartFab from "@/components/CartFab";

export const metadata: Metadata = {
  title: { default: "درّة — لتأجير فساتين الزفاف", template: "%s | درّة" },
  description: "المنصة الأولى في البحرين لتأجير فساتين الزفاف وخدمات العروس الشاملة",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "درّة" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAF7F2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="درّة" />
      </head>
      <body>
        {children}
        <CartFab />
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`
        }} />
      </body>
    </html>
  );
}
