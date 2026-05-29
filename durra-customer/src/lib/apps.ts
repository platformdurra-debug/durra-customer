// ربط البوابات ببعض
// كل URL يتحدد حسب البيئة (development vs production)

const isDev = process.env.NODE_ENV === "development";

export const APPS = {
  customer:  isDev ? "http://localhost:3000" : (process.env.NEXT_PUBLIC_CUSTOMER_URL  || "https://durrahonline.com"),
  seller:    isDev ? "http://localhost:3001" : (process.env.NEXT_PUBLIC_SELLER_URL    || "https://seller.durrahonline.com"),
  provider:  isDev ? "http://localhost:3002" : (process.env.NEXT_PUBLIC_PROVIDER_URL  || "https://provider.durrahonline.com"),
  admin:     isDev ? "http://localhost:3003" : (process.env.NEXT_PUBLIC_ADMIN_URL     || "https://admin.durrahonline.com"),
  warehouse: isDev ? "http://localhost:3004" : (process.env.NEXT_PUBLIC_WAREHOUSE_URL || "https://warehouse.durrahonline.com"),
} as const;

// التوجيه حسب الدور
export function getAppForRole(role: string): string {
  switch (role) {
    case "seller":    return APPS.seller;
    case "provider":  return APPS.provider;
    case "admin":     return APPS.admin;
    case "warehouse": return APPS.warehouse;
    default:          return APPS.customer;
  }
}

// روابط سريعة بين البوابات
export function goToApp(app: keyof typeof APPS, path = "/") {
  if (typeof window !== "undefined") {
    window.location.href = `${APPS[app]}${path}`;
  }
}
