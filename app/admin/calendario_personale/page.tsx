"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ================= TIPI ================= */

type Appuntamento = {
  id: number;
  data: string; // YYYY-MM-DD
  nome_evento: string;
  ora_inizio: string;
  ora_fine: string;
};

/* ================= COSTANTI ================= */

const mesi = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

/* ================= COMPONENTE ================= */

export default function SalaProveCalendar() {
  const router = useRouter();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [eventiPersonali, setEventiPersonali] = useState<Appuntamento[]>([]);

  /* ================= CALCOLO GIORNI ================= */

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = new Date(firstDayOfMonth);
  startDay.setDate(
    startDay.getDate() - ((startDay.getDay() + 6) % 7)
  );

  const endDay = new Date(lastDayOfMonth);
  endDay.setDate(
    endDay.getDate() +
      (7 - ((endDay.getDay() + 6) % 7) - 1)
  );

  const days: Date[] = [];
  let current = new Date(startDay);

  while (current <= endDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  /* ======== FORMAT DATE ======== */

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  /* ================= FETCH EVENTI PERSONALI ================= */

  useEffect(() => {
    const fetchEventi = async () => {
      const start = formatDate(startDay);
      const end = formatDate(endDay);

      const { data, error } = await supabase
        .from("calendario_personale")
        .select("id, data, nome_evento, ora_inizio, ora_fine")
        .gte("data", start)
        .lte("data", end);

      if (!error && data) {
        setEventiPersonali(data);
      }
    };

    fetchEventi();
  }, [month, year]);

  /* ================= EVENTI DEL GIORNO ================= */

  const eventiDelGiorno = (date: Date) => {
    const d = formatDate(date);
    return eventiPersonali.filter((e) => e.data === d);
  };

  /* ================= RENDER ================= */

  return (
    <main style={styles.page}>
      {/* BOTTONE DASHBOARD */}
      <button
        style={styles.dashboardButton}
        onClick={() => router.push("/admin/dashboard")}
      >
        ← Torna alla dashboard
      </button>

      <h1 style={styles.title}>Calendario</h1>

      {/* CONTROLLI */}
      <div style={styles.controls}>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {mesi.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {Array.from({ length: 11 }).map((_, i) => {
            const y = today.getFullYear() - 5 + i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>

      {/* CALENDARIO */}
      <div style={styles.grid}>
        {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map(
          (d) => (
            <div key={d} style={styles.weekday}>
              {d}
            </div>
          )
        )}

        {days.map((date, i) => {
          const isCurrentMonth = date.getMonth() === month;
          const eventi = eventiDelGiorno(date);

          return (
            <div
              key={i}
              style={{
                ...styles.day,
                backgroundColor: eventi.length > 0
                  ? isCurrentMonth
                    ? "#ffd6d6"
                    : "#ffecec"
                  : isCurrentMonth
                    ? "#d9f7d9"
                    : "#eefaf0",
                opacity: isCurrentMonth ? 1 : 0.6,
              }}
              onClick={() => {
                localStorage.setItem(
                  "salaprove:data",
                  formatDate(date)
                );
                router.push("/admin/calendario_personale/edit");
              }}
            >
              <span style={styles.dayNumber}>
                {date.getDate()}
              </span>

              {/* EVENTI */}
              {eventi.map((e) => (
                <div key={e.id} style={styles.event}>
                  <strong>{e.nome_evento}</strong>
                  <div>
                    {e.ora_inizio.slice(0, 5)} –{" "}
                    {e.ora_fine.slice(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "32px",
    position: "relative",
  },

  title: {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 24,
  },

  controls: {
    display: "flex",
    gap: 16,
    marginBottom: 32,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 12,
  },

  weekday: {
    fontWeight: 700,
    textAlign: "center",
  },

  day: {
    minHeight: 130,
    borderRadius: 14,
    padding: 12,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  },

  dayNumber: {
    fontSize: 18,
    fontWeight: 700,
  },

  event: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.3,
    color: "#000",
  },

  /* === SOLO AGGIUNTO === */
  dashboardButton: {
    position: "absolute",
    top: 24,
    right: 32,
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
