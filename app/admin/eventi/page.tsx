"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Evento = {
  id: string;
  nome: string;
  data_inizio: string;
  data_fine: string | null;
  note: string | null;
  dirty?: boolean;
};

export default function EventiPage() {
  const router = useRouter();
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState("");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [note, setNote] = useState("");

  const [dataFiltroDa, setDataFiltroDa] = useState("");
  const [dataFiltroA, setDataFiltroA] = useState("");

  useEffect(() => {
    checkSession();
    loadEventi();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) router.push("/admin/login");
  }

  async function loadEventi() {
    const { data } = await supabase
      .from("eventi")
      .select("*")
      .order("data_inizio", { ascending: false });

    if (data) setEventi(data);
    setLoading(false);
  }

  async function creaEvento(e: React.FormEvent) {
    e.preventDefault();

    await supabase.from("eventi").insert({
      nome,
      data_inizio: dataInizio,
      data_fine: dataFine || null,
      note,
    });

    setNome("");
    setDataInizio("");
    setDataFine("");
    setNote("");
    loadEventi();
  }

  /* ================= FILTRO ================= */

  const eventiFiltrati = eventi.filter((evento) => {
    const t = new Date(evento.data_inizio).getTime();

    if (dataFiltroDa && t < new Date(dataFiltroDa).getTime()) return false;
    if (dataFiltroA && t > new Date(dataFiltroA).getTime()) return false;

    return true;
  });

  /* ================= UPDATE ================= */

  async function salvaEvento(evento: Evento) {
    await supabase
      .from("eventi")
      .update({
        nome: evento.nome,
        data_inizio: evento.data_inizio,
        data_fine: evento.data_fine,
      })
      .eq("id", evento.id);

    setEventi((prev) =>
      prev.map((e) =>
        e.id === evento.id ? { ...e, dirty: false } : e
      )
    );
  }

  async function salvaTutti() {
    const modificati = eventi.filter((e) => e.dirty);
    if (!modificati.length) return;

    for (const e of modificati) {
      await supabase
        .from("eventi")
        .update({
          nome: e.nome,
          data_inizio: e.data_inizio,
          data_fine: e.data_fine,
        })
        .eq("id", e.id);
    }

    setEventi((prev) => prev.map((e) => ({ ...e, dirty: false })));
  }

  /* ================= DELETE ================= */

  async function eliminaEvento(id: string) {
    if (!confirm("Eliminare questo evento?")) return;

    await supabase.from("eventi").delete().eq("id", id);
    setEventi((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1>Eventi</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/admin/login");
          }}
          style={styles.logout}
        >
          Logout
        </button>
      </header>

      {/* CREA EVENTO */}
      <section style={styles.card}>
        <h2>Crea nuovo evento</h2>
        <form onSubmit={creaEvento} style={styles.form}>
          <input
            placeholder="Nome evento"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="date"
            value={dataInizio}
            onChange={(e) => setDataInizio(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="date"
            value={dataFine}
            onChange={(e) => setDataFine(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Crea evento
          </button>
        </form>
      </section>

      {/* LISTA EVENTI */}
      <section style={styles.card}>
        <h2>Eventi esistenti</h2>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="date"
            value={dataFiltroDa}
            onChange={(e) => setDataFiltroDa(e.target.value)}
            style={styles.input}
          />
          <input
            type="date"
            value={dataFiltroA}
            onChange={(e) => setDataFiltroA(e.target.value)}
            style={styles.input}
          />
          <button
            onClick={() => {
              setDataFiltroDa("");
              setDataFiltroA("");
            }}
            style={styles.button}
          >
            Reset
          </button>
        </div>

        {loading ? (
          <p>Caricamento...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Data inizio</th>
                <th style={styles.th}>Data fine</th>
                <th style={styles.th}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {eventiFiltrati.map((e) => (
                <tr key={e.id}>
                  <td style={styles.td}>
                    <input
                      style={styles.input}
                      value={e.nome}
                      onChange={(ev) =>
                        setEventi((prev) =>
                          prev.map((x) =>
                            x.id === e.id
                              ? { ...x, nome: ev.target.value, dirty: true }
                              : x
                          )
                        )
                      }
                    />
                  </td>

                  <td style={styles.td}>
                    <input
                      type="date"
                      value={e.data_inizio}
                      onChange={(ev) =>
                        setEventi((prev) =>
                          prev.map((x) =>
                            x.id === e.id
                              ? {
                                  ...x,
                                  data_inizio: ev.target.value,
                                  dirty: true,
                                }
                              : x
                          )
                        )
                      }
                      style={styles.input}
                    />
                  </td>

                  <td style={styles.td}>
                    <input
                      type="date"
                      value={e.data_fine || ""}
                      onChange={(ev) =>
                        setEventi((prev) =>
                          prev.map((x) =>
                            x.id === e.id
                              ? {
                                  ...x,
                                  data_fine: ev.target.value || null,
                                  dirty: true,
                                }
                              : x
                          )
                        )
                      }
                      style={styles.input}
                    />
                  </td>

                  <td style={styles.td}>
                    {e.dirty && (
                      <button
                        onClick={() => salvaEvento(e)}
                        style={styles.open}
                      >
                        💾
                      </button>
                    )}

                    <button
                      onClick={() =>
                        router.push(`/admin/eventi/${e.id}`)
                      }
                      style={styles.open}
                    >
                      Apri
                    </button>

                    <button
                      onClick={() => eliminaEvento(e.id)}
                      style={{ ...styles.open, background: "#ef4444" }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {eventi.some((e) => e.dirty) && (
          <button
            onClick={salvaTutti}
            style={{ ...styles.button, marginTop: 16 }}
          >
            💾 Salva tutte le modifiche
          </button>
        )}
      </section>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    background: "#f4f4f4",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logout: {
    background: "#000",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  input: {
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 4,
    flex: "1 1 180px",
  },
  button: {
    background: "#000",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: 10,
    borderBottom: "2px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: 10,
    borderBottom: "1px solid #eee",
  },
  open: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
  },
};
