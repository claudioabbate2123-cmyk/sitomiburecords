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
};

export default function EventiPage() {
  const router = useRouter();
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState("");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    checkSession();
    loadEventi();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) router.push("/admin/login");
  }

  async function loadEventi() {
    const { data, error } = await supabase
      .from("eventi")
      .select("*")
      .order("data_inizio", { ascending: false });

    if (!error && data) setEventi(data);
    setLoading(false);
  }

  async function creaEvento(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("eventi").insert({
      nome,
      data_inizio: dataInizio,
      data_fine: dataFine || null,
      note,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNome("");
    setDataInizio("");
    setDataFine("");
    setNote("");
    loadEventi();
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

        {loading ? (
          <p>Caricamento...</p>
        ) : eventi.length === 0 ? (
          <p>Nessun evento creato</p>
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
              {eventi.map((evento) => (
                <tr key={evento.id}>
                  <td style={styles.td}>{evento.nome}</td>
                  <td style={styles.td}>{evento.data_inizio}</td>
                  <td style={styles.td}>{evento.data_fine ?? "-"}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.open}
                      onClick={() =>
                        router.push(`/admin/eventi/${evento.id}`)
                      }
                    >
                      Apri
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
