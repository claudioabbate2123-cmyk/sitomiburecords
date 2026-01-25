"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ================= COSTANTI ================= */

const mesi = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const ENTRATE_FISSE = 750;
const SPESE_FISSE = -330;

/* ================= COMPONENTE ================= */

export default function BilancioMensilePersonale() {
  const router = useRouter();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [guadagno, setGuadagno] = useState(0);
  const [spesa, setSpesa] = useState(0);
  const [profitto, setProfitto] = useState(0);

  /* ================= FETCH DATI ================= */

  useEffect(() => {
    const fetchBilancio = async () => {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);

      const { data, error } = await supabase
        .from("calendario_personale")
        .select("guadagno")
        .gte("data", startDate.toISOString())
        .lt("data", endDate.toISOString());

      if (error) {
        console.error(error);
        return;
      }

      let totaleGuadagni = 0;
      let totaleSpese = 0;

      data?.forEach((r) => {
        if (r.guadagno > 0) {
          totaleGuadagni += r.guadagno;
        } else {
          totaleSpese += r.guadagno;
        }
      });

      const totale = 
        totaleGuadagni +
        totaleSpese +
        ENTRATE_FISSE +
        SPESE_FISSE;

      setGuadagno(totaleGuadagni);
      setSpesa(totaleSpese);
      setProfitto(totale);
    };

    fetchBilancio();
  }, [month, year]);

  /* ================= RENDER ================= */

  return (
    <main style={styles.page}>
      {/* TORNA ALLA DASHBOARD */}
      <button
        style={styles.backButton}
        onClick={() => router.push("/admin/dashboardareapersonale")}
      >
        ← Torna alla dashboard
      </button>

      <h1 style={styles.title}>Bilancio mensile personale</h1>

      {/* FILTRI */}
      <div style={styles.filters}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {mesi.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {Array.from({ length: 11 }).map((_, i) => {
            const y = today.getFullYear() - 5 + i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>

      {/* RISULTATI */}
      <div style={styles.card}>
        <div>💰 Guadagni: <strong>€ {guadagno.toFixed(2)}</strong></div>
        <div>🧾 Spese: <strong>€ {spesa.toFixed(2)}</strong></div>
        <div>📌 Entrate fisse: <strong>€ {ENTRATE_FISSE.toFixed(2)}</strong></div>
        <div>🏠 Spese fisse: <strong>€ {SPESE_FISSE.toFixed(2)}</strong></div>

        <hr style={{ margin: "16px 0" }} />

        <div style={styles.total}>
          Profitto: € {profitto.toFixed(2)}
        </div>
      </div>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    background: "#f4f4f4",
    minHeight: "100vh",
    position: "relative",
  },

  title: {
    fontSize: 30,
    fontWeight: 800,
    marginBottom: 24,
  },

  filters: {
    display: "flex",
    gap: 16,
    marginBottom: 32,
  },

  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 10,
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
    fontSize: 16,
    lineHeight: 1.6,
  },

  total: {
    fontSize: 20,
    fontWeight: 800,
  },

  backButton: {
    position: "absolute",
    top: 24,
    right: 32,
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
