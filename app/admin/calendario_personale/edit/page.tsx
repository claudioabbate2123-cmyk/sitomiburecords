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

type Appuntamento = {
  id: number;
  data: string;
  ora_inizio: string;
  ora_fine: string;
  nome_evento: string;
};

/* ================= COMPONENTE ================= */

export default function CalendarioPersonaleEditPage() {
  const router = useRouter();

  const [dataSelezionata, setDataSelezionata] = useState<string | null>(null);
  const [eventi, setEventi] = useState<Appuntamento[]>([]);
  const [loading, setLoading] = useState(false);

  const [nuovoEvento, setNuovoEvento] = useState({
    data: "",
    ora_inizio: "",
    ora_fine: "",
    nome_evento: "",
  });

  /* ================= LEGGI DATA DA LOCAL STORAGE ================= */

  useEffect(() => {
    const data = localStorage.getItem("salaprove:data");
    if (!data) return;

    setDataSelezionata(data);
    setNuovoEvento((p) => ({ ...p, data }));
  }, []);

  /* ================= LOAD EVENTI DEL GIORNO ================= */

  const fetchEventi = async () => {
    if (!dataSelezionata) return;

    const { data } = await supabase
      .from("calendario_personale")
      .select("id, data, ora_inizio, ora_fine, nome_evento")
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
    field: keyof Appuntamento,
    value: string
  ) => {
    setLoading(true);

    await supabase
      .from("calendario_personale")
      .update({ [field]: value })
      .eq("id", id);

    setLoading(false);
  };

  /* ================= DELETE EVENTO ================= */

  const eliminaEvento = async (id: number) => {
    if (!confirm("Eliminare questo appuntamento?")) return;

    setLoading(true);
    await supabase.from("calendario_personale").delete().eq("id", id);
    await fetchEventi();
    setLoading(false);
  };

  /* ================= CREATE EVENTO ================= */

  const salvaNuovoEvento = async () => {
    if (
      !nuovoEvento.ora_inizio ||
      !nuovoEvento.ora_fine ||
      !nuovoEvento.nome_evento
    ) {
      alert("Compila tutti i campi");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("calendario_personale")
      .insert({
        data: nuovoEvento.data,
        ora_inizio: nuovoEvento.ora_inizio,
        ora_fine: nuovoEvento.ora_fine,
        nome_evento: nuovoEvento.nome_evento,
      });

    if (error) {
      alert("Errore salvataggio: " + error.message);
      setLoading(false);
      return;
    }

    await fetchEventi();

    setNuovoEvento((p) => ({
      ...p,
      ora_inizio: "",
      ora_fine: "",
      nome_evento: "",
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
      <h1 style={styles.title}>Calendario Personale</h1>

      <div style={styles.dateBox}>
        <strong>Data:</strong> {formatDateEU(dataSelezionata)}
      </div>

      <h2 style={{ marginBottom: 12 }}>Nuovo appuntamento</h2>

      <div style={styles.newBookingRow}>
        <div style={styles.field}>
          <label style={styles.label}>Nome evento</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Nome evento"
            value={nuovoEvento.nome_evento}
            onChange={(e) =>
              setNuovoEvento({
                ...nuovoEvento,
                nome_evento: e.target.value,
              })
            }
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Ora inizio</label>
          <input
            style={styles.input}
            type="time"
            value={nuovoEvento.ora_inizio}
            onChange={(e) =>
              setNuovoEvento({
                ...nuovoEvento,
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
            value={nuovoEvento.ora_fine}
            onChange={(e) =>
              setNuovoEvento({
                ...nuovoEvento,
                ora_fine: e.target.value,
              })
            }
          />
        </div>
      </div>

      <button onClick={salvaNuovoEvento} style={styles.saveButton}>
        💾 Salva appuntamento
      </button>

      {/* ================= TABELLA EVENTI ================= */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nome evento</th>
            <th style={styles.th}>Ora inizio</th>
            <th style={styles.th}>Ora fine</th>
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
                  defaultValue={e.nome_evento}
                  onBlur={(ev) =>
                    updateEvento(e.id, "nome_evento", ev.target.value)
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
        onClick={() => router.push("/admin/calendario_personale")}
      >
        ← Torna al calendario
      </button>

      {loading && <p style={{ color: "#111" }}>Salvataggio…</p>}
    </main>
  );
}

/* ================= STILI (IDENTICI) ================= */

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
