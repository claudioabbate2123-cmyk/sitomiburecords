"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push("/admin/login");
        return;
      }

      const user = data.session.user;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role ?? null);
    });
  }, []);

  return (
    <main style={styles.page}>
      {/* BOTTONE TORNA ALLA DASHBOARD */}
      <button
        style={styles.dashboardButton}
        onClick={() => router.push("/admin/dashboard")}
      >
        ← Torna alla dashboard
      </button>

      <h1>Dashboard area personale</h1>

      <div style={styles.grid}>
        <Link href="/admin/calendario_personale" style={styles.card}>
          <h2>📅 Calendario personale</h2>
        </Link>
        <Link
          href="/admin/bilancio_mensile_personale"style={styles.card}>
          <h2>💰 Bilancio economico</h2>
        </Link>
        <Link
          href="/admin/monitoraggio_peso"style={styles.card}>
          <h2>⚖️ Monitoraggio peso</h2>
        </Link>
        <Link
          href="/admin/sport"style={styles.card}>
          <h2>🏃Sport</h2>
        </Link>

      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 40,
    background: "#f4f4f4",
    fontFamily: "sans-serif",
    position: "relative",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginTop: 40,
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    textDecoration: "none",
    color: "#000",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  /* ===== NUOVA SEZIONE AZIONI ===== */
  actions: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: "1px solid #ddd",
    display: "flex",
    gap: 16,
    alignItems: "center",
  },

  superAdminButton: {
    background: "linear-gradient(135deg, #0066ff, #0044aa)",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,102,255,0.3)",
  },

  logout: {
    background: "#222",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    opacity: 0.85,
  },

  /* === SOLO AGGIUNTO === */
  dashboardButton: {
    position: "absolute",
    top: 24,
    right: 40,
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
