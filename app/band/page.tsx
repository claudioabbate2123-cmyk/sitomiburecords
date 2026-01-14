"use client";

export default function BandPage() {
  return (
    <main style={styles.page}>
      {/* HERO PAGINA */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Le nostre band</h1>
        <p style={styles.intro}>
          MIBU è casa di progetti musicali diversi, uniti dalla ricerca,
          dalla tradizione e dalla contaminazione tra linguaggi musicali.
        </p>
      </section>

      {/* BAND PRINCIPALE */}
      <section style={styles.featured}>
        <div style={styles.featuredContent}>
          <h2 style={styles.featuredTitle}>La Canchanchara</h2>
          <span style={styles.genre}>Timba cubana contemporanea</span>

          <p style={styles.text}>
            La Canchanchara nasce come progetto di musica originale di timba cubana, dove ritmo, parola e movimento si intrecciano in un racconto sonoro contemporaneo.
Una musica viva, profondamente radicata nella cultura cubana ma aperta alla sperimentazione e al dialogo con altri linguaggi.
          </p>
        </div>
      </section>

      {/* ALTRE BAND */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Altri progetti musicali</h2>

        <div style={styles.grid}>
          <BandCard
            nome="Blue en Santiago"
            genere="Son cubano"
            descrizione="Un omaggio alle radici del son tradizionale cubano, tra ritmo, danza e poesia."
          />

          <BandCard
            nome="Manente"
            genere="Musica popolare calabrese"
            descrizione="Un progetto che esplora la tradizione musicale calabrese con uno sguardo contemporaneo."
          />
          <BandCard
            nome="Mangoson"
            genere="musica popolare cubana/latin jazz"
            descrizione="La versione ristretta de La Canchanchara orientata a un repertorio misto di musica cubana"
          />
          <BandCard
            nome="Roman Villanueva’s Latin Jazz Sextet"
            genere="Latin jazz"
            descrizione="Jazz e ritmi afro-caraibici si incontrano in un progetto energico e raffinato."
          />
          <BandCard
            nome="Acdm4"
            genere="Jazz"
            descrizione="Un quartetto jazz che spazia tra composizioni originali e riletture moderne."
          />
        </div>
      </section>
    </main>
  );
}

/* ================= COMPONENTE CARD ================= */

function BandCard({
  nome,
  genere,
  descrizione,
}: {
  nome: string;
  genere: string;
  descrizione: string;
}) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{nome}</h3>
      <span style={styles.cardGenre}>{genere}</span>
      <p style={styles.cardText}>{descrizione}</p>
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

  /* BAND PRINCIPALE */
  featured: {
    background: "#fff",
    padding: "48px",
    borderRadius: 12,
    maxWidth: 1000,
    margin: "0 auto 80px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },

  featuredContent: {
    maxWidth: 700,
  },

  featuredTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 8,
    color: "#000",
  },

  genre: {
    display: "inline-block",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 1,
    color: "#666",
    textTransform: "uppercase",
  },

  text: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "#333",
  },

  /* ALTRE BAND */
  section: {
    maxWidth: 1100,
    margin: "0 auto",
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 32,
    textAlign: "center",
    color: "#000",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
  },

  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
    color: "#000",
  },

  cardGenre: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: "uppercase",
    color: "#777",
  },

  cardText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#444",
  },
};
