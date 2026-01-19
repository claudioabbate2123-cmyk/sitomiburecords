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
      <h1>Dashboard Amministratore</h1>

      <div style={styles.grid}>
        <Link href="/admin/eventi" style={styles.card}>
          <h2>📅 Eventi</h2>
          <p>Crea e gestisci eventi</p>
        </Link>

        <Link href="/admin/inventario" style={styles.card}>
          <h2>📦 Inventario</h2>
          <p>Consulta e modifica attrezzatura</p>
        </Link>

        <Link href="/admin/contatti" style={styles.card}>
          <h2>📩 Contatti</h2>
          <p>Messaggi dal form di contatto</p>
        </Link>

        <Link href="/admin/salaprove" style={styles.card}>
          <h2>🎛️ Sala Prove</h2>
          <p>Gestisci prenotazioni e calendario</p>
        </Link>

        <Link href="/admin/bilanciomensile" style={styles.card}>
          <h2>📊 Bilancio mensile</h2>
          <p>Consulta gli incassi della sala prove</p>
        </Link>
        <Link href="/admin/cose_da_fare_mibu" style={styles.card}>
          <h2>📝 Cose da fare</h2>
          <p>Gestione attività e pianificazione</p>
        </Link>
      </div>

      {/* ===== AZIONI ADMIN ===== */}
      <div style={styles.actions}>
        {role === "super_admin" && (
          <button
            onClick={() => router.push("/admin/dashboardareapersonale")}
            style={styles.superAdminButton}
          >
            ⭐ Area personale
          </button>
        )}

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
          style={styles.logout}
        >
          Logout
        </button>
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
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 40,
  },
card: {
  width: 280,
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
};
