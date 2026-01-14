"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Evento = {
  id: string;
  nome: string;
  data_inizio: string;
  data_fine: string | null;
};

type Attrezzatura = {
  id: string;
  nome: string;
  quantita: number;
};

type EventoAttrezzatura = {
  id: string;
  attrezzatura_id: string;
  quantita_prevista: number;
};

export default function EventoPage() {
  const { id: eventoId } = useParams();
  const router = useRouter();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [attrezzatura, setAttrezzatura] = useState<Attrezzatura[]>([]);
  const [selezione, setSelezione] = useState<
    Record<string, EventoAttrezzatura>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
    loadData();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) router.push("/admin/login");
  }

  async function loadData() {
    const [{ data: evento }, { data: att }, { data: ea }] =
      await Promise.all([
        supabase.from("eventi").select("*").eq("id", eventoId).single(),
        supabase.from("attrezzatura").select("id,nome,quantita"),
        supabase
          .from("eventi_attrezzatura")
          .select("*")
          .eq("evento_id", eventoId),
      ]);

    if (evento) setEvento(evento);
    if (att) setAttrezzatura(att);

    const map: Record<string, EventoAttrezzatura> = {};
    ea?.forEach((r) => {
      map[r.attrezzatura_id] = r;
    });

    setSelezione(map);
    setLoading(false);
  }

  async function toggleAttrezzatura(attId: string, checked: boolean) {
    if (checked) {
      const { data } = await supabase
        .from("eventi_attrezzatura")
        .insert({
          evento_id: eventoId,
          attrezzatura_id: attId,
          quantita_prevista: 1,
        })
        .select()
        .single();

      if (data) {
        setSelezione((prev) => ({ ...prev, [attId]: data }));
      }
    } else {
      await supabase
        .from("eventi_attrezzatura")
        .delete()
        .eq("evento_id", eventoId)
        .eq("attrezzatura_id", attId);

      setSelezione((prev) => {
        const copy = { ...prev };
        delete copy[attId];
        return copy;
      });
    }
  }

  async function updateQuantita(attId: string, value: number) {
    const record = selezione[attId];
    if (!record) return;

    await supabase
      .from("eventi_attrezzatura")
      .update({ quantita_prevista: value })
      .eq("id", record.id);

    setSelezione((prev) => ({
      ...prev,
      [attId]: { ...record, quantita_prevista: value },
    }));
  }

  if (loading) return <p style={{ padding: 32 }}>Caricamento...</p>;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1>{evento?.nome}</h1>
        <button onClick={() => router.back()} style={styles.back}>
          ← Indietro
        </button>
      </header>

      <section style={styles.card}>
        <h2>Attrezzatura per l’evento</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.thCenter}></th>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Disponibile</th>
              <th style={styles.th}>Quantità prevista</th>
            </tr>
          </thead>

          <tbody>
            {attrezzatura.map((a) => {
              const selected = selezione[a.id];

              return (
                <tr key={a.id}>
                  <td style={styles.tdCenter}>
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={(e) =>
                        toggleAttrezzatura(a.id, e.target.checked)
                      }
                    />
                  </td>

                  <td style={styles.td}>{a.nome}</td>
                  <td style={styles.td}>{a.quantita}</td>

                  <td style={styles.td}>
                    {selected ? (
                      <input
                        type="number"
                        min={1}
                        max={a.quantita}
                        value={selected.quantita_prevista}
                        onChange={(e) =>
                          updateQuantita(a.id, Number(e.target.value))
                        }
                        style={styles.qty}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
    alignItems: "center",
    marginBottom: 24,
  },
  back: {
    background: "#000",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid #ddd",
    verticalAlign: "middle",
  },
  thCenter: {
    textAlign: "center",
    padding: "10px 8px",
    borderBottom: "1px solid #ddd",
    verticalAlign: "middle",
    width: 40,
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
  },
  tdCenter: {
    textAlign: "center",
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
  },
  qty: {
    width: 70,
    padding: 6,
    textAlign: "center",
  },
};
