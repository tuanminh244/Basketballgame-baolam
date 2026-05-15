import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { SessionProvider } from '@/contexts/SessionContext';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Ngăn auto-zoom trên iPhone Safari
};

export const metadata: Metadata = {
  title: 'Family Education Game',
  description: 'Gamified Life Simulator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-200 antialiased">
        {/* Mobile First Shell Constraint */}
        <div className="mx-auto max-w-md min-h-screen bg-gray-50 shadow-sm relative overflow-hidden flex flex-col">
          <AuthProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
