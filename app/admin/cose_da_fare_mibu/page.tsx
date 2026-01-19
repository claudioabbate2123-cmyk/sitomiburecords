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

type CosaDaFare = {
  id: number;
  descrizione: string;
  fatto: boolean;
  categoria?: string | null;
  dirty?: boolean;
};

type Categoria = {
  id: number;
  nome: string;
};

/* ================= COMPONENTE ================= */

export default function CoseDaFareMibuPage() {
  const router = useRouter();

  const [coseDaFare, setCoseDaFare] = useState<CosaDaFare[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  const [categoriaFiltro, setCategoriaFiltro] = useState("tutte");
  const [statoFiltro, setStatoFiltro] = useState<
    "tutte" | "fatte" | "non_fatte"
  >("tutte");

  const [nuovaCosaDaFare, setNuovaCosaDaFare] = useState({
    descrizione: "",
    categoria: "",
  });

  /* ================= LOAD ================= */

  const fetchCoseDaFare = async () => {
    let query = supabase
      .from("cose_da_fare_mibu")
      .select("id, descrizione, fatto, categoria")
      .order("created_at");

    if (statoFiltro === "fatte") query = query.eq("fatto", true);
    if (statoFiltro === "non_fatte") query = query.eq("fatto", false);

    const { data } = await query;
    setCoseDaFare(data || []);
  };

  const fetchCategorie = async () => {
    const { data } = await supabase
      .from("categorie_cose_da_fare_mibu")
      .select("id, nome")
      .order("nome");

    setCategorie(data || []);
  };

  useEffect(() => {
    fetchCoseDaFare();
    fetchCategorie();
  }, [statoFiltro]);

  /* ================= CREATE ================= */

  const salvaCosaDaFare = async () => {
    if (!nuovaCosaDaFare.descrizione) {
      alert("Compila il campo descrizione");
      return;
    }

    setLoading(true);

    if (nuovaCosaDaFare.categoria) {
      const { data: esistente } = await supabase
        .from("categorie_cose_da_fare_mibu")
        .select("id")
        .eq("nome", nuovaCosaDaFare.categoria)
        .maybeSingle();

      if (!esistente) {
        await supabase.from("categorie_cose_da_fare_mibu").insert({
          nome: nuovaCosaDaFare.categoria,
        });
      }
    }

    await supabase.from("cose_da_fare_mibu").insert({
      descrizione: nuovaCosaDaFare.descrizione,
      fatto: false,
      categoria: nuovaCosaDaFare.categoria || null,
    });

    setNuovaCosaDaFare({ descrizione: "", categoria: "" });
    await fetchCoseDaFare();
    await fetchCategorie();
    setLoading(false);
  };

  /* ================= UPDATE ================= */

  const salvaCosaDaFareModificata = async (cosa: CosaDaFare) => {
    setLoading(true);

    if (cosa.categoria) {
      const { data: esistente } = await supabase
        .from("categorie_cose_da_fare_mibu")
        .select("id")
        .eq("nome", cosa.categoria)
        .maybeSingle();

      if (!esistente) {
        await supabase.from("categorie_cose_da_fare_mibu").insert({
          nome: cosa.categoria,
        });
      }
    }

    await supabase
      .from("cose_da_fare_mibu")
      .update({
        descrizione: cosa.descrizione,
        fatto: cosa.fatto,
        categoria: cosa.categoria || null,
      })
      .eq("id", cosa.id);

    setCoseDaFare((prev) =>
      prev.map((c) => (c.id === cosa.id ? { ...c, dirty: false } : c))
    );

    await fetchCategorie();
    setLoading(false);
  };

  const salvaTutteLeModifiche = async () => {
    const daSalvare = coseDaFare.filter((c) => c.dirty);
    if (!daSalvare.length) return;

    setLoading(true);

    for (const cosa of daSalvare) {
      if (cosa.categoria) {
        const { data: esistente } = await supabase
          .from("categorie_cose_da_fare_mibu")
          .select("id")
          .eq("nome", cosa.categoria)
          .maybeSingle();

        if (!esistente) {
          await supabase.from("categorie_cose_da_fare_mibu").insert({
            nome: cosa.categoria,
          });
        }
      }

      await supabase
        .from("cose_da_fare_mibu")
        .update({
          descrizione: cosa.descrizione,
          fatto: cosa.fatto,
          categoria: cosa.categoria || null,
        })
        .eq("id", cosa.id);
    }

    setCoseDaFare((prev) =>
      prev.map((c) => (c.dirty ? { ...c, dirty: false } : c))
    );

    await fetchCategorie();
    setLoading(false);
  };

  /* ================= DELETE ================= */

  const eliminaCosaDaFare = async (id: number) => {
    if (!confirm("Eliminare questa cosa da fare?")) return;
    setLoading(true);
    await supabase.from("cose_da_fare_mibu").delete().eq("id", id);
    await fetchCoseDaFare();
    setLoading(false);
  };

  /* ================= UI ================= */

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Cose da fare MIBU</h1>

      {/* CREA COSA DA FARE */}
      <h2 style={{ marginBottom: 12 }}>Aggiungi cosa da fare</h2>

      <div style={styles.newBookingRow}>
        <div style={styles.field}>
          <label style={styles.label}>Descrizione</label>
          <textarea
            style={{ ...styles.input, resize: "none", overflow: "hidden" }}
            value={nuovaCosaDaFare.descrizione}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = t.scrollHeight + "px";
            }}
            onChange={(e) =>
              setNuovaCosaDaFare({
                ...nuovaCosaDaFare,
                descrizione: e.target.value,
              })
            }
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Categoria</label>
          <input
            style={styles.input}
            list="categorie-list"
            value={nuovaCosaDaFare.categoria}
            onChange={(e) =>
              setNuovaCosaDaFare({
                ...nuovaCosaDaFare,
                categoria: e.target.value,
              })
            }
          />
          <datalist id="categorie-list">
            {categorie.map((c) => (
              <option key={c.id} value={c.nome} />
            ))}
          </datalist>
        </div>
      </div>

      <div style={{ marginTop: 24, marginBottom: 32 }}>
        <button onClick={salvaCosaDaFare} style={styles.saveButton}>
            💾 Salva cosa da fare
        </button>
      </div>

      {/* FILTRI */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          style={styles.input}
        >
          <option value="tutte">Tutte le categorie</option>
          {categorie.map((c) => (
            <option key={c.id} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          value={statoFiltro}
          onChange={(e) =>
            setStatoFiltro(e.target.value as any)
          }
          style={styles.input}
        >
          <option value="tutte">Tutte</option>
          <option value="fatte">Fatte</option>
          <option value="non_fatte">Non fatte</option>
        </select>
      </div>

      {/* TABELLA */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Descrizione</th>
            <th style={styles.th}>Fatto</th>
            <th style={styles.th}>Categoria</th>
            <th style={styles.th}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {coseDaFare
            .filter((c) =>
              categoriaFiltro === "tutte"
                ? true
                : c.categoria === categoriaFiltro
            )
            .map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>
                  <textarea
                    style={{ ...styles.input, resize: "none" }}
                    value={c.descrizione}
                    onChange={(e) =>
                      setCoseDaFare((prev) =>
                        prev.map((x) =>
                          x.id === c.id
                            ? { ...x, descrizione: e.target.value, dirty: true }
                            : x
                        )
                      )
                    }
                  />
                </td>

                <td style={{ ...styles.td, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={c.fatto}
                    onChange={(e) =>
                      setCoseDaFare((prev) =>
                        prev.map((x) =>
                          x.id === c.id
                            ? { ...x, fatto: e.target.checked, dirty: true }
                            : x
                        )
                      )
                    }
                  />
                </td>

                <td style={styles.td}>
                  <input
                    style={styles.input}
                    list="categorie-list"
                    value={c.categoria || ""}
                    onChange={(e) =>
                      setCoseDaFare((prev) =>
                        prev.map((x) =>
                          x.id === c.id
                            ? { ...x, categoria: e.target.value, dirty: true }
                            : x
                        )
                      )
                    }
                  />
                </td>

                <td style={{ ...styles.td, textAlign: "center" }}>
                  {c.dirty && (
                    <button
                      onClick={() => salvaCosaDaFareModificata(c)}
                      style={{ ...styles.saveButton, padding: "4px 10px" }}
                    >
                      💾
                    </button>
                  )}
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

      {coseDaFare.some((c) => c.dirty) && (
        <button
          onClick={salvaTutteLeModifiche}
          style={{ ...styles.saveButton, backgroundColor: "#2563eb" }}
        >
          💾 Salva tutte le modifiche
        </button>
      )}

      {loading && <p>Salvataggio…</p>}

        <div style={{ marginTop: 48, display: "flex", gap: 12 }}>
            <button
                onClick={() => router.push("/admin/categorie_cose_da_fare_mibu")}
                style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                }}
            >
                ⚙️ Gestisci categorie
            </button>

            <button
                onClick={() => router.back()}
                style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
                padding: "8px 14px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                cursor: "pointer",
                }}
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
  newBookingRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", flex: 1 },
  label: { fontSize: 13, fontWeight: 600, marginBottom: 4 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 16 },
  th: { padding: 8, borderBottom: "2px solid #ddd" },
  td: { padding: 8, verticalAlign: "top" },
  input: {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: "#16a34a",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    marginRight: 8,
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
};
