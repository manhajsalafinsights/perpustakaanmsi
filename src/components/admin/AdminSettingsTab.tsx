"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Users as UsersIcon, Trash2, UserPlus, X, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ConfirmModal from "./ConfirmModal";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_super: boolean;
  created_at: string;
}

export default function AdminSettingsTab({ isSuper }: { isSuper: boolean }) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getHeaders = (headers?: Record<string, string>) => {
    const token = sessionStorage.getItem("admin_token");
    const base: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (headers) Object.assign(base, headers);
    return base;
  };

  const fetchAdmins = async () => {
    const res = await fetch("/api/auth", { headers: getHeaders() });
    if (res.ok) setAdmins(await res.json());
  };

  useEffect(() => {
    if (isSuper) fetchAdmins();
  }, [isSuper]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) return;
    setAdminSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(adminForm),
      });
      if (res.ok) {
        setShowAdminModal(false);
        setAdminForm({ name: "", email: "", password: "" });
        setMessage({ type: "success", text: "Admin berhasil ditambahkan" });
        fetchAdmins();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Gagal menambah admin" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/auth?id=${confirmDelete.id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== confirmDelete.id));
        setMessage({ type: "success", text: "Admin berhasil dihapus" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Gagal menghapus admin" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
          message.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Kelola Admin</h2>
              <p className="text-xs text-muted">{admins.length} admin terdaftar</p>
            </div>
          </div>
          {isSuper && (
            <button
              onClick={() => { setAdminForm({ name: "", email: "", password: "" }); setShowAdminModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Admin
            </button>
          )}
        </div>

        {isSuper && (
          <div className="divide-y divide-border/50">
            {admins.map((admin) => (
              <div key={admin.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${admin.is_super ? "bg-accent/10" : "bg-primary/10"}`}>
                    <UsersIcon className={`w-5 h-5 ${admin.is_super ? "text-accent" : "text-primary"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{admin.name}</p>
                      {admin.is_super && (
                        <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">SUPER ADMIN</span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{admin.email}</p>
                  </div>
                </div>
                {!admin.is_super && (
                  <button onClick={() => setConfirmDelete(admin)} className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-border/50 p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Ganti Password</h3>
          <ChangePasswordForm />
        </div>
      </div>

      {showAdminModal && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setShowAdminModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[60] sm:w-full sm:max-w-md glass rounded-3xl shadow-2xl p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Tambah Admin Baru</h2>
              <button onClick={() => setShowAdminModal(false)} className="w-10 h-10 bg-surface-dark rounded-full flex items-center justify-center hover:bg-border transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nama Admin *</label>
                <input type="text" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Masukkan nama" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                <input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="admin@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password *</label>
                <input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Minimal 6 karakter" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 py-3 bg-surface-dark text-foreground font-medium rounded-2xl hover:bg-border transition-colors">Batal</button>
                <button type="submit" disabled={adminSubmitting} className="flex-1 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {adminSubmitting ? "Menyimpan..." : "Tambah Admin"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Admin"
        message={`Yakin ingin menghapus admin "${confirmDelete?.name}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}
