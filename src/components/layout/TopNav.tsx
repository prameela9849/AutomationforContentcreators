"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  CheckSquare,
  Menu,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface TopNavProps {
  onToggleMobile: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleMobile }) => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Derive page title from pathname
  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard Overview";
      case "/automations/planning":
        return "Automated Content Planning";
      case "/automations/video":
        return "Video Editing & Repurposing";
      case "/automations/publishing":
        return "Automatic Publishing & Scheduling";
      case "/automations/analytics":
        return "Performance Analysis";
      case "/automations/sponsorships":
        return "Sponsorship & Brand Deal Management";
      case "/automations/thumbnails":
        return "Thumbnail & Graphic Creation";
      case "/automations/scripts":
        return "Script, Caption & Post Generation";
      case "/approvals":
        return "Human Approval Center";
      case "/automations/history":
        return "Automation History & Run Monitoring";
      case "/calendar":
        return "Visual Content Calendar";
      case "/integrations":
        return "Platform & AI Integrations";
      case "/settings":
        return "Settings & Brand Kit";
      default:
        return "CreatorFlow AI Workspace";
    }
  };

  // Fetch notifications
  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
  }, [pathname]);

  // Handle Search Query
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setSearchResults(data.results || []);
              setShowSearchResults(true);
            }
          })
          .catch(() => {})
          .finally(() => setIsSearching(false));
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllNotificationsRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-[#E8E6DF]">
      {/* Left: Mobile Menu + Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Link href="/" className="hover:text-gray-700">CreatorFlow</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#71A832] font-semibold">Active Workspace</span>
          </div>
          <h1 className="text-base md:text-lg font-bold text-gray-900 tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Search, Approvals Quick Link, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div ref={searchRef} className="relative hidden md:block w-64 lg:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content, campaigns, runs..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF9F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71A832] focus:bg-white text-gray-800 transition-all"
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-xs text-gray-500 text-center">
                  No matching records found for "{searchQuery}".
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setShowSearchResults(false)}
                      className="block p-3 hover:bg-[#F4F8EC] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate">{item.title}</span>
                        <span className="text-[10px] uppercase font-bold text-[#71A832]">{item.type}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.subtitle}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Pending Approvals Link */}
        <Link
          href="/approvals"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-[#FAF9F5] hover:bg-[#F4F8EC] hover:text-[#45691C] border border-gray-200 rounded-lg transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5 text-[#71A832]" />
          <span className="hidden sm:inline">Approvals</span>
        </Link>

        {/* Real Notification Bell with Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="flex items-center justify-between p-3.5 border-b border-gray-100 bg-[#FAF9F5]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 font-bold bg-[#71A832] text-white rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#71A832] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || "/approvals"}
                      onClick={() => setShowNotifications(false)}
                      className={`block p-3 text-xs transition-colors ${
                        !n.read ? "bg-[#F4F8EC]/60 hover:bg-[#F4F8EC]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{n.title}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1 leading-snug">{n.message}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <Link
          href="/settings"
          className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#71A832] text-white text-xs font-bold flex items-center justify-center">
            AR
          </div>
        </Link>
      </div>
    </header>
  );
};
