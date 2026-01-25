"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SportRecord = {
  id: number;
  data: string;
  ore: number;
  minuti: number;
  secondi: number;
  flessioni: number;
  addominali: number;
};

export default function SportPage() {
  const router = useRouter();

  /* ================= DATA ================= */
  const today = new Date().toISOString().slice(0, 10);
  const [dataSelezionata, setDataSelezionata] = useState(today);
  const [recordId, setRecordId] = useState<number | null>(null);

  /* ================= CRONOMETRO ================= */
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= CONTATORI ================= */
  const [flessioni, setFlessioni] = useState(0);
  const [addominali, setAddominali] = useState(0);

  /* ================= LOAD RECORD ================= */
  const fetchSport = async () => {
    const { data } = await supabase
      .from("sport")
      .select("*")
      .eq("data", dataSelezionata)
      .maybeSingle();

    if (data) {
      setRecordId(data.id);
      setSeconds(data.ore * 3600 + data.minuti * 60 + data.secondi);
      setFlessioni(data.flessioni);
      setAddominali(data.addominali);
    } else {
      setRecordId(null);
      setSeconds(0);
      setFlessioni(0);
      setAddominali(0);
    }
  };

  useEffect(() => {
    fetchSport();
  }, [dataSelezionata]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const resetTimer = () => {
    setSeconds(0);
    setRunning(false);
  };

  /* ================= FORMAT ================= */
  const ore = Math.floor(seconds / 3600);
  const minuti = Math.floor((seconds % 3600) / 60);
  const secondi = seconds % 60;

  const format = (n: number) => String(n).padStart(2, "0");

  /* ================= SAVE ================= */
  const salvaTempo = async () => {
    const payload = {
      data: dataSelezionata,
      ore,
      minuti,
      secondi,
      flessioni,
      addominali,
    };

    if (recordId) {
      await supabase.from("sport").update(payload).eq("id", recordId);
    } else {
      await supabase.from("sport").insert(payload);
    }

    alert("Allenamento salvato 💪");
    fetchSport();
  };

  /* ================= UI ================= */
  return (
    <main style={styles.page}>
      <button
        style={styles.dashboardButton}
        onClick={() => router.push("/admin/dashboardareapersonale")}
      >
        ← Torna alla dashboard
      </button>

      <h1 style={styles.title}>🏋️ Sport</h1>

      {/* DATA */}
      <input
        type="date"
        value={dataSelezionata}
        onChange={(e) => setDataSelezionata(e.target.value)}
        style={styles.input}
      />

      {/* CRONOMETRO */}
      <div style={styles.timer}>
        {format(ore)}:{format(minuti)}:{format(secondi)}
      </div>

      <div style={styles.controls}>
        {!running ? (
          <button onClick={() => setRunning(true)}>▶️ Start</button>
        ) : (
          <button onClick={() => setRunning(false)}>⏸ Stop</button>
        )}

        <button onClick={resetTimer}>🔄 Reset</button>

        {!running && seconds > 0 && (
          <button onClick={salvaTempo}>💾 Salva tempo</button>
        )}
      </div>

      {/* CONTATORI */}
      <div style={styles.counters}>
        <label>
          Flessioni
          <input
            type="number"
            value={flessioni}
            onChange={(e) => setFlessioni(Number(e.target.value))}
          />
        </label>

        <label>
          Addominali
          <input
            type="number"
            value={addominali}
            onChange={(e) => setAddominali(Number(e.target.value))}
          />
        </label>
      </div>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 600,
    margin: "0 auto",
    position: "relative",
  },
  title: {
    fontSize: 40,
    fontWeight: 800,
    marginBottom: 24,
  },
  input: {
    padding: "8px 12px",
    fontSize: 16,
    marginBottom: 24,
  },
  timer: {
    fontSize: 48,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 24,
  },
  controls: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginBottom: 32,
  },
  counters: {
    display: "flex",
    gap: 24,
    justifyContent: "center",
  },
  dashboardButton: {
    position: "absolute",
    top: 24,
    right: 24,
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
