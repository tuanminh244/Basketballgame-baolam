import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = { title: "Family Game", description: "Staging" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-slate-200 flex justify-center">
        <div className="w-full max-w-md min-h-screen bg-white shadow-xl relative overflow-x-hidden">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
