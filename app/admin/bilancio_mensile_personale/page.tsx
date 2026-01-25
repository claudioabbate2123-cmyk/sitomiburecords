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

/* ================= TIPI ================= */

type SpesaPersonale = {
  id: number;
  nome: string;
  valore: number;
  data: string;
};

/* ================= COSTANTI ================= */

const mesi = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
];

const ENTRATE_FISSE = 750;
const SPESE_FISSE = -330;

/* ================= COMPONENTE ================= */

export default function BilancioMensilePersonale() {
  const router = useRouter();

  /* ===== FORMAT DATA EU ===== */
  const formatDateEU = (date: string) => {
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [guadagno, setGuadagno] = useState(0);
  const [spesa, setSpesa] = useState(0);
  const [profitto, setProfitto] = useState(0);
  const [totaleSpesePersonali, setTotaleSpesePersonali] = useState(0);

  const [spesePersonali, setSpesePersonali] = useState<SpesaPersonale[]>([]);

  /* ================= FETCH BILANCIO ================= */
  const fetchBilancio = async () => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    /* === calendario_personale === */
    const { data: cal } = await supabase
      .from("calendario_personale")
      .select("guadagno")
      .gte("data", startDate.toISOString())
      .lt("data", endDate.toISOString());

    let totaleGuadagni = 0;
    let totaleSpese = 0;

    cal?.forEach((r) => {
      if (r.guadagno > 0) totaleGuadagni += r.guadagno;
      else totaleSpese += r.guadagno;
    });

    /* === spese_personali (somma) === */
    const { data: speseSomma } = await supabase
      .from("spese_personali")
      .select("valore")
      .gte("data", startDate.toISOString())
      .lt("data", endDate.toISOString());

    const totaleSpesePers =
      speseSomma?.reduce((sum, s) => sum + (s.valore || 0), 0) ?? 0;

    /* === spese_personali (lista) === */
    const { data: speseLista } = await supabase
      .from("spese_personali")
      .select("*")
      .gte("data", startDate.toISOString())
      .lt("data", endDate.toISOString())
      .order("data");

    setSpesePersonali(speseLista ?? []);
    setTotaleSpesePersonali(totaleSpesePers);
    setGuadagno(totaleGuadagni);
    setSpesa(totaleSpese);

    setProfitto(
      totaleGuadagni +
        totaleSpese +
        ENTRATE_FISSE +
        SPESE_FISSE -
        totaleSpesePers
    );
  };

  useEffect(() => {
    fetchBilancio();
  }, [month, year]);

  /* ================= RENDER ================= */

  return (
    <main style={styles.page}>
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
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {Array.from({ length: 11 }).map((_, i) => {
            const y = today.getFullYear() - 5 + i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      {/* RISULTATI */}
      <div style={styles.card}>
        <div>💰 Guadagni: <strong>€ {guadagno.toFixed(2)}</strong></div>
        <div>🧾 Spese: <strong>€ {spesa.toFixed(2)}</strong></div>
        <div>📌 Entrate fisse: <strong>€ {ENTRATE_FISSE.toFixed(2)}</strong></div>
        <div>🏠 Spese fisse: <strong>€ {SPESE_FISSE.toFixed(2)}</strong></div>
        <div>📉 Spese personali: <strong>€ {totaleSpesePersonali.toFixed(2)}</strong></div>

        <hr style={{ margin: "16px 0" }} />

        <div style={styles.total}>
          Profitto: € {profitto.toFixed(2)}
        </div>
      </div>

      {/* ================= SPESE PERSONALI ================= */}
      <div style={{ ...styles.card, marginTop: 32 }}>
        <h2 style={{ marginBottom: 16 }}>📋 Spese personali</h2>

        {spesePersonali.length === 0 && (
          <div style={{ opacity: 0.6 }}>Nessuna spesa per questo mese</div>
        )}

        {spesePersonali.length > 0 && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px",
              gap: 12,
              fontWeight: 700,
              borderBottom: "2px solid #e5e7eb",
              marginBottom: 12,
            }}>
              <div>Nome</div>
              <div>Valore (€)</div>
              <div>Data</div>
            </div>

            {spesePersonali.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 120px",
                  gap: 12,
                  alignItems: "center",
                  padding: "6px 0",
                }}
              >
                <input
                  defaultValue={s.nome}
                  onBlur={async (e) => {
                    await supabase
                      .from("spese_personali")
                      .update({ nome: e.target.value })
                      .eq("id", s.id);
                    fetchBilancio();
                  }}
                />

                <input
                  type="number"
                  defaultValue={s.valore}
                  onBlur={async (e) => {
                    await supabase
                      .from("spese_personali")
                      .update({ valore: Number(e.target.value) })
                      .eq("id", s.id);
                    fetchBilancio();
                  }}
                />

                <span style={{ textAlign: "center", opacity: 0.7 }}>
                  {formatDateEU(s.data)}
                </span>
              </div>
            ))}
          </>
        )}
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
