"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ================= TIPI ================= */

type Evento = {
  id: number;
  data: string;
  ora_inizio: string;
  ora_fine: string;
  prezzo: number;
  nome_gruppo: string;
  tesoriere: boolean;
};

/* ================= COMPONENTE ================= */

export default function BilancioMensilePage() {
  const oggi = new Date();

  const [mese, setMese] = useState(oggi.getMonth() + 1);
  const [anno, setAnno] = useState(oggi.getFullYear());

  const [eventi, setEventi] = useState<Evento[]>([]);
  const [totale, setTotale] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ================= CALCOLO RANGE DATE ================= */

  const getRangeDate = () => {
    const start = `${anno}-${String(mese).padStart(2, "0")}-15`;

    const meseSuccessivo = mese === 12 ? 1 : mese + 1;
    const annoSuccessivo = mese === 12 ? anno + 1 : anno;

    const end = `${annoSuccessivo}-${String(meseSuccessivo).padStart(
      2,
      "0"
    )}-15`;

    return { start, end };
  };

  /* ================= FETCH DATI ================= */

  const fetchBilancio = async () => {
    const { start, end } = getRangeDate();

    setLoading(true);

    const { data, error } = await supabase
      .from("salaprove")
      .select(
        "id, data, ora_inizio, ora_fine, prezzo, nome_gruppo, tesoriere"
      )
      .gte("data", start)
      .lte("data", end)
      .order("data", { ascending: true })
      .order("ora_inizio", { ascending: true });

    if (!error && data) {
      setEventi(data);
      const somma = data.reduce((acc, e) => acc + e.prezzo, 0);
      setTotale(somma);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBilancio();
  }, [mese, anno]);

  /* ================= UPDATE TESORIERE ================= */

  const toggleTesoriere = async (id: number, value: boolean) => {
    await supabase.from("salaprove").update({ tesoriere: value }).eq("id", id);

    setEventi((prev) =>
      prev.map((e) => (e.id === id ? { ...e, tesoriere: value } : e))
    );
  };

  /* ================= PDF ================= */

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text("Bilancio Mensile Sala Prove", 10, y);
    y += 10;

    const { start, end } = getRangeDate();
    doc.setFontSize(10);
    doc.text(`Periodo: ${formatDateEU(start)} / ${formatDateEU(end) }`, 10, y);
    y += 10;
 
    doc.setFontSize(10); 
    y += 6;

    eventi.forEach((e) => {
      doc.text(`${formatDateEU(e.data)}  ${e.nome_gruppo}  €${e.prezzo.toFixed(2)}`,10,y);
      y += 6;

      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });

    const quotaAffittoPerPersona = (330 - totale) / 2;

    y += 10;
    doc.text(`Totale guadagnato: €${totale.toFixed(2)}`, 10, y);
    y += 6;
    doc.text(
      `Quota affitto per persona: €${quotaAffittoPerPersona.toFixed(2)}`,
      10,
      y
    );
    y += 6;
    doc.text(
      `Quota Fabrizio: €${quotaFabrizio.toFixed(2)}`,
      10,
      y
    );

    doc.save(`Bilancio_${mese}_${anno}.pdf`);
  };

  /* ================= HELPERS ================= */

  const formatDateEU = (date: string) => {
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

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

  const quotaAffittoPerPersona = (330 - totale) / 2;

  const quotaFabrizio =
    eventi
      .filter((e) => e.tesoriere === false)
      .reduce((acc, e) => acc + e.prezzo, 0) + quotaAffittoPerPersona;

  /* ================= RENDER ================= */

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Bilancio Mensile Sala Prove</h1>

      <div style={styles.filters}>
        <select value={mese} onChange={(e) => setMese(Number(e.target.value))}>
          {mesi.map((nome, index) => (
            <option key={index} value={index + 1}>
              {nome}
            </option>
          ))}
        </select>

        <select value={anno} onChange={(e) => setAnno(Number(e.target.value))}>
          {Array.from({ length: 5 }).map((_, i) => {
            const y = oggi.getFullYear() - 2 + i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>

      <p style={{ marginBottom: 16 }}>
        Periodo: <strong>{formatDateEU(getRangeDate().start)}</strong> →{" "}
        <strong>{formatDateEU(getRangeDate().end)}</strong>
      </p>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Data</th>
            <th style={styles.th}>Nome gruppo</th>
            <th style={styles.th}>Ora inizio</th>
            <th style={styles.th}>Ora fine</th>
            <th style={styles.th}>Prezzo (€)</th>
            <th style={styles.th}>Tesoriere</th>
          </tr>
        </thead>
        <tbody>
          {eventi.map((e) => (
            <tr key={e.id}>
              <td style={styles.td}>{formatDateEU(e.data)}</td>
              <td style={styles.td}>{e.nome_gruppo}</td>
              <td style={styles.td}>{e.ora_inizio.slice(0, 5)}</td>
              <td style={styles.td}>{e.ora_fine.slice(0, 5)}</td>
              <td style={styles.td}>{e.prezzo.toFixed(2)}</td>
              <td style={styles.td}>
                <input
                  type="checkbox"
                  checked={e.tesoriere}
                  onChange={(ev) =>
                    toggleTesoriere(e.id, ev.target.checked)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.totalBox}>
        Totale guadagnato: <strong>{totale.toFixed(2)} €</strong>
        <div style={{ marginTop: 6 }}>
          Quota affitto per persona:{" "}
          <strong>{quotaAffittoPerPersona.toFixed(2)} €</strong>
        </div>
        <div style={{ marginTop: 6 }}>
          Quota Fabrizio: <strong>{quotaFabrizio.toFixed(2)} €</strong>
        </div>
      </div>

      <button onClick={generatePDF} style={styles.pdfButton}>
        📄 Scarica PDF
      </button>

      {loading && <p>Caricamento…</p>}
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 1000,
    margin: "0 auto",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 24,
  },
  filters: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 24,
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "2px solid #ddd",
    fontWeight: 700,
  },
  td: {
    padding: "8px",
    borderBottom: "1px solid #eee",
  },
  totalBox: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 24,
  },
  pdfButton: {
    background: "#000",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    borderRadius: 6,
  },
};
