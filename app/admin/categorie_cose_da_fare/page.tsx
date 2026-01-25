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

type Categoria = {
  id: number;
  nome: string;
};

/* ================= COMPONENT ================= */

export default function CategorieCoseDaFarePage() {
  const router = useRouter();

  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */

  const fetchCategorie = async () => {
    const { data } = await supabase
      .from("categorie_cose_da_fare")
      .select("id, nome")
      .order("nome");

    setCategorie(data || []);
  };

  useEffect(() => {
    fetchCategorie();
  }, []);

  /* ================= DELETE ================= */

  const eliminaCategoria = async (id: number, nome: string) => {
  if (
    !confirm(
      `Eliminare la categoria "${nome}"?\n\n` +
      `La categoria verrà rimossa anche da tutte le cose da fare associate.`
    )
  ) {
    return;
  }

  setLoading(true);

  /* 1️⃣ RIMUOVE LA CATEGORIA DALLE COSE DA FARE */
  await supabase
    .from("cose_da_fare")
    .update({ categoria: null })
    .eq("categoria", nome);

  /* 2️⃣ ELIMINA LA CATEGORIA */
  await supabase
    .from("categorie_cose_da_fare")
    .delete()
    .eq("id", id);

  await fetchCategorie();
  setLoading(false);
};


  /* ================= UI ================= */

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Categorie cose da fare</h1>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Categoria</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Azioni</th>
          </tr>
        </thead>

        <tbody>
          {categorie.map((c) => (
            <tr key={c.id}>
              <td style={styles.td}>{c.nome}</td>
              <td style={{ ...styles.td, textAlign: "center" }}>
                <button
                  onClick={() => eliminaCategoria(c.id, c.nome)}
                  onTouchStart={() => eliminaCategoria(c.id,c.nome)}
                  style={styles.deleteButton}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}

          {categorie.length === 0 && (
            <tr>
              <td colSpan={2} style={{ ...styles.td, textAlign: "center" }}>
                Nessuna categoria presente
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button
        style={styles.backButton}
        onClick={() => router.push("/admin/calendario_personale/edit")}
      >
        ← Indietro
      </button>

      {loading && <p style={{ marginTop: 16 }}>Operazione in corso…</p>}
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 600,
    margin: "0 auto",
    backgroundColor: "#ffffff",
    color: "#111111",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 24,
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
    fontSize: 14,
    borderBottom: "1px solid #eee",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    width: 44,
    height: 44,
    fontSize: 18,
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
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
};
