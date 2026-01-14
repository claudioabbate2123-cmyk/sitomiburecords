"use client";

import Link from "next/link";

const laboratori = [
  {
    slug: "son-cubano",
    titolo: "Son cubano",
    descrizione:
      "Un laboratorio dedicato alle radici della musica cubana. Ritmi, struttura, ruolo degli strumenti e pratica d’ensemble sul son tradizionale.",
    image: "/son.jpeg",
  },
  {
    slug: "descarga-cubana",
    titolo: "Descarga cubana",
    descrizione:
      "Spazio di improvvisazione collettiva ispirato alla tradizione della descarga. Interplay, linguaggio afro-cubano e libertà espressiva.",
    image: "/descarga.png",
  },
];

export default function LaboratoriPage() {
  return (
    <main style={styles.page}>
      <h1 style={styles.title}><strong>I nostri laboratori</strong></h1>

      <section style={styles.grid}>
        {laboratori.map((lab) => (
          <Link
            key={lab.slug}
            href={`/laboratori/${lab.slug}`}
            style={styles.card}
          >
            {/* IMMAGINE */}
            <img
              src={lab.image}
              alt={lab.titolo}
              style={styles.image}
            />

            <h2 style={styles.cardTitle}>{lab.titolo}</h2>
            <p style={styles.cardText}>{lab.descrizione}</p>
            <span style={styles.cta}>Scopri di più →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 40,
    background: "#f4f4f4",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },

  title: {
    fontSize: 32,
    marginBottom: 32,
    color: "#000",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
  },

  card: {
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textDecoration: "none",
    color: "#000",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  image: {
    width: "100%",
    height: 500,
    objectFit: "cover",
  },

  cardTitle: {
    fontSize: 20,
    margin: "16px 16px 0",
  },

  cardText: {
    fontSize: 14,
    lineHeight: 1.5,
    margin: "12px 16px",
    flex: 1,
  },

  cta: {
    margin: "0 16px 16px",
    fontSize: 14,
    fontWeight: 600,
  },
};
