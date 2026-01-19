"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Contatto = {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  messaggio: string;
  created_at: string;
};

export default function AdminContatti() {
  const router = useRouter();
  const [contatti, setContatti] = useState<Contatto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/admin/login");
        return;
      }

      const { data: contatti, error } = await supabase
        .from("Contatto")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && contatti) {
        setContatti(contatti);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return <p style={{ padding: 40 }}>Caricamento...</p>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>📩 Messaggi di contatto</h1>

        {contatti.length === 0 ? (
          <p style={styles.empty}>Nessun messaggio ricevuto</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data</th>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Cognome</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Messaggio</th>
                </tr>
              </thead>
              <tbody>
                {contatti.map((c, index) => (
                  <tr
                    key={c.id}
                    style={{
                      backgroundColor:
                        index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td style={styles.td}>
                      {new Date(c.created_at).toLocaleDateString("it-IT")}
                    </td>
                    <td style={styles.td}>{c.nome}</td>
                    <td style={styles.td}>{c.cognome}</td>
                    <td style={styles.tdEmail}>{c.email}</td>
                    <td style={styles.tdMessage}>{c.messaggio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 40,
    background: "#f3f4f6",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    maxWidth: 1200,
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 20,
    color: "#111827",
  },
  empty: {
    padding: 20,
    color: "#6b7280",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "2px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    fontWeight: 700,
    color: "#374151",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: "10px",
    verticalAlign: "top",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
  },
  tdEmail: {
    padding: "10px",
    borderBottom: "1px solid #e5e7eb",
    color: "#2563eb",
    whiteSpace: "nowrap",
  },
  tdMessage: {
    padding: "10px",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "pre-wrap",
    maxWidth: 500,
    color: "#111827",
  },
};
