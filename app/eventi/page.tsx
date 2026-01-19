"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

/* ================= TIPI ================= */

type EventoPubblicato = {
  id: string;
  nome: string;
  descrizione: string;
  data: string;
  ora_inizio: string;
  ora_fine: string;
};

/* ================= COMPONENT ================= */

export default function EventiPage() {
  const [eventi, setEventi] = useState<EventoPubblicato[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchEventi();
  }, []);

  async function fetchEventi() {
    const { data, error } = await supabase
      .from("eventipubblicati")
      .select("*")
      .order("data", { ascending: true })
      .order("ora_inizio", { ascending: true });

    if (!error && data) {
      setEventi(data);
    }

    setLoading(false);
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>
        <strong>Eventi e Workshop</strong>
      </h1>

      {loading && <p>Caricamento eventi...</p>}

      {!loading && eventi.length === 0 && (
        <p>Nessun evento pubblicato.</p>
      )}

      {!loading && eventi.length > 0 && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>Descrizione</th>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Ora inizio</th>
                <th style={styles.th}>Ora fine</th>
              </tr>
            </thead>

            <tbody>
              {eventi.map((evento) => (
                <tr key={evento.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.nomeContainer}>
                      <span style={styles.nome}>{evento.nome}</span>
                      <img
                        src="/Workshop di musica cubana.JPG"
                        alt={evento.nome}
                        style={styles.image}
                      />
                    </div>
                  </td>

                  <td style={styles.td}>{evento.descrizione}</td>

                  <td style={styles.td}>
                    {new Date(evento.data).toLocaleDateString("it-IT")}
                  </td>

                  <td style={styles.td}>
                    {evento.ora_inizio.slice(0, 5)}
                  </td>

                  <td style={styles.td}>
                    {evento.ora_fine.slice(0, 5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "40px auto",
    padding: 24,
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    fontSize: 34,
    marginBottom: 32,
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
  },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    backgroundColor: "#f5f5f5",
    fontWeight: 600,
    fontSize: 14,
    borderBottom: "2px solid #e5e5e5",
  },
  tr: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "14px 12px",
    verticalAlign: "top",
    fontSize: 20,
    color: "#333",
  },
  nomeContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  nome: {
    fontWeight: 600,
    fontSize: 20,
  },
  image: {
    width: "100%",
    maxWidth: 180,
    height: "auto",
    borderRadius: 8,
    objectFit: "cover",
    border: "1px solid #ddd",
  },
};
