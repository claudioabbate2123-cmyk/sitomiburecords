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
      <h1 style={styles.title}><strong>Eventi e Workshop</strong></h1>

      {loading && <p>Caricamento eventi...</p>}

      {!loading && eventi.length === 0 && (
        <p>Nessun evento pubblicato.</p>
      )}

      {!loading && eventi.length > 0 && (
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
              <tr key={evento.id}>
                <td style={styles.td}>{evento.nome}</td>
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
      )}
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1000,
    margin: "40px auto",
    padding: 24,
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "2px solid #000",
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
  },
};
