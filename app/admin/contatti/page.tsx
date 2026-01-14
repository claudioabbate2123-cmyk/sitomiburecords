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
      // 🔐 Controllo sessione
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/admin/login");
        return;
      }

      // 📩 Lettura tabella Contatto
      const { data: contatti, error } = await supabase
        .from("Contatto")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Errore caricamento contatti:", error);
      } else if (contatti) {
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
      <h1>Messaggi di contatto</h1>

      {contatti.length === 0 ? (
        <p>Nessun messaggio ricevuto</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Messaggio</th>
              </tr>
            </thead>
            <tbody>
              {contatti.map((c) => (
                <tr key={c.id}>
                  <td>
                    {new Date(c.created_at).toLocaleDateString("it-IT")}
                  </td>
                  <td>
                    {c.nome} {c.cognome}
                  </td>
                  <td>{c.email}</td>
                  <td>{c.messaggio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 40,
    background: "#f4f4f4",
    fontFamily: "sans-serif",
  },
  tableWrapper: {
    marginTop: 30,
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
  },
};
