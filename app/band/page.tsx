"use client";

import Link from "next/link";

export default function CorsiPage() {
  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Corsi</h1>
        <p style={styles.intro}>
          Percorsi formativi dedicati alla musica afro-cubana, latina
          e alla produzione musicale, guidati da musicisti e docenti attivi
          sulla scena contemporanea.
        </p>
      </section>

      {/* GRIGLIA CORSI */}
      <section style={styles.section}>
        <div style={styles.grid}>
          <CorsoLink href="/didattica/corsi/pianoforte-latino">
            <CorsoCard
              titolo="Pianoforte latino"
              docente="Claudio Abbate"
              immagine="/pianofortelatino.JPG"
            />
          </CorsoLink>

          <CorsoLink href="/didattica/corsi/congas">
            <CorsoCard
              titolo="Congas"
              docente="Fabrizio Pironi"
              immagine="/congas.JPG"
            />
          </CorsoLink>

          <CorsoLink href="/didattica/corsi/cubase">
            <CorsoCard
              titolo="Cubase – Produzione musicale"
              docente="Claudio Abbate"
              immagine="/cubaseproduzione.JPG"
            />
          </CorsoLink>

          <CorsoLink href="/didattica/corsi/basso-latino">
            <CorsoCard
              titolo="Basso latino"
              docente="Michele Ferretti"
              immagine="/bassolatino.JPG"
            />
          </CorsoLink>

          <CorsoLink href="/didattica/corsi/batteria-timba">
            <CorsoCard
              titolo="Batteria nella timba cubana"
              docente="Manuel Flores"
              immagine="/batteriatimba.JPG"
            />
          </CorsoLink>

          <CorsoLink href="/didattica/corsi/dj">
            <CorsoCard
              titolo="Corso di DJ"
              docente="Fabrizio Pironi"
              immagine="/djcourse.JPG"
            />
          </CorsoLink>
        </div>
      </section>
    </main>
  );
}

/* ================= LINK WRAPPER ================= */

function CorsoLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {children}
    </Link>
  );
}

/* ================= CARD ================= */

function CorsoCard({
  titolo,
  docente,
  immagine,
}: {
  titolo: string;
  docente: string;
  immagine: string;
}) {
  return (
    <div style={styles.card}>
      <img
        src={immagine}
        alt={titolo}
        style={styles.cardImage}
      />

      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle}>{titolo}</h3>
        <span style={styles.cardDocente}>{docente}</span>
      </div>
    </div>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "48px 32px",
    background: "#f4f4f4",
    fontFamily: "sans-serif",
    minHeight: "100vh",
  },

  hero: {
    maxWidth: 900,
    margin: "0 auto 64px",
    textAlign: "center",
  },

  title: {
    fontSize: 42,
    fontWeight: 800,
    marginBottom: 16,
    color: "#000",
  },

  intro: {
    fontSize: 18,
    color: "#444",
    lineHeight: 1.6,
  },

  section: {
    maxWidth: 1100,
    margin: "0 auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 32,
  },

  card: {
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },

  cardImage: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    display: "block",
  },

  cardContent: {
    padding: 24,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
    color: "#000",
  },

  cardDocente: {
    fontSize: 14,
    fontWeight: 600,
    color: "#666",
  },
};
