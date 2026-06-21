"use client";
import { useState, useEffect } from "react";
import { BookOpen, Users } from "lucide-react";
import { StatsSkeleton } from "@/components/Skeleton";

interface DashboardData {
  totalBooks: number;
  totalVisitors: number;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [booksRes, visitorRes] = await Promise.all([
          fetch("/api/books?admin=true&page=1&limit=1"),
          fetch("/api/visitor"),
        ]);
        let totalBooks = 0;
        if (booksRes.ok) {
          const json = await booksRes.json();
          totalBooks = json.total || (Array.isArray(json) ? json.length : 0);
        }
        let totalVisitors = 0;
        if (visitorRes.ok) {
          const json = await visitorRes.json();
          totalVisitors = 5000000 + (json.count || 0);
        }
        setData({ totalBooks, totalVisitors });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <StatsSkeleton />;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="glass rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">Total Buku</p>
            <p className="text-2xl font-bold text-foreground">
              {data?.totalBooks ?? 0}
            </p>
          </div>
        </div>
      </div>
      <div className="glass rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted">Total Pengunjung</p>
            <p className="text-2xl font-bold text-foreground">
              {(data?.totalVisitors ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
