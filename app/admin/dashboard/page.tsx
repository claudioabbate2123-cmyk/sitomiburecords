"use client";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
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
      </div>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push("/");
        }}
        style={styles.logout}
      >
        Logout
      </button>
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
  logout: {
    marginTop: 40,
    background: "#000",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    cursor: "pointer",
  },
};
