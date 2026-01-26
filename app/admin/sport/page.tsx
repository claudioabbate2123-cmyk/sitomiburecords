"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  /* ================= CONTATORI (STRINGHE!) ================= */
  const [flessioni, setFlessioni] = useState("");
  const [addominali, setAddominali] = useState("");

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
      setFlessioni(String(data.flessioni));
      setAddominali(String(data.addominali));
    } else {
      setRecordId(null);
      setSeconds(0);
      setFlessioni("");
      setAddominali("");
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
      flessioni: Number(flessioni),
      addominali: Number(addominali),
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

      <input
        type="date"
        value={dataSelezionata}
        onChange={(e) => setDataSelezionata(e.target.value)}
        style={styles.input}
      />

      <div style={styles.timer}>
        {format(ore)}:{format(minuti)}:{format(secondi)}
      </div>

      <div style={styles.controls}>
        {!running ? (
          <button style={styles.button} onClick={() => setRunning(true)}>
            ▶️ Start
          </button>
        ) : (
          <button style={styles.button} onClick={() => setRunning(false)}>
            ⏸ Stop
          </button>
        )}

        {!running && seconds > 0 && (
          <button style={styles.button} onClick={salvaTempo}>
            💾 Salva allenamento
          </button>
        )}
      </div>

      <div style={styles.counters}>
        <label style={styles.label}>
          Flessioni
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={flessioni}
            onChange={(e) => setFlessioni(e.target.value)}
          />
        </label>

        <label style={styles.label}>
          Addominali
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={addominali}
            onChange={(e) => setAddominali(e.target.value)}
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
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
  },
  button: {
    cursor: "pointer",
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    fontWeight: 600,
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
