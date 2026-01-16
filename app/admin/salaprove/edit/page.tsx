"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ================= TIPI ================= */

type Prenotazione = {
  id: number;
  data: string;
  ora_inizio: string;
  ora_fine: string;
  prezzo: number;
  nome_gruppo?: string;
};

/* ================= COMPONENTE ================= */

export default function SalaProveEditPage() {
  const router = useRouter();

  const [dataSelezionata, setDataSelezionata] = useState<string | null>(null);
  const [eventi, setEventi] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(false);

  const [nuovaPrenotazione, setNuovaPrenotazione] = useState({
    data: "",
    ora_inizio: "",
    ora_fine: "",
    prezzo: "",
    nome_gruppo: "",
  });

  /* ================= LEGGI DATA DA LOCAL STORAGE ================= */

  useEffect(() => {
    const data = localStorage.getItem("salaprove:data");
    if (!data) return;

    setDataSelezionata(data);
    setNuovaPrenotazione((p) => ({ ...p, data }));
  }, []);

  /* ================= LOAD EVENTI DEL GIORNO ================= */

  const fetchEventi = async () => {
    if (!dataSelezionata) return;

    const { data } = await supabase
      .from("salaprove")
      .select("id, data, ora_inizio, ora_fine, prezzo, nome_gruppo")
      .eq("data", dataSelezionata)
      .order("ora_inizio");

    setEventi(data || []);
  };

  useEffect(() => {
    fetchEventi();
  }, [dataSelezionata]);

  /* ================= UPDATE EVENTO ================= */

  const updateEvento = async (
    id: number,
    field: keyof Prenotazione,
    value: string
  ) => {
    setLoading(true);

    await supabase
      .from("salaprove")
      .update({ [field]: field === "prezzo" ? Number(value) : value })
      .eq("id", id);

    setLoading(false);
  };

  /* ================= DELETE EVENTO ================= */

  const eliminaEvento = async (id: number) => {
    if (!confirm("Eliminare questa prenotazione?")) return;

    setLoading(true);
    await supabase.from("salaprove").delete().eq("id", id);
    await fetchEventi();
    setLoading(false);
  };

  /* ================= CREATE EVENTO ================= */

  const salvaNuovaPrenotazione = async () => {
    if (
      !nuovaPrenotazione.ora_inizio ||
      !nuovaPrenotazione.ora_fine ||
      !nuovaPrenotazione.prezzo ||
      !nuovaPrenotazione.nome_gruppo
    ) {
      alert("Compila tutti i campi");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("salaprove").insert({
      data: nuovaPrenotazione.data,
      ora_inizio: nuovaPrenotazione.ora_inizio,
      ora_fine: nuovaPrenotazione.ora_fine,
      prezzo: Number(nuovaPrenotazione.prezzo),
      nome_gruppo: nuovaPrenotazione.nome_gruppo,
    });

    if (error) {
      alert("Errore salvataggio: " + error.message);
      setLoading(false);
      return;
    }

    await fetchEventi();

    setNuovaPrenotazione((p) => ({
      ...p,
      ora_inizio: "",
      ora_fine: "",
      prezzo: "",
      nome_gruppo: "",
    }));

    setLoading(false);
  };

  /* ================= GUARD ================= */

  if (!dataSelezionata) {
    return <p style={{ color: "#111" }}>Seleziona una data dal calendario</p>;
  }

  const formatDateEU = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  /* ================= UI ================= */

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Sala Prove</h1>

      <div style={styles.dateBox}>
        <strong>Data:</strong> {formatDateEU(dataSelezionata)}
      </div>

      <h2 style={{ marginBottom: 12 }}>Nuova prenotazione</h2>

      <div style={styles.newBookingRow}>
        <div style={styles.field}>
          <label style={styles.label}>Nome gruppo</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Nome gruppo"
            value={nuovaPrenotazione.nome_gruppo}
            onChange={(e) =>
              setNuovaPrenotazione({
                ...nuovaPrenotazione,
                nome_gruppo: e.target.value,
              })
            }
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Ora inizio</label>
          <input
            style={styles.input}
            type="time"
            value={nuovaPrenotazione.ora_inizio}
            onChange={(e) =>
              setNuovaPrenotazione({
                ...nuovaPrenotazione,
                ora_inizio: e.target.value,
              })
            }
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Ora fine</label>
          <input
            style={styles.input}
            type="time"
            value={nuovaPrenotazione.ora_fine}
            onChange={(e) =>
              setNuovaPrenotazione({
                ...nuovaPrenotazione,
                ora_fine: e.target.value,
              })
            }
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Prezzo (€)</label>
          <input
            style={styles.input}
            type="number"
            placeholder="€"
            value={nuovaPrenotazione.prezzo}
            onChange={(e) =>
              setNuovaPrenotazione({
                ...nuovaPrenotazione,
                prezzo: e.target.value,
              })
            }
          />
        </div>
      </div>

      <button onClick={salvaNuovaPrenotazione} style={styles.saveButton}>
        💾 Salva prenotazione
      </button>

      {/* ================= TABELLA EVENTI ================= */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nome gruppo</th>
            <th style={styles.th}>Ora inizio</th>
            <th style={styles.th}>Ora fine</th>
            <th style={styles.th}>Prezzo (€)</th>
            <th style={styles.th}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {eventi.map((e) => (
            <tr key={e.id}>
              <td style={styles.td}>
                <input
                  type="text"
                  style={styles.input}
                  defaultValue={e.nome_gruppo}
                  onBlur={(ev) =>
                    updateEvento(e.id, "nome_gruppo", ev.target.value)
                  }
                />
              </td>

              <td style={styles.td}>
                <input
                  type="time"
                  style={styles.input}
                  defaultValue={e.ora_inizio.slice(0, 5)}
                  onBlur={(ev) =>
                    updateEvento(e.id, "ora_inizio", ev.target.value)
                  }
                />
              </td>

              <td style={styles.td}>
                <input
                  type="time"
                  style={styles.input}
                  defaultValue={e.ora_fine.slice(0, 5)}
                  onBlur={(ev) =>
                    updateEvento(e.id, "ora_fine", ev.target.value)
                  }
                />
              </td>

              <td style={styles.td}>
                <input
                  type="text"
                  style={styles.input}
                  defaultValue={e.prezzo}
                  onBlur={(ev) =>
                    updateEvento(e.id, "prezzo", ev.target.value)
                  }
                />
              </td>

              <td style={{ ...styles.td, textAlign: "center" }}>
                <button
                  onClick={() => eliminaEvento(e.id)}
                  style={styles.deleteButton}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        style={styles.backButton}
        onClick={() => router.push("/admin/salaprove")}
      >
        ← Torna al calendario
      </button>

      {loading && <p style={{ color: "#111" }}>Salvataggio…</p>}
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 900,
    margin: "0 auto",
    backgroundColor: "#ffffff",
    color: "#111111",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 16,
  },
  dateBox: {
    marginBottom: 24,
    fontSize: 16,
  },
  newBookingRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    minWidth: 140,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 24,
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    fontSize: 14,
    fontWeight: 700,
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "8px",
    verticalAlign: "top",
  },
  input: {
    width: "100%",
    padding: "6px 8px",
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#111",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: "#16a34a",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#f3f4f6",
    color: "#111",
    padding: "8px 14px",
    border: "1px solid #ddd",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 28,
    height: 28,
    fontSize: 16,
    cursor: "pointer",
  },
};
