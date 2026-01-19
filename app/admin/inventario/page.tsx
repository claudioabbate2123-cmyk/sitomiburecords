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

type Attrezzatura = {
  id: number;
  nome: string;
  image_url: string | null;
  categoria: string | null;
  stato: boolean;
  note: string | null;
  dirty?: boolean;
};

type CategoriaAttrezzatura = {
  id: number;
  nome: string;
};

/* ================= COMPONENTE ================= */

export default function AttrezzaturaPage() {
  const router = useRouter();

  const [items, setItems] = useState<Attrezzatura[]>([]);
  const [categorie, setCategorie] = useState<CategoriaAttrezzatura[]>([]);
  const [loading, setLoading] = useState(false);

  const [nuova, setNuova] = useState({
    nome: "",
    image_url: "",
    categoria: "",
    stato: true,
    note: "",
  });

  /* ================= LOAD ================= */

  const fetchItems = async () => {
    const { data } = await supabase
      .from("attrezzatura")
      .select("id, nome, image_url, categoria, stato, note")
      .order("created_at");

    setItems(data || []);
  };

  const fetchCategorie = async () => {
    const { data } = await supabase
      .from("categorie_attrezzatura")
      .select("id, nome")
      .order("nome");

    setCategorie(data || []);
  };

  useEffect(() => {
    fetchCategorie();
    fetchItems();
  }, []);

  /* ================= UTILITY ================= */

  const assicuratiCategoria = async (nome?: string | null) => {
    if (!nome) return;

    const { data: esistente } = await supabase
      .from("categorie_attrezzatura")
      .select("id")
      .eq("nome", nome)
      .maybeSingle();

    if (!esistente) {
      await supabase.from("categorie_attrezzatura").insert({ nome });
      await fetchCategorie();
    }
  };

  /* ================= CREATE ================= */

  const salvaNuova = async () => {
    if (!nuova.nome) {
      alert("Il nome è obbligatorio");
      return;
    }

    setLoading(true);

    await assicuratiCategoria(nuova.categoria);

    await supabase.from("attrezzatura").insert({
      nome: nuova.nome,
      image_url: nuova.image_url || null,
      categoria: nuova.categoria || null,
      stato: nuova.stato,
      note: nuova.note || null,
    });

    setNuova({
      nome: "",
      image_url: "",
      categoria: "",
      stato: true,
      note: "",
    });

    await fetchItems();
    setLoading(false);
  };

  /* ================= UPDATE ================= */

  const salvaModifica = async (item: Attrezzatura) => {
    setLoading(true);

    await assicuratiCategoria(item.categoria);

    await supabase
      .from("attrezzatura")
      .update({
        nome: item.nome,
        image_url: item.image_url,
        categoria: item.categoria,
        stato: item.stato,
        note: item.note,
      })
      .eq("id", item.id);

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, dirty: false } : i
      )
    );

    setLoading(false);
  };

  const salvaTutte = async () => {
    const daSalvare = items.filter((i) => i.dirty);
    if (!daSalvare.length) return;

    setLoading(true);

    for (const i of daSalvare) {
      await assicuratiCategoria(i.categoria);

      await supabase
        .from("attrezzatura")
        .update({
          nome: i.nome,
          image_url: i.image_url,
          categoria: i.categoria,
          stato: i.stato,
          note: i.note,
        })
        .eq("id", i.id);
    }

    setItems((prev) => prev.map((i) => ({ ...i, dirty: false })));
    setLoading(false);
  };

  /* ================= DELETE ================= */

  const elimina = async (id: number) => {
    if (!confirm("Eliminare questa attrezzatura?")) return;
    setLoading(true);
    await supabase.from("attrezzatura").delete().eq("id", id);
    await fetchItems();
    setLoading(false);
  };

  /* ================= UI ================= */

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Attrezzatura MIBU</h1>

      {/* CREA */}
      <h2>Aggiungi attrezzatura</h2>
      <div style={styles.newRow}>
        <div style={styles.field}>
          <label>Nome</label>
          <input
            style={styles.input}
            value={nuova.nome}
            onChange={(e) =>
              setNuova({ ...nuova, nome: e.target.value })
            }
          />
        </div>

        <div style={styles.field}>
          <label>Immagine (URL)</label>
          <input
            style={styles.input}
            value={nuova.image_url}
            onChange={(e) =>
              setNuova({ ...nuova, image_url: e.target.value })
            }
          />
        </div>

        <div style={styles.field}>
          <label>Categoria</label>
          <input
            style={styles.input}
            list="categorie-attrezzatura-list"
            value={nuova.categoria}
            onChange={(e) =>
              setNuova({ ...nuova, categoria: e.target.value })
            }
          />
          <datalist id="categorie-attrezzatura-list">
            {categorie.map((c) => (
              <option key={c.id} value={c.nome} />
            ))}
          </datalist>
        </div>

        <div style={styles.field}>
          <label>Note</label>
          <textarea
            style={styles.input}
            value={nuova.note}
            onChange={(e) =>
              setNuova({ ...nuova, note: e.target.value })
            }
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={salvaNuova} style={styles.saveButton}>
          💾 Salva attrezzatura
        </button>
      </div>

      {/* TABELLA */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nome</th>
            <th style={styles.th}>Stato</th>
            <th style={styles.th}>Categoria</th>
            <th style={styles.th}>Note</th>
            <th style={styles.th}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td style={styles.td}>
                <input
                  style={styles.input}
                  value={i.nome}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === i.id
                          ? {
                              ...x,
                              nome: e.target.value,
                              dirty: true,
                            }
                          : x
                      )
                    )
                  }
                />
                {i.image_url && (
                  <img
                    src={i.image_url}
                    style={{ width: 120, marginTop: 6 }}
                  />
                )}
              </td>

              <td style={{ ...styles.td, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={i.stato}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === i.id
                          ? {
                              ...x,
                              stato: e.target.checked,
                              dirty: true,
                            }
                          : x
                      )
                    )
                  }
                />
              </td>

              <td style={styles.td}>
                <input
                  style={styles.input}
                  list="categorie-attrezzatura-list"
                  value={i.categoria || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === i.id
                          ? {
                              ...x,
                              categoria: e.target.value,
                              dirty: true,
                            }
                          : x
                      )
                    )
                  }
                />
              </td>

              <td style={styles.td}>
                <textarea
                  style={styles.input}
                  value={i.note || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === i.id
                          ? {
                              ...x,
                              note: e.target.value,
                              dirty: true,
                            }
                          : x
                      )
                    )
                  }
                />
              </td>

              <td style={{ ...styles.td, textAlign: "center" }}>
                {i.dirty && (
                  <button
                    onClick={() => salvaModifica(i)}
                    style={styles.saveButton}
                  >
                    💾
                  </button>
                )}
                <button
                  onClick={() => elimina(i.id)}
                  style={styles.deleteButton}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.some((i) => i.dirty) && (
        <button
          onClick={salvaTutte}
          style={{ ...styles.saveButton, marginTop: 16 }}
        >
          💾 Salva tutte le modifiche
        </button>
      )}

      {loading && <p>Salvataggio…</p>}

      <div style={{ marginTop: 32 }}>
        <button
          onClick={() => router.back()}
          style={styles.backButton}
        >
          ← Torna indietro
        </button>
      </div>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 32, maxWidth: 900, margin: "0 auto", background: "#fff" },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 16 },
  newRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", flex: 1 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 24 },
  th: { padding: 8, borderBottom: "2px solid #ddd" },
  td: { padding: 8, verticalAlign: "top" },
  input: { padding: 6, border: "1px solid #ccc", borderRadius: 4 },
  saveButton: {
    backgroundColor: "#16a34a",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    marginRight: 6,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 28,
    height: 28,
    cursor: "pointer",
  },
  backButton: {
    backgroundColor: "#e5e7eb",
    border: "1px solid #d1d5db",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
  },
};
