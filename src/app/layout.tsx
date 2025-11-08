import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalAuthProvider } from "@/components/ConditionalAuthProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pocketoption-m.com - Trading Platform",
  description: "Professional forex trading simulation platform - Pocketoption-m.com",
  themeColor: "#0F1419",
  colorScheme: "dark",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#0F1419" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              color-scheme: dark;
            }
            html, body {
              background-color: #0F1419;
              color: #ffffff;
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0F1419] text-white`}
        style={{ colorScheme: 'dark', backgroundColor: '#0F1419' }}
      >
        <ConditionalAuthProvider>
          {children}
        </ConditionalAuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
              padding: '16px',
              fontSize: '14px',
              maxWidth: '420px',
            },
            success: {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 8000,
              style: {
                background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              style: {
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
              },
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
