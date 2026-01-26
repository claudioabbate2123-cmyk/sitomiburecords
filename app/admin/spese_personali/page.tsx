"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ================= TIPI ================= */

type Spesa = {
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

/* ================= COMPONENTE ================= */

export default function SpesePersonali() {
  const today = new Date();

  const [mese, setMese] = useState(today.getMonth());
  const [anno, setAnno] = useState(today.getFullYear());

  const [nome, setNome] = useState("");
  const [valore, setValore] = useState("");
  const [data, setData] = useState("");

  const [spese, setSpese] = useState<Spesa[]>([]);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const fetchSpese = async () => {
    const start = `${anno}-${String(mese + 1).padStart(2, "0")}-01`;
    const end = `${anno}-${String(mese + 1).padStart(2, "0")}-31`;

    const { data } = await supabase
      .from("spese_personali")
      .select("*")
      .gte("data", start)
      .lte("data", end)
      .order("data");

    setSpese(data ?? []);
  };

  useEffect(() => {
    fetchSpese();
  }, [mese, anno]);

  const aggiungiSpesa = async () => {
    if (!nome || !valore || !data) return;

    await supabase.from("spese_personali").insert({
      nome,
      valore: Number(valore),
      data,
    });

    setNome("");
    setValore("");
    setData("");
    fetchSpese();
  };

  const aggiornaSpesa = async (
    id: number,
    campo: "nome" | "valore" | "data",
    value: string | number
  ) => {
    await supabase
      .from("spese_personali")
      .update({ [campo]: value })
      .eq("id", id);

    fetchSpese();
  };

  const eliminaSpesa = async (id: number) => {
    await supabase.from("spese_personali").delete().eq("id", id);
    fetchSpese();
  };

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>💸 Spese personali</h1>

      {/* FILTRI */}
      <div style={styles.filters}>
        <select value={mese} onChange={(e) => setMese(Number(e.target.value))}>
          {mesi.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <select value={anno} onChange={(e) => setAnno(Number(e.target.value))}>
          {Array.from({ length: 11 }).map((_, i) => {
            const y = today.getFullYear() - 5 + i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      {/* INSERIMENTO */}
      <section style={styles.card}>
        <h2>➕ Aggiungi spesa</h2>

        <textarea
          placeholder="Nome spesa"
          value={nome}
          rows={1}
          onChange={(e) => {
            setNome(e.target.value);
            autoResize(e.target);
          }}
          style={styles.textarea}
        />

        <div style={styles.rowInputs}>
          <input
            type="number"
            placeholder="Valore €"
            value={valore}
            onChange={(e) => setValore(e.target.value)}
            style={styles.input}
          />

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={styles.input}
          />
        </div>

        <button style={styles.addButton} onClick={aggiungiSpesa}>
          ➕ Aggiungi spesa
        </button>
      </section>

      {/* LISTA */}
      <section style={styles.card}>
        <h2>Spese del mese</h2>

        {spese.map((s) => (
          <div key={s.id} className="spesa-row" style={styles.row}>
            <textarea
              defaultValue={s.nome}
              rows={1}
              style={styles.textarea}
              onChange={(e) => {
                autoResize(e.target);
                aggiornaSpesa(s.id, "nome", e.target.value);
              }}
            />

            <input
              type="number"
              defaultValue={s.valore}
              onChange={(e) =>
                aggiornaSpesa(s.id, "valore", Number(e.target.value))
              }
            />

            <input
              type="date"
              defaultValue={s.data}
              onChange={(e) =>
                aggiornaSpesa(s.id, "data", e.target.value)
              }
            />

            <button
              onClick={() => eliminaSpesa(s.id)}
              style={styles.deleteButton}
            >
              🗑
            </button>
          </div>
        ))}
      </section>

      {/* ===== CSS RESPONSIVE (SOLO MOBILE) ===== */}
      <style jsx>{`
        @media (max-width: 640px) {
          .spesa-row {
            grid-template-columns: 1fr !important;
            gap: 8px;
          }

          .spesa-row input[type="number"],
          .spesa-row input[type="date"] {
            width: 100%;
          }

          .spesa-row button {
            align-self: flex-end;
          }
        }
      `}</style>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 900,
    margin: "0 auto",
  },
  title: {
    fontSize: 34,
    fontWeight: 800,
    marginBottom: 24,
  },
  filters: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 120px 160px 56px",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  rowInputs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 12,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
  },
  textarea: {
    resize: "none",
    overflow: "hidden",
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    width: "100%",
  },
  addButton: {
    marginTop: 12,
    padding: "12px",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#fee2e2",
    cursor: "pointer",
  },
};
