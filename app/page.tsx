"use client";

import React, { useState } from "react";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: 4,
  width: "100%",
};

export default function Home() {
  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    email: "",
    messaggio: "",
  });

  const [didatticaOpen, setDidatticaOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/contatti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Errore durante l'invio");
    } else {
      setSuccess(true);
      setForm({
        nome: "",
        cognome: "",
        email: "",
        messaggio: "",
      });
    }

    setLoading(false);
  }

  return (
    <div style={styles.layout}>
      {/* SIDEBAR NERA */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Menu</h2>

        <nav style={styles.nav}>
          <Link href="/eventi" style={styles.navLink}>
            Eventi e Workshop
          </Link>

          <Link href="/studio-registrazione" style={styles.navLink}>
            Studio di registrazione
          </Link>

          <Link href="/band" style={styles.navLink}>
            Le nostre band
          </Link>

          <Link href="/collaborazioni" style={styles.navLink}>
            Collaborazioni
          </Link>

          {/* DROPDOWN DIDATTICA */}
          <div
            style={styles.dropdown}
            onMouseEnter={() => setDidatticaOpen(true)}
            onMouseLeave={() => setDidatticaOpen(false)}
          >
            <span 
              style={styles.navLinkDropdown}
              onClick={() => setDidatticaOpen((prev) => !prev)}
              >
                Didattica ▾
            </span>

            {didatticaOpen && (
              <div style={styles.dropdownMenu}>
                <Link 
                  href="/didattica/laboratori" 
                  style={styles.dropdownItem}
                  onClick={() => setDidatticaOpen(false)}
                >
                  Laboratori
                </Link>
                <Link 
                  href="/didattica/corsi" 
                  style={styles.dropdownItem}
                  onClick={() => setDidatticaOpen(false)}
                >
                  Corsi
                </Link>
                <Link 
                  href="/didattica/dispense" 
                  style={styles.dropdownItem}
                  onClick={() => setDidatticaOpen(false)}
                >
                  Dispense
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* AREA DESTRA */}
      <div style={styles.content}>
        {/* HEADER */}
        <header style={styles.header}>
          <h1 style={styles.siteName}>MIBU</h1>

          <Link href="/admin/login" style={styles.login}>
            Login
          </Link>
        </header>

       

        {/* BIO EDITORIALE */}
      <div style={styles.mainColumn}>
         {/* IMMAGINI */}
        <div style={styles.imagesRow}>
          <img src="/claudio.jpeg" alt="Claudio" style={styles.image} />
          <img src="/fabrizio.jpeg" alt="Fabrizio" style={styles.image} />
        </div>
        <section style={styles.editorial}>
          <p style={styles.editorialText}>
            <strong>MIBU</strong> nasce da un’idea di <strong>Claudio Abbate</strong>  e <strong>Fabrizio Pironi</strong>: 
            creare uno spazio in cui musica, persone e progetti possano
            incontrarsi.
          </p>

          <p style={styles.editorialText}>
            Non si tratta solo un luogo fisico, ma di un modo per
            connettersi tramite la musica e tutti i suoi benefici.
          </p>

          <p style={styles.editorialText}>
            In questo sito troverai tutte le informazioni che ti servono sulle
            nostre attività.
          </p>

          <p style={styles.editorialText}>
            Buona navigazione dallo staff!
          </p>
        </section>

        {/* FORM */}
        <main style={styles.formCard}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>Contattaci</h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <input
              placeholder="Nome"
              value={form.nome}
              onChange={(e) =>
                setForm({ ...form, nome: e.target.value })
              }
              required
              style={inputStyle}
            />

            <input
              placeholder="Cognome"
              value={form.cognome}
              onChange={(e) =>
                setForm({ ...form, cognome: e.target.value })
              }
              required
              style={inputStyle}
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
              style={inputStyle}
            />

            <textarea
              placeholder="Messaggio"
              value={form.messaggio}
              onChange={(e) =>
                setForm({ ...form, messaggio: e.target.value })
              }
              required
              rows={4}
              style={inputStyle}
            />

            <button type="submit" disabled={loading} style={styles.submit}>
              {loading ? "Invio..." : "Invia"}
            </button>

            {success && <p style={{ color: "green" }}>Messaggio inviato!</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </main>
      </div>
    </div>
  </div>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },

 imagesRow: {
  display: "flex",
  justifyContent: "center",
  gap: 40,
  marginTop: 27,
  flexWrap: "wrap",     // 👈 importantissimo
},

  mainColumn: {
    maxWidth: 1300,
    margin: "0 auto",
    padding: "0 8px",
  },
  image: {
  width: "100%",
  maxWidth: 220,   // 👈 limite, non obbligo
  height: "auto",
  aspectRatio: "11 / 15",
  objectFit: "cover",
  borderRadius: 8,
},

  sidebar: {
    width: 220,
    background: "#000",
    color: "#fff",
    padding: 20,
  },

  sidebarTitle: {
    fontSize: 18,
    marginBottom: 16,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  navLink: {
    color: "#fff",
    textDecoration: "none",
    fontSize: 14,
  },

  dropdown: {
    position: "relative",
  },

  navLinkDropdown: {
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
  },

  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    background: "#111",
    borderRadius: 4,
    paddingTop: 6, // ✅ FIX DEFINITIVO
    display: "flex",
    flexDirection: "column",
    minWidth: 160,
    zIndex: 100,
  },

  dropdownItem: {
    padding: "8px 12px",
    color: "#fff",
    textDecoration: "none",
    fontSize: 14,
    whiteSpace: "nowrap",
  },

  content: {
  flex: 1,
  background: "#f4f4f4",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,          // 👈 FONDAMENTALE
  overflowX: "hidden",  // 👈 sicurezza extra
},


  header: {
    background: "#e0e0e0",
    padding: "24px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  siteName: {
  fontSize: 48,
  fontWeight: 800,
  letterSpacing: 4,
  margin: "0 auto",
  textAlign: "center",
  color: "#000", // colore nero 
},

  login: {
    textDecoration: "none",
    color: "#000",
    border: "1px solid #000",
    padding: "6px 12px",
    borderRadius: 4,
    fontSize: 14,
  },

  editorial: {
    marginTop:32,
  },

  editorialText: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "#333",
    textAlign: "left",
  },

  formCard: {
  background: "#fff",
  maxWidth: 520,
  margin: "32px 0px 40px", // 👈 auto, non px
  padding: 24,
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },

  submit: {
    padding: "10px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
