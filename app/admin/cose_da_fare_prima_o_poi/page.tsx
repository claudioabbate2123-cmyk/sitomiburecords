"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ================= TIPI ================= */

type CosaDaFare = {
  id: number;
  nome: string;
};

/* ================= COMPONENTE ================= */

export default function CoseDaFarePrimaOPoi() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [lista, setLista] = useState<CosaDaFare[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /* ================= AUTO RESIZE ================= */

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  /* ================= FETCH ================= */

  const fetchCose = async () => {
    const { data } = await supabase
      .from("cose_da_fare_prima_o_poi")
      .select("*")
      .order("id", { ascending: false });

    setLista(data ?? []);
  };

  useEffect(() => {
    fetchCose();
  }, []);

  /* ================= INSERT ================= */

  const aggiungiCosa = async () => {
    if (!nome.trim()) return;

    await supabase.from("cose_da_fare_prima_o_poi").insert({
      nome,
    });

    setNome("");
    fetchCose();
  };

  /* ================= UPDATE ================= */

  const aggiornaNome = async (id: number, value: string) => {
    await supabase
      .from("cose_da_fare_prima_o_poi")
      .update({ nome: value })
      .eq("id", id);

    fetchCose();
  };

  /* ================= RENDER ================= */

  return (
    <main style={styles.page}>
      {/* TORNA ALLA DASHBOARD */}
      <button
        style={styles.backButton}
        onClick={() => router.push("/admin/dashboardareapersonale")}
      >
        ← Torna alla dashboard
      </button>

      <h1 style={styles.title}>📝 Cose da fare</h1>

      {/* ===== AGGIUNTA ===== */}
      <section style={styles.card}>
        <h2>Aggiungi nuova cosa</h2>

        <textarea
          ref={textareaRef}
          value={nome}
          placeholder="Scrivi una cosa da fare…"
          onChange={(e) => {
            setNome(e.target.value);
            autoResize(e.target);
          }}
          style={styles.textarea}
        />

        <button style={styles.addButton} onClick={aggiungiCosa}>
          ➕ Aggiungi
        </button>
      </section>

      {/* ===== LISTA ===== */}
      <section style={styles.card}>
        <h2>Elenco</h2>

        {lista.length === 0 && (
          <div style={{ opacity: 0.6 }}>
            Nessuna cosa da fare
          </div>
        )}

        {lista.map((c) => (
          <textarea
            key={c.id}
            defaultValue={c.nome}
            onInput={(e) => autoResize(e.currentTarget)}
            onBlur={(e) =>
              aggiornaNome(c.id, e.currentTarget.value)
            }
            style={{
              ...styles.textarea,
              marginBottom: 12,
            }}
          />
        ))}
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
    position: "relative",
    maxWidth: 800,
    margin: "0 auto",
  },

  title: {
    fontSize: 34,
    fontWeight: 800,
    marginBottom: 32,
  },

  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
    marginBottom: 32,
  },

  textarea: {
    width: "100%",
    resize: "none",
    overflow: "hidden",
    fontSize: 16,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    lineHeight: 1.4,
    marginBottom: 12,
    fontFamily: "inherit",
  },

  addButton: {
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },

  backButton: {
    position: "absolute",
    top: 24,
    right: 32,
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
