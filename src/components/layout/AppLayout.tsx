"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { cn } from "@/lib/utils";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-gray-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <TopNav onToggleMobile={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>

        <footer className="py-4 px-6 text-center text-xs text-gray-400 border-t border-[#E8E6DF] bg-white/50">
          CreatorFlow AI • Smart Automation Platform for Content Creators • v1.0 Production
        </footer>
      </div>
    </div>
  );
};
