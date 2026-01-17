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

type CosaDaFare = {
  id: number;
  elemento: string;
  fatto: boolean;
};

/* ================= COMPONENTE ================= */

export default function CalendarioPersonaleEditPage() {
  const router = useRouter();

  const [dataSelezionata, setDataSelezionata] = useState<string | null>(null);
  const [eventi, setEventi] = useState<Appuntamento[]>([]);
  const [coseDaFare, setCoseDaFare] = useState<CosaDaFare[]>([]);
  const [loading, setLoading] = useState(false);

  const [nuovoEvento, setNuovoEvento] = useState({
    data: "",
    ora_inizio: "",
    ora_fine: "",
    nome_evento: "",
  });

  const [nuovaCosaDaFare, setNuovaCosaDaFare] = useState({
    elemento: "",
  });

  /* ================= LEGGI DATA DA LOCAL STORAGE ================= */

  useEffect(() => {
    const data = localStorage.getItem("salaprove:data");
    if (!data) return;

    setDataSelezionata(data);
    setNuovoEvento((p) => ({ ...p, data }));
  }, []);

  /* ================= LOAD EVENTI ================= */

  const fetchEventi = async () => {
    if (!dataSelezionata) return;

    const { data } = await supabase
      .from("calendario_personale")
      .select("id, data, ora_inizio, ora_fine, nome_evento")
      .eq("data", dataSelezionata)
      .order("ora_inizio");

    setEventi(data || []);
  };

  /* ================= LOAD COSE DA FARE ================= */

  const fetchCoseDaFare = async () => {
    if (!dataSelezionata) return;

    const { data } = await supabase
      .from("cose_da_fare")
      .select("id, elemento, fatto")
      .eq("data", dataSelezionata)
      .order("created_at");

    setCoseDaFare(data || []);
  };

  useEffect(() => {
    fetchEventi();
    fetchCoseDaFare();
  }, [dataSelezionata]);

  /* ================= UPDATE ================= */

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

  const updateCosaDaFare = async (
    id: number,
    field: keyof CosaDaFare,
    value: string | boolean
  ) => {
    setLoading(true);
    await supabase
      .from("cose_da_fare")
      .update({ [field]: value })
      .eq("id", id);
    await fetchCoseDaFare();
    setLoading(false);
  };

  /* ================= DELETE ================= */

  const eliminaEvento = async (id: number) => {
    if (!confirm("Eliminare questo appuntamento?")) return;
    setLoading(true);
    await supabase.from("calendario_personale").delete().eq("id", id);
    await fetchEventi();
    setLoading(false);
  };

  const eliminaCosaDaFare = async (id: number) => {
    if (!confirm("Eliminare questa cosa da fare?")) return;
    setLoading(true);
    await supabase.from("cose_da_fare").delete().eq("id", id);
    await fetchCoseDaFare();
    setLoading(false);
  };

  /* ================= CREATE ================= */

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
    await supabase.from("calendario_personale").insert(nuovoEvento);
    await fetchEventi();

    setNuovoEvento((p) => ({
      ...p,
      ora_inizio: "",
      ora_fine: "",
      nome_evento: "",
    }));

    setLoading(false);
  };

  const salvaCosaDaFare = async () => {
    if (!nuovaCosaDaFare.elemento || !dataSelezionata) {
      alert("Compila il campo");
      return;
    }

    setLoading(true);
    await supabase.from("cose_da_fare").insert({
      elemento: nuovaCosaDaFare.elemento,
      data: dataSelezionata,
      fatto: false,
    });
    await fetchCoseDaFare();
    setNuovaCosaDaFare({ elemento: "" });
    setLoading(false);
  };

  /* ================= RIMANDA A DOMANI ================= */

  const rimandaADomani = async () => {
    if (!dataSelezionata) return;

    const domani = new Date(dataSelezionata);
    domani.setDate(domani.getDate() + 1);

    const dataDomani = domani.toISOString().slice(0, 10);

    const daRimandare = coseDaFare.filter((c) => !c.fatto);

    if (daRimandare.length === 0) {
      alert("Nessuna cosa da fare da rimandare");
      return;
    }

    setLoading(true);

    const payload = daRimandare.map((c) => ({
      elemento: c.elemento,
      fatto: false,
      data: dataDomani,
    }));

    await supabase.from("cose_da_fare").insert(payload);

    setLoading(false);
    alert("Cose da fare rimandate a domani");
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

      {/* EVENTI */}

      <h2 style={{ marginBottom: 12 }}>Nuovo appuntamento</h2>

      <div style={styles.newBookingRow}>
        <div style={styles.field}>
          <label style={styles.label}>Nome evento</label>
          <input
            style={styles.input}
            value={nuovoEvento.nome_evento}
            onChange={(e) =>
              setNuovoEvento({ ...nuovoEvento, nome_evento: e.target.value })
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
              setNuovoEvento({ ...nuovoEvento, ora_inizio: e.target.value })
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
              setNuovoEvento({ ...nuovoEvento, ora_fine: e.target.value })
            }
          />
        </div>
      </div>

      <button onClick={salvaNuovoEvento} style={styles.saveButton}>
        💾 Salva appuntamento
      </button>

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
                  style={styles.input}
                  defaultValue={e.nome_evento}
                  onBlur={(ev) =>
                    updateEvento(e.id, "nome_evento", ev.target.value)
                  }
                />
              </td>
              <td style={styles.td}>
                <input
                  style={styles.input}
                  type="time"
                  defaultValue={e.ora_inizio.slice(0, 5)}
                  onBlur={(ev) =>
                    updateEvento(e.id, "ora_inizio", ev.target.value)
                  }
                />
              </td>
              <td style={styles.td}>
                <input
                  style={styles.input}
                  type="time"
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

      {/* COSE DA FARE */}

      <h2 style={{ marginBottom: 12 }}>Aggiungi cosa da fare</h2>

      <div style={styles.newBookingRow}>
        <div style={styles.field}>
          <label style={styles.label}>Descrizione</label>
          <input
            style={styles.input}
            value={nuovaCosaDaFare.elemento}
            onChange={(e) =>
              setNuovaCosaDaFare({ elemento: e.target.value })
            }
          />
        </div>
      </div>

      <button onClick={salvaCosaDaFare} style={styles.saveButton}>
        💾 Salva cosa da fare
      </button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Descrizione</th>
            <th style={styles.th}>Fatto</th>
            <th style={styles.th}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {coseDaFare.map((c) => (
            <tr key={c.id}>
              <td style={styles.td}>
                <input
                  style={styles.input}
                  defaultValue={c.elemento}
                  onBlur={(e) =>
                    updateCosaDaFare(c.id, "elemento", e.target.value)
                  }
                />
              </td>
              <td style={{ ...styles.td, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={c.fatto}
                  onChange={(e) =>
                    updateCosaDaFare(c.id, "fatto", e.target.checked)
                  }
                />
              </td>
              <td style={{ ...styles.td, textAlign: "center" }}>
                <button
                  onClick={() => eliminaCosaDaFare(c.id)}
                  style={styles.deleteButton}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* BOTTONE RIMANDA A DOMANI */}

      <div style={{ marginTop: 32, marginBottom: 16 }}>
        <button onClick={rimandaADomani} style={styles.saveButton}>
          ⏭ Rimanda a domani
        </button>
      </div>

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
  },
  input: {
    width: "100%",
    padding: "6px 8px",
    fontSize: 14,
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
