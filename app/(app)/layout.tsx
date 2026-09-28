"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { FileUploadModal } from "@/components/shared/FileUpload";
import { useDataset } from "@/lib/context/DatasetContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { isUploadModalOpen, setIsUploadModalOpen } = useDataset();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text">
      {/* Desktop Sidebar: static and fixed to viewport */}
      <Sidebar className="hidden lg:flex shrink-0 h-screen" />

      {/* Mobile Drawer (visible when triggered) */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (independently scrollable) */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-y-auto">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 bg-gradient-to-b from-blue-50/20 via-transparent to-transparent p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global CSV Upload Dialog */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
