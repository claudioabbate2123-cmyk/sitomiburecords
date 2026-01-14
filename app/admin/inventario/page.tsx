"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Attrezzatura = {
  id: string;
  nome: string;
  categoria: string | null;
  quantita: number;
  stato: "disponibile" | "in uso" | "guasto";
  note: string;
  marca: string;
  modello: string;
  seriale: string;
  posizione: string;
};

export default function Inventario() {
  const router = useRouter();
  const [items, setItems] = useState<Attrezzatura[]>([]);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [note, setNote]= useState("");
  const [marca, setMarca]= useState("");
  const [modello, setModello]= useState("");
  const [seriale, setSeriale]= useState("");
  const [posizione, setPosizione]= useState("");
  const [quantita, setQuantita] = useState(1);
  const [stato, setStato] =
    useState<Attrezzatura["stato"]>("disponibile");

  useEffect(() => {
    checkSession();
    loadItems();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) router.push("/admin/login");
  }

  async function loadItems() {
    const { data, error } = await supabase
      .from("attrezzatura")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setItems(data);
    setLoading(false);
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("attrezzatura").insert({
      nome,
      categoria,
      note,
      marca,
      modello,
      seriale,
      posizione,
      quantita,
      stato,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNome("");
    setCategoria("");
    setNote("");
    setMarca("");
    setModello("");
    setSeriale("");
    setQuantita(1);
    setStato("disponibile");
    loadItems();
  }

  async function updateQuantita(id: string, quantita: number) {
    const { error } = await supabase
      .from("attrezzatura")
      .update({ quantita })
      .eq("id", id);

    if (error) alert(error.message);
    else loadItems();
  }

  async function updateStato(
    id: string,
    stato: Attrezzatura["stato"]
  ) {
    const { error } = await supabase
      .from("attrezzatura")
      .update({ stato })
      .eq("id", id);

    if (error) alert(error.message);
    else loadItems();
  }

  async function deleteItem(id: string) {
    if (!confirm("Eliminare questa attrezzatura?")) return;

    const { error } = await supabase
      .from("attrezzatura")
      .delete()
      .eq("id", id);

    if (error) alert(error.message);
    else loadItems();
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1>Inventario Attrezzatura</h1>
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

      {/* FORM */}
      <section style={styles.card}>
        <h2>Aggiungi Attrezzatura</h2>
        <form onSubmit={addItem} style={styles.form}>
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={styles.input}
          />
          <input
            placeholder="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Modello"
            value={modello}
            onChange={(e) => setModello(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Seriale"
            value={seriale}
            onChange={(e) => setSeriale(e.target.value)}
            style={styles.input}
          />
          <input
            placeholder="Posizione"
            value={posizione}
            onChange={(e) => setPosizione(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            min={1}
            value={quantita}
            onChange={(e) => setQuantita(Number(e.target.value))}
            style={styles.input}
          />

          {/* STATO */}
          <select
            value={stato}
            onChange={(e) =>
              setStato(e.target.value as Attrezzatura["stato"])
            }
            style={styles.input}
          >
            <option value="disponibile">Disponibile</option>
            <option value="in uso">In uso</option>
            <option value="guasto">Guasto</option>
          </select>
          <input
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Aggiungi
          </button>
        </form>
      </section>

      {/* TABELLA */}
      <section style={styles.card}>
        <h2>Lista Attrezzatura</h2>

        {loading ? (
          <p>Caricamento...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableCell}>Nome</th>
                <th style={styles.tableCell}>Categoria</th>
                <th style={styles.tableCell}>Marca</th>
                <th style={styles.tableCell}>Modello</th>
                <th style={styles.tableCell}>Seriale</th>
                <th style={styles.tableCell}>Posizione</th>
                <th style={styles.tableCell}>Quantità</th>
                <th style={styles.tableCell}>Stato</th>
                <th style={styles.tableCell}>Note</th>
                <th style={styles.tableCell}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={styles.tableCell}>{item.nome}</td>
                  <td style={styles.tableCell}>{item.categoria}</td>
                  <td style={styles.tableCell}>{item.marca}</td>
                  <td style={styles.tableCell}>{item.modello}</td>
                  <td style={styles.tableCell}>{item.seriale}</td>
                  <td style={styles.tableCell}>{item.posizione}</td>
                  <td style={styles.tableCell}>
                    <input
                      type="number"
                      min={0}
                      defaultValue={item.quantita}
                      style={styles.qtyInput}
                      onBlur={(e) =>
                        updateQuantita(
                          item.id,
                          Number(e.target.value)
                        )
                      }
                    />
                  </td>

                  {/* STATO MODIFICABILE */}
                  <td style={styles.tableCell}>
                    <select
                      value={item.stato}
                      onChange={(e) =>
                        updateStato(
                          item.id,
                          e.target.value as Attrezzatura["stato"]
                        )
                      }
                    >
                      <option value="disponibile">Disponibile</option>
                      <option value="in uso">In uso</option>
                      <option value="guasto">Guasto</option>
                    </select>
                  </td>
                  <td style={styles.tableCell}>{item.note}</td>

                  <td style={styles.tableCell}>
                    <button
                      style={styles.delete}
                      onClick={() => deleteItem(item.id)}
                    >
                      Elimina
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 32,
    background: "#f4f4f4",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    flex: "1 1 150px",
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
  tableCell: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
    textAlign: "left",
  },
  qtyInput: {
    width: 60,
    padding: "6px",
    textAlign: "center",
  },
  delete: {
    background: "#c00",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    cursor: "pointer",
  },
};
