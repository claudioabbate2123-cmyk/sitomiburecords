"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Peso = {
  id: number;
  data: string;
  peso: number;
};

const mesi = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
];

export default function MonitoraggioPeso() {
  const router = useRouter();
  const today = new Date();
  const [mese, setMese] = useState(today.getMonth());
  const [anno, setAnno] = useState(today.getFullYear());
  const [data, setData] = useState("");
  const [peso, setPeso] = useState("");
  const [records, setRecords] = useState<Peso[]>([]);

  /* ================= FETCH ================= */

  const fetchPeso = async () => {
    const start = `${anno}-${String(mese + 1).padStart(2, "0")}-01`;
    const end = `${anno}-${String(mese + 1).padStart(2, "0")}-31`;

    const { data } = await supabase
      .from("peso")
      .select("*")
      .gte("data", start)
      .lte("data", end)
      .order("data");

    setRecords(data ?? []);
  };

  useEffect(() => {
    fetchPeso();
  }, [mese, anno]);

  /* ================= INSERT ================= */

  const aggiungiPeso = async () => {
    if (!data || !peso) return;

    await supabase.from("peso").insert({
      data,
      peso: Number(peso),
    });

    setData("");
    setPeso("");
    fetchPeso();
  };

  /* ================= UPDATE ================= */

  const aggiornaPeso = async (id: number, value: string) => {
    await supabase
      .from("peso")
      .update({ peso: Number(value) })
      .eq("id", id);

    fetchPeso();
  };

  /* ================= DELETE ================= */

  const eliminaPeso = async (id: number) => {
    await supabase.from("peso").delete().eq("id", id);
    fetchPeso();
  };

  /* ================= DATI GRAFICO ================= */

  const chartData = records.map((r) => ({
    giorno: new Date(r.data).getDate(),
    peso: r.peso,
  }));

  return (
    <main style={styles.page}>
       <button
            style={styles.dashboardButton}
            onClick={() => router.push("/admin/dashboardareapersonale")}
        >
  ← Torna alla dashboard
</button>
 
      <h1 style={styles.title}>⚖️ Monitoraggio peso</h1>

      {/* ===== INSERIMENTO ===== */}
      <section style={styles.card}>
        <h2>Aggiungi misurazione</h2>

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <input
          type="number"
          step="0.1"
          placeholder="Peso (kg)"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        />

        <button style={styles.addButton} onClick={aggiungiPeso}>
          ➕ Aggiungi
        </button>
      </section>

      {/* ===== FILTRI ===== */}
      <section style={styles.filters}>
        <select value={mese} onChange={(e) => setMese(Number(e.target.value))}>
          {mesi.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <select value={anno} onChange={(e) => setAnno(Number(e.target.value))}>
          {Array.from({ length: 10 }).map((_, i) => {
            const y = today.getFullYear() - 5 + i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </section>

      {/* ===== LISTA ===== */}
      <section style={styles.card}>
        <h2>Misurazioni del mese</h2>

        {records.map((r) => (
          <div key={r.id} style={styles.row}>
            {/* SOLO GIORNO */}
            <span>{new Date(r.data).getDate()}</span>

            <input
              type="number"
              step="0.1"
              defaultValue={r.peso}
              onBlur={(e) => aggiornaPeso(r.id, e.target.value)}
              style={{ width: 80 }}
            />

            <button onClick={() => eliminaPeso(r.id)}>❌</button>
          </div>
        ))}
      </section>

      {/* ===== GRAFICO ===== */}
      <section style={styles.card}>
        <h2>Andamento peso</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="giorno" />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip labelFormatter={(v) => `Giorno ${v}`} />
            <Line
              type="monotone"
              dataKey="peso"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 900,
    margin: "0 auto",
  },
 dashboardButton: {
  position: "absolute",
  top: 24,
  right: 24,
  backgroundColor: "#111827",
  color: "#ffffff",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
},


  title: {
    fontSize: 42,
    fontWeight: 800,
    marginBottom: 24,
},

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  filters: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  addButton: {
    marginTop: 12,
    cursor: "pointer", // 👈 manina
  },
};
