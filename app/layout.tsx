import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DatasetProvider } from "@/lib/context/DatasetContext";
import { ToastContainer } from "@/components/ui/toast";
import { APP_CONFIG } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EduInsight AI - Student Completion & Dropout Risk Analytics",
    template: "%s | EduInsight AI",
  },
  description: APP_CONFIG.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-text antialiased font-sans selection:bg-primary-soft selection:text-primary">
        <DatasetProvider>
          {children}
          <ToastContainer />
        </DatasetProvider>
      </body>
    </html>
  );
}
