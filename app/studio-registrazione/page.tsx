"use client";

export default function StudioRegistrazionePage() {
  return (
    <main style={styles.page}>
      {/* TITOLO */}
      <h1 style={styles.title}><strong>Studio di registrazione</strong></h1>

      {/* IMMAGINE FULL WIDTH */}
      <div style={styles.imageWrapper}>
        <img
          src="/studio.jpg"
          alt="Studio di registrazione MIBU"
          style={styles.image}
        />
      </div>

      {/* SEZIONE EDITORIALE */}
      <section style={styles.editorial}>
        <p>
          Lo studio di registrazione MIBU nasce per offrire uno spazio creativo,
          professionale e accogliente. Qui artisti e band possono dare forma alle
          proprie idee, lavorando con attrezzature di qualità e un ambiente
          pensato per la produzione musicale.
        </p>

        <p>
          Registrazione, mixing e produzione: accompagniamo i musicisti in ogni
          fase del processo creativo, mantenendo sempre al centro la qualità
          del suono e l’identità artistica.
        </p>
      </section>
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "32px",
    fontFamily: "sans-serif",
  },

  title: {
    fontSize: 32,
    marginBottom: 24,
    textAlign: "center",

  },

  imageWrapper: {
    width: "100%",
    marginBottom: 32,
  },

  image: {
    width: "100%",
    height: "auto",
    borderRadius: 8,
    objectFit: "cover",
  },

  editorial: {
    maxWidth: 1800,
    fontSize: 25,
    lineHeight: 1.6,
  },
};
