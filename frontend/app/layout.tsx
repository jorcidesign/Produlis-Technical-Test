import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/atoms/tooltip";
import { ToastProvider } from "@/components/molecules/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Order Management System",
    template: "%s | OMS",
  },
  description: "Sistema interno de gestión de clientes, productos y órdenes",
};

/**
 * Patrón de caché para futuras llamadas a la API (Next.js App Router):
 *
 * En Server Components:
 *   const data = await fetch(`${process.env.API_URL}/resource`, {
 *     next: { revalidate: 30, tags: ['resource'] },
 *   });
 *
 * En Server Actions tras mutaciones:
 *   import { updateTag } from 'next/cache';
 *   updateTag('customers');
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <TooltipProvider delay={200}>
          {children}
          <ToastProvider />
        </TooltipProvider>
      </body>
    </html>
  );
}
