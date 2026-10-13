"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  LayoutDashboard,
  Compass,
  Video,
  Send,
  BarChart3,
  DollarSign,
  Image as ImageIcon,
  FileText,
  History,
  CheckSquare,
  Calendar,
  Layers,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    fetch("/api/approvals?status=PENDING")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.approvals) {
          setPendingApprovalsCount(data.approvals.length);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  const automations = [
    {
      name: "1. Content Planning",
      href: "/automations/planning",
      icon: Compass,
    },
    {
      name: "2. Video Repurposing",
      href: "/automations/video",
      icon: Video,
    },
    {
      name: "3. Publishing & Scheduling",
      href: "/automations/publishing",
      icon: Send,
    },
    {
      name: "4. Performance Analysis",
      href: "/automations/analytics",
      icon: BarChart3,
    },
    {
      name: "5. Sponsorship & Deals",
      href: "/automations/sponsorships",
      icon: DollarSign,
    },
    {
      name: "6. Thumbnail & Graphics",
      href: "/automations/thumbnails",
      icon: ImageIcon,
    },
    {
      name: "7. Script & Captions",
      href: "/automations/scripts",
      icon: FileText,
    },
  ];

  const secondaryNav = [
    {
      name: "Approval Center",
      href: "/approvals",
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null,
    },
    {
      name: "Automation History",
      href: "/automations/history",
      icon: History,
    },
    {
      name: "Content Calendar",
      href: "/calendar",
      icon: Calendar,
    },
    {
      name: "Integrations",
      href: "/integrations",
      icon: Layers,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const renderNavItem = (item: any) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative group",
          isActive
            ? "bg-[#71A832] text-white shadow-sm font-semibold"
            : "text-gray-700 hover:bg-[#F4F8EC] hover:text-[#45691C]"
        )}
      >
        <Icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-white" : "text-gray-500 group-hover:text-[#71A832]")} />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
        {!isCollapsed && item.badge && (
          <span
            className={cn(
              "ml-auto text-xs px-2 py-0.5 rounded-full font-bold",
              isActive ? "bg-white text-[#71A832]" : "bg-amber-100 text-amber-800"
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#E8E6DF] transition-all duration-300 select-none",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo and Product Title */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#F0EFEA]">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            {isCollapsed ? (
              <BrandLogo collapsed={true} iconSize={36} className="shrink-0" />
            ) : (
              <BrandLogo
                collapsed={false}
                logoWidth={148}
                logoHeight={52}
                className="shrink-0"
              />
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Dashboard Link */}
          <div>
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === "/"
                  ? "bg-[#71A832] text-white shadow-sm font-semibold"
                  : "text-gray-700 hover:bg-[#F4F8EC] hover:text-[#45691C]"
              )}
            >
              <LayoutDashboard className={cn("w-4.5 h-4.5 shrink-0", pathname === "/" ? "text-white" : "text-gray-500")} />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </div>

          {/* 7 Automation Modules */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                7 Automation Modules
              </div>
            )}
            <div className="space-y-1">
              {automations.map(renderNavItem)}
            </div>
          </div>

          {/* Core Workflows */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Workspace Tools
              </div>
            )}
            <div className="space-y-1">
              {secondaryNav.map(renderNavItem)}
            </div>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-[#F0EFEA] bg-[#FAF9F5]">
          <div className="flex items-center justify-between">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 overflow-hidden flex-1 p-1.5 hover:bg-white rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#71A832]/20 border border-[#71A832] flex items-center justify-center text-xs font-bold text-[#45691C] shrink-0">
                AR
              </div>
              {!isCollapsed && (
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-xs font-bold text-gray-900 truncate">Alex Rivera</span>
                  <span className="text-[10px] text-gray-500 truncate">Alex's Studio</span>
                </div>
              )}
            </Link>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
