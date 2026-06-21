"use client";
import { LayoutDashboard, BookOpen, MessageSquare, Settings, LogOut } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "buku", label: "Buku", icon: BookOpen },
  { id: "konten", label: "Konten", icon: MessageSquare },
  { id: "admin", label: "Admin", icon: Settings },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface AdminLayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function AdminLayout({ activeTab, onTabChange, onLogout, children }: AdminLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-surface-dark/50 rounded-2xl p-1.5 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-surface shadow-sm text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}
