"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, LogOut } from "lucide-react";
import Link from "next/link";
import AdminLayout, { type TabId } from "@/components/admin/AdminLayout";
import DashboardTab from "@/components/admin/DashboardTab";
import BooksTab from "@/components/admin/BooksTab";
import KontenTab from "@/components/admin/KontenTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      setIsLoggedIn(true);
      setIsSuper(sessionStorage.getItem("admin_is_super") === "true");
      return;
    }
    const cookies = document.cookie.split("; ").find((c) => c.startsWith("admin_token="));
    if (cookies) {
      const cookieToken = cookies.split("=")[1];
      fetch("/api/auth", {
        headers: { Authorization: `Bearer ${cookieToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data)) {
            sessionStorage.setItem("admin_token", cookieToken);
            setIsLoggedIn(true);
          }
        });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("admin_token", data.token);
        sessionStorage.setItem("admin_is_super", String(data.admin.is_super));
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        setIsLoggedIn(true);
        setIsSuper(data.admin.is_super);
      } else {
        const data = await res.json();
        setLoginError(data.error || "Login gagal");
      }
    } catch {
      setLoginError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_is_super");
    document.cookie = "admin_token=; path=/; max-age=0";
    setIsLoggedIn(false);
    setIsSuper(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
              <p className="text-sm text-muted mt-1">Masuk untuk mengelola perpustakaan</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">{loginError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="admin@perpustakaan.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">Kembali ke Beranda</Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout}>
      <div style={{ display: activeTab === "dashboard" ? "block" : "none" }}><DashboardTab /></div>
      <div style={{ display: activeTab === "buku" ? "block" : "none" }}><BooksTab /></div>
      <div style={{ display: activeTab === "konten" ? "block" : "none" }}><KontenTab isSuper={isSuper} /></div>
      <div style={{ display: activeTab === "admin" ? "block" : "none" }}><AdminSettingsTab isSuper={isSuper} /></div>
    </AdminLayout>
  );
}
