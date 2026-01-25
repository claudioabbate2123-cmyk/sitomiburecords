"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
/* ================= COSE DA CONCERTO ================= */

export const COSE_CONCERTO = [
  "tastiera grande",
  "tastiera piccola",
  "cavo di collegamento tra tastiere",
  "pedale tastiera piccola",
  "pedale tastiera grande",
  "caricatore tastiera grande",
  "caricatore tastiera piccola",
  "tablet",
  "caricatore tablet",
  "caricatore telefono",
  "Penna tablet",
  "leggio",
  "reggitastiera singolo",
  "reggitastiera doppio",
  "cavo jack per tastiera/mixer",
];

/* ================= ATTIVITÀ DI CASA ================= */

export const ATTIVITA_CASA = [
  "lavare piatti",
  "mettere a posto la spesa",
  "spazzare per terra cucina",
  "pulire bagno",
  "pulire superfici cucinina",
  "lavare scola piatti",
  "pulire piatto doccia",
  "rifare il letto",
  "spazzare stanza da letto",
  "lavare pavimento",
  "cucinare cena",
  "cucinare pranzo",
  "aspirare insettini tutte le stanze",
  "sparecchiare",
  "mettere a posto in cucina",
  "buttare mondezza",
];

/* ================= PIANOFORTE / JAZZ ================= */

export const PIANOFORTE_JAZZ = [
  "Impro standard accordi e melodia",
  "Impro standard wolking e melodia",
  "Impro standard piano solo",
  "Impro standard stride piano",
  "accompagnamento standard drop2",
  "accompagnamento walking accordi standard",
  "tema Donna lee",
  "tema Spain",
  "tema Billie's Bounce",
  "tema Blue Bossa",
  "tema Solar",
  "tema Recordame",
  "tema Black Orpheus",
];

/* ================= PIANOFORTE / JAZZ / MAGGIORI ================= */

export const PIANOFORTE_JAZZ_MAGGIORI = [
  "frasi II V I maggiori",
  "accompagnamento drop 2 II V I maggiori",
  "accompagnamento drop 2 con rivolti II V I maggiori",
  "accompagnamento walking sinistra accordi destra II V I maggiori A B",
  "II V I maggiori mano sinistra A B",
  "accompagnamento piano solo II V I maggiori A B",
];

/* ================= PIANOFORTE / JAZZ / MINORI ================= */

export const PIANOFORTE_JAZZ_MINORI = [
  "frasi II V I minori",
  "accompagnamento drop 2 II V I minori",
  "accompagnamento drop 2 con rivolti II V I minori",
  "accompagnamento walking sinistra accordi destra II V I minori A B",
  "II V I minori mano sinistra A B",
  "accompagnamento piano solo II V I minori A B",
];

/* ================= SPORT ================= */

export const SPORT = [
  "correre almeno 1 h",
  "almeno 21 flessioni",
  "almeno 25 addominali",
];

/* ================= TECNICA PIANOFORTE MAGGIORE ================= */

export const TECNICA_PIANOFORTE_MAGGIORE = [
  "scale maggiori",
  "scale pentatoniche maggiori",
  "scale lidie",
  "scale misolidie",
  "arpeggi CEGC sinistra",
  "arpeggi CEGC destra",
   "arpeggi CEGC mani unite",
];

/* ================= TECNICA PIANOFORTE MINORE ================= */

export const TECNICA_PIANOFORTE_MINORE = [
  "scale minori melodiche",
  "scale minori armoniche",
  "scale minori naturali",
  "scale doriche",
  "scale frigie",
  "scale locrie",
  "scale superlocrie",
  "scale semitono-tono",
  "scale pentatoniche minori",
  "scale Blues",
  "arpeggi CEbGC sinistra",
  "arpeggi CEbGC destra",
  "arpeggi CEbGC mani unite",
];
/* ================= SPESA ================= */

export const SPESA = [
  "caffè deca e caffè normale",
  "pellicola trasparente",
  "cassa d'acqua",
  "scottex",
  "banane",
  "burro d'arachidi",
  "insalata",
  "alicette",
  "limoni",
  "mirtilli",
  "uova",
  "pollo",
  "zucchine",
  "pomodori",
  "olive",
  "cavolo romanesco",
  "cavolo bianco",
  "cavolo siciliano"
];

/* ================= SUPABASE ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ================= TIPI ================= */

type Appuntamento = {
  id: number;
  data: string;
  ora_inizio: string;
  ora_fine: string;
  nome_evento: string;
  guadagno:number;
};

type CosaDaFare = {
  id: number;
  elemento: string;
  fatto: boolean;
  categoria?: string | null;
  dirty?: boolean;
};


type Categoria = {
  id: number;
  nome: string;
};

/* ================= COMPONENTE ================= */

export default function CalendarioPersonaleEditPage() {
  const router = useRouter();

  const [dataSelezionata, setDataSelezionata] = useState<string | null>(null);
  const [eventi, setEventi] = useState<Appuntamento[]>([]);
  const [coseDaFare, setCoseDaFare] = useState<CosaDaFare[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("tutte");
  const [statoFiltro, setStatoFiltro] = useState<"tutte" | "fatte" | "non_fatte">("tutte");


  const [nuovoEvento, setNuovoEvento] = useState({
    data: "",
    ora_inizio: "",
    ora_fine: "",
    nome_evento: "",
    guadagno: 0,
  });

  const [nuovaCosaDaFare, setNuovaCosaDaFare] = useState({
    elemento: "",
    categoria: "",
  });

  /* ================= LEGGI DATA DA LOCAL STORAGE ================= */

  useEffect(() => {
    const data = localStorage.getItem("salaprove:data");
    if (!data) return;

    setDataSelezionata(data);
    setNuovoEvento((p) => ({ ...p, data }));
  }, []);

  /* ================= LOAD EVENTI ================= */

  const fetchEventi = async () => {
    if (!dataSelezionata) return;

    const { data } = await supabase
      .from("calendario_personale")
      .select("id, data, ora_inizio, ora_fine, nome_evento, guadagno")
      .eq("data", dataSelezionata)
      .order("ora_inizio");

    setEventi(data || []);
  };

  /* ================= LOAD COSE DA FARE ================= */

  const fetchCoseDaFare = async () => {
      if (!dataSelezionata) return;

      let query = supabase
        .from("cose_da_fare")
        .select("id, elemento, fatto, categoria")
        .eq("data", dataSelezionata)
        .order("created_at");

      if (statoFiltro === "fatte") {
        query = query.eq("fatto", true);
      }

      if (statoFiltro === "non_fatte") {
        query = query.eq("fatto", false);
      }

      const { data } = await query;

      setCoseDaFare(data || []);
    };


  /* ================= LOAD CATEGORIE ================= */

  const fetchCategorie = async () => {
    const { data } = await supabase
      .from("categorie_cose_da_fare")
      .select("id, nome")
      .order("nome");

    setCategorie(data || []);
  };
  useEffect(() => {
    fetchEventi();
}, [dataSelezionata]);

  useEffect(() => {
  fetchCoseDaFare();
  fetchCategorie();
}, [dataSelezionata, statoFiltro]);


  /* ================= UPDATE ================= */

  const updateEvento = async (
    id: number,
    field: keyof Appuntamento,
    value: string |number
  ) => {
    setLoading(true);
    await supabase
      .from("calendario_personale")
      .update({ [field]: field === "guadagno" ? Number(value) : value })
      .eq("id", id);
    setLoading(false);
  };

  const updateCosaDaFare = async (
    id: number,
    field: keyof CosaDaFare,
    value: string | boolean
  ) => {
    setLoading(true);
    await supabase
      .from("cose_da_fare")
      .update({ [field]: value })
      .eq("id", id);
    await fetchCoseDaFare();
    setLoading(false);
  };

  /* ================= DELETE ================= */

  const eliminaEvento = async (id: number) => {
    if (!confirm("Eliminare questo appuntamento?")) return;
    setLoading(true);
    await supabase.from("calendario_personale").delete().eq("id", id);
    await fetchEventi();
    setLoading(false);
  };

  const eliminaCosaDaFare = async (id: number) => {
    if (!confirm("Eliminare questa cosa da fare?")) return;
    setLoading(true);
    await supabase.from("cose_da_fare").delete().eq("id", id);
    await fetchCoseDaFare();
    setLoading(false);
  };

  /* ================= UPDATE CATEGORIA================= */
  const updateCategoriaCosaDaFare = async (
  id: number,
  categoria: string
) => {
  setLoading(true);

  if (categoria) {
    const { data: categoriaEsistente } = await supabase
      .from("categorie_cose_da_fare")
      .select("id")
      .eq("nome", categoria)
      .maybeSingle();

    if (!categoriaEsistente) {
      await supabase.from("categorie_cose_da_fare").insert({
        nome: categoria,
      });
    }
  }

  await supabase
    .from("cose_da_fare")
    .update({ categoria: categoria || null })
    .eq("id", id);

  await fetchCategorie();
  await fetchCoseDaFare();

  setLoading(false);
};
    /*==============  SALVA COSA DA FARE    ==========*/ 
    const salvaCosaDaFareModificata = async (cosa: CosaDaFare) => {
        setLoading(true);

        if (cosa.categoria) {
          const { data: categoriaEsistente } = await supabase
            .from("categorie_cose_da_fare")
            .select("id")
            .eq("nome", cosa.categoria)
            .maybeSingle();

          if (!categoriaEsistente) {
            await supabase.from("categorie_cose_da_fare").insert({
              nome: cosa.categoria,
            });
          }
        }

        await supabase
          .from("cose_da_fare")
          .update({
            elemento: cosa.elemento,
            fatto: cosa.fatto,
            categoria: cosa.categoria || null,
          })
          .eq("id", cosa.id);

        // 🔑 aggiorna SOLO lo stato locale di quella riga
          setCoseDaFare((prev) =>
            prev.map((item) =>
              item.id === cosa.id
                ? { ...item, dirty: false }
                : item
            )
          );

          // le categorie possono cambiare → aggiorniamo solo quelle
          await fetchCategorie();

          setLoading(false);
};

/*==============  SALVA TUTTE LE MODIFICHE  ==========*/
const salvaTutteLeModifiche = async () => {
  const daSalvare = coseDaFare.filter((c) => c.dirty);

  if (daSalvare.length === 0) {
    alert("Nessuna modifica da salvare");
    return;
  }

  setLoading(true);

  for (const cosa of daSalvare) {
    // crea categoria se non esiste
    if (cosa.categoria) {
      const { data: categoriaEsistente } = await supabase
        .from("categorie_cose_da_fare")
        .select("id")
        .eq("nome", cosa.categoria)
        .maybeSingle();

      if (!categoriaEsistente) {
        await supabase.from("categorie_cose_da_fare").insert({
          nome: cosa.categoria,
        });
      }
    }

    await supabase
      .from("cose_da_fare")
      .update({
        elemento: cosa.elemento,
        fatto: cosa.fatto,
        categoria: cosa.categoria || null,
      })
      .eq("id", cosa.id);
  }

  // 🔑 pulisce TUTTE le righe salvate
  setCoseDaFare((prev) =>
    prev.map((item) =>
      item.dirty ? { ...item, dirty: false } : item
    )
  );

  await fetchCategorie();
  setLoading(false);
};

  /* ================= CREATE ================= */

  const salvaNuovoEvento = async () => {
    if (
      !nuovoEvento.ora_inizio ||
      !nuovoEvento.ora_fine ||
      !nuovoEvento.nome_evento
    ) {
      alert("Compila tutti i campi");
      return;
    }

    setLoading(true);
    await supabase.from("calendario_personale").insert(nuovoEvento);
    await fetchEventi();

    setNuovoEvento((p) => ({
      ...p,
      ora_inizio: "",
      ora_fine: "",
      nome_evento: "",
      guadagno: 0,
    }));

    setLoading(false);
  };

  const salvaCosaDaFare = async () => {
    if (!nuovaCosaDaFare.elemento || !dataSelezionata) {
      alert("Compila il campo");
      return;
    }

    setLoading(true);

    if (nuovaCosaDaFare.categoria) {
      const { data: categoriaEsistente } = await supabase
        .from("categorie_cose_da_fare")
        .select("id")
        .eq("nome", nuovaCosaDaFare.categoria)
        .maybeSingle();

      if (!categoriaEsistente) {
        await supabase.from("categorie_cose_da_fare").insert({
          nome: nuovaCosaDaFare.categoria,
        });
      }
    }

    await supabase.from("cose_da_fare").insert({
      elemento: nuovaCosaDaFare.elemento,
      data: dataSelezionata,
      fatto: false,
      categoria: nuovaCosaDaFare.categoria || null,
    });

    await fetchCoseDaFare();
    await fetchCategorie();
    setNuovaCosaDaFare({ elemento: "", categoria: "" });
    setLoading(false);
  };

  /* ================= RIMANDA A DOMANI ================= */

  const rimandaADomani = async () => {
      if (!dataSelezionata) return;

      const domani = new Date(dataSelezionata);
      domani.setDate(domani.getDate() + 1);

      const dataDomani = domani.toISOString().slice(0, 10);

      const daRimandare = coseDaFare.filter((c) => !c.fatto);

      if (daRimandare.length === 0) {
        alert("Nessuna cosa da fare da rimandare");
        return;
      }

      if (
        !confirm(
          `Rimandare ${daRimandare.length} cose non fatte a domani e rimuoverle da oggi?`
        )
      ) {
        return;
      }

      setLoading(true);

  /* 1️⃣ INSERISCI A DOMANI */
  const payload = daRimandare.map((c) => ({
    elemento: c.elemento,
    fatto: false,
    data: dataDomani,
    categoria: c.categoria || null,
  }));

  await supabase.from("cose_da_fare").insert(payload);

  /* 2️⃣ ELIMINA DA OGGI */
  const idsDaEliminare = daRimandare.map((c) => c.id);

  await supabase
    .from("cose_da_fare")
    .delete()
    .in("id", idsDaEliminare);

  /* 3️⃣ RICARICA LISTA */
  await fetchCoseDaFare();

  setLoading(false);
  alert("Cose da fare rimandate a domani");
};
/* ================= FUNZIONE ASTRATTA COSE DA FARE ================= */

const salvaListaPerCategoria = async (
  categoria: string,
  lista: string[]
) => {
  if (!dataSelezionata) return;

  setLoading(true);

  // 1️⃣ assicura categoria (senza duplicati)
  const { data: cat } = await supabase
    .from("categorie_cose_da_fare")
    .select("id")
    .eq("nome", categoria)
    .maybeSingle();

  if (!cat) {
    await supabase.from("categorie_cose_da_fare").insert({
      nome: categoria,
    });
  }

  // 2️⃣ evita duplicati per lo stesso giorno
  const { data: esistenti } = await supabase
    .from("cose_da_fare")
    .select("elemento")
    .eq("data", dataSelezionata)
    .eq("categoria", categoria);

  const presenti = new Set(esistenti?.map((e) => e.elemento));

  // 3️⃣ prepara inserimento
  const daInserire = lista
    .filter((e) => !presenti.has(e))
    .map((e) => ({
      elemento: e,
      fatto: false,
      data: dataSelezionata,
      categoria,
    }));

  if (daInserire.length > 0) {
    await supabase.from("cose_da_fare").insert(daInserire);
  }

  await fetchCoseDaFare();
  await fetchCategorie();
  setLoading(false);
};




/* ================= AGGIUNGI COSE "SITO MIBU" A OGGI (NO FUTURO) ================= */

const aggiungiSitoMibuAOggi = async () => {
  if (!dataSelezionata) return;

  setLoading(true);

  // 1️⃣ cose NON fatte di Sito Mibu SOLO nei giorni PRECEDENTI a oggi
  const { data: sitoMibu } = await supabase
    .from("cose_da_fare")
    .select("elemento")
    .eq("categoria", "Sito Mibu")
    .eq("fatto", false)
    .lt("data", dataSelezionata); // ⛔️ esclude oggi e giorni futuri

  if (!sitoMibu || sitoMibu.length === 0) {
    setLoading(false);
    return;
  }

  // 2️⃣ cose già presenti oggi
  const { data: oggi } = await supabase
    .from("cose_da_fare")
    .select("elemento")
    .eq("data", dataSelezionata)
    .eq("categoria", "Sito Mibu");

  const presentiOggi = new Set(oggi?.map((c) => c.elemento));

  // 3️⃣ deduplica globale per nome
  const uniche = Array.from(
    new Set(sitoMibu.map((c) => c.elemento))
  );

  // 4️⃣ prepara inserimento evitando duplicati oggi
  const daInserire = uniche
    .filter((el) => !presentiOggi.has(el))
    .map((el) => ({
      elemento: el,
      fatto: false,
      data: dataSelezionata,
      categoria: "Sito Mibu",
    }));

  if (daInserire.length > 0) {
    await supabase.from("cose_da_fare").insert(daInserire);
  }

  await fetchCoseDaFare();
  setLoading(false);
};
/* ================= AGGIUNGI COSE "SITO MIBU Area personale" A OGGI (NO FUTURO) ================= */

const aggiungiSitoMibuAreaPersonaleAOggi = async () => {
  if (!dataSelezionata) return;

  setLoading(true);

  // 1️⃣ cose NON fatte di Sito Mibu SOLO nei giorni PRECEDENTI a oggi
  const { data: sitoMibu } = await supabase
    .from("cose_da_fare")
    .select("elemento")
    .eq("categoria", "Sito Mibu Area personale")
    .eq("fatto", false)
    .lt("data", dataSelezionata); // ⛔️ esclude oggi e giorni futuri

  if (!sitoMibu || sitoMibu.length === 0) {
    setLoading(false);
    return;
  }

  // 2️⃣ cose già presenti oggi
  const { data: oggi } = await supabase
    .from("cose_da_fare")
    .select("elemento")
    .eq("data", dataSelezionata)
    .eq("categoria", "Sito Mibu Area personale");

  const presentiOggi = new Set(oggi?.map((c) => c.elemento));

  // 3️⃣ deduplica globale per nome
  const uniche = Array.from(
    new Set(sitoMibu.map((c) => c.elemento))
  );

  // 4️⃣ prepara inserimento evitando duplicati oggi
  const daInserire = uniche
    .filter((el) => !presentiOggi.has(el))
    .map((el) => ({
      elemento: el,
      fatto: false,
      data: dataSelezionata,
      categoria: "Sito Mibu Area personale",
    }));

  if (daInserire.length > 0) {
    await supabase.from("cose_da_fare").insert(daInserire);
  }

  await fetchCoseDaFare();
  setLoading(false);
};


/* ================= ELIMINA TUTTE LE COSE DA FARE DEL GIORNO ================= */

const eliminaTutteLeCoseDaFare = async () => {
  if (!dataSelezionata) return;

  if (
    !confirm(
      "Eliminare TUTTE le cose da fare per questo giorno? L'operazione è irreversibile."
    )
  ) {
    return;
  }

  setLoading(true);

  await supabase
    .from("cose_da_fare")
    .delete()
    .eq("data", dataSelezionata);

  await fetchCoseDaFare();
  setLoading(false);
};



  /* ================= GUARD ================= */

  if (!dataSelezionata) {
    return <p style={{ color: "#111" }}>Seleziona una data dal calendario</p>;
  }

  const formatDateEU = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  /* ================= UI ================= */

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Calendario Personale</h1>

      <div style={styles.dateBox}>
        <strong>Data:</strong> {formatDateEU(dataSelezionata)}
      </div>

      {/* EVENTI */}

      <h2 style={{ marginBottom: 12 }}>Nuovo appuntamento</h2>

      <div style={styles.newBookingRow}>
        <div style={styles.field}>
          <label style={styles.label}>Nome evento</label>
          <input
            style={styles.input}
            value={nuovoEvento.nome_evento}
            onChange={(e) =>
              setNuovoEvento({ ...nuovoEvento, nome_evento: e.target.value })
            }
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Ora inizio</label>
          <input
            style={styles.input}
            type="time"
            value={nuovoEvento.ora_inizio}
            onChange={(e) =>
              setNuovoEvento({ ...nuovoEvento, ora_inizio: e.target.value })
            }
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Ora fine</label>
          <input
            style={styles.input}
            type="time"
            value={nuovoEvento.ora_fine}
            onChange={(e) =>
              setNuovoEvento({ ...nuovoEvento, ora_fine: e.target.value })
            }
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Guadagno (€)</label>
          <input
            style={styles.input}
            type="number"
            step="0.01"
            value={nuovoEvento.guadagno}
            onChange={(e) =>
              setNuovoEvento({
                ...nuovoEvento,
                guadagno: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

      </div>

      <button onClick={salvaNuovoEvento} style={styles.saveButton}>
        💾 Salva appuntamento
      </button>
      {/*APPUNTAMENTI SELECT UPDATE DELETE */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nome evento</th>
            <th style={styles.th}>Ora inizio</th>
            <th style={styles.th}>Ora fine</th>
            <th style={styles.th}>Guadagno (€)</th>
            <th style={styles.th}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {eventi.map((e) => (
            <tr key={e.id}>
              <td style={styles.td}>
                <input
                  style={styles.input}
                  defaultValue={e.nome_evento}
                  onBlur={(ev) =>
                    updateEvento(e.id, "nome_evento", ev.target.value)
                  }
                />
              </td>
              <td style={styles.td}>
                <input
                  style={styles.input}
                  type="time"
                  defaultValue={e.ora_inizio.slice(0, 5)}
                  onBlur={(ev) =>
                    updateEvento(e.id, "ora_inizio", ev.target.value)
                  }
                />
              </td>
              <td style={styles.td}>
                <input
                  style={styles.input}
                  type="time"
                  defaultValue={e.ora_fine.slice(0, 5)}
                  onBlur={(ev) =>
                    updateEvento(e.id, "ora_fine", ev.target.value)
                  }
                />
              </td>
              <td style={styles.td}>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  defaultValue={e.guadagno}
                  onBlur={(ev) =>
                    updateEvento(e.id, "guadagno", ev.target.value)
                  }
                />
              </td>
          

              <td style={{ ...styles.td, textAlign: "center" }}>
                <button
                  onClick={() => eliminaEvento(e.id)}
                  onTouchStart={() => eliminaEvento(e.id)}
                  style={styles.deleteButton}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
</table>


      {/* COSE DA FARE */}

      <button
        onClick={() => salvaListaPerCategoria("Concerto", COSE_CONCERTO)}
        style={{
          ...styles.saveButton,
          backgroundColor: "#0f766e",
          marginBottom: 16,
          marginRight: 12,
        }}
      >
        🎤 Concerto
      </button>

        <button
          onClick={() => salvaListaPerCategoria("attivita di casa", ATTIVITA_CASA)}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          🏠 Attività di casa
        </button>
        <button
        onClick={() => salvaListaPerCategoria("spesa", SPESA)}
        style={{
          ...styles.saveButton,
          backgroundColor: "#0f766e",
          marginBottom: 16,
          marginRight: 12,
        }}
      >
        🛒 Spesa
      </button>

        <button
          onClick={aggiungiSitoMibuAOggi}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          🌐 Sito Mibu non fatte

        </button>
         <button
          onClick={aggiungiSitoMibuAreaPersonaleAOggi}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          🌐 Sito Mibu Area Personale non fatte

        </button>
        <button
          onClick={() => salvaListaPerCategoria("sport", SPORT)}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          💪 Sport

        </button>
        <button
          onClick={() => salvaListaPerCategoria("pianoforte/jazz", PIANOFORTE_JAZZ)}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          🎹 Pianoforte/jazz

        </button>
        <button
          onClick={() =>
    salvaListaPerCategoria(
      "pianoforte/jazz/maggiori",
      PIANOFORTE_JAZZ_MAGGIORI
    )}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          🎹 Pianoforte/jazz/maggiori

        </button>
        <button
          onClick={() =>
    salvaListaPerCategoria(
      "pianoforte/jazz/minori",
      PIANOFORTE_JAZZ_MINORI
    )}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          🎹 Pianoforte/jazz/minori

        </button>
        <button
          onClick={() =>
    salvaListaPerCategoria(
      "tecnica pianoforte maggiore",
      TECNICA_PIANOFORTE_MAGGIORE
    )}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          🎹 Tecnica pianoforte maggiore

        </button>
        <button
          onClick={() =>
    salvaListaPerCategoria(
      "tecnica pianoforte minore",
      TECNICA_PIANOFORTE_MINORE
    )}
          style={{
            ...styles.saveButton,
            backgroundColor: "#0f766e",
            marginBottom: 16,
            marginRight: 12,
          }}
        >
          🎹 Tecnica pianoforte minore

        </button>


      <h2 style={{ marginBottom: 12 }}>Aggiungi cosa da fare</h2>

      <div style={styles.newBookingRow}>
        <div style={styles.field}>
            <label style={styles.label}>Descrizione</label>

            <textarea
              ref={(el) => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }
              }}
              style={{
                ...styles.input,
                resize: "none",
                overflow: "hidden",
              }}
              value={nuovaCosaDaFare.elemento}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
              onChange={(e) =>
                setNuovaCosaDaFare({
                  ...nuovaCosaDaFare,
                  elemento: e.target.value,
                })
              }
            />
          </div>


        <div style={styles.field}>
          <label style={styles.label}>Categoria</label>
          <input
            style={styles.input}
            list="categorie-list"
            value={nuovaCosaDaFare.categoria}
            onChange={(e) =>
              setNuovaCosaDaFare({
                ...nuovaCosaDaFare,
                categoria: e.target.value,
              })
            }
          />
          <datalist id="categorie-list">
            {categorie.map((c) => (
              <option key={c.id} value={c.nome} />
            ))}
          </datalist>
        </div>
      </div>

      <button onClick={salvaCosaDaFare} style={styles.saveButton}>
        💾 Salva cosa da fare
      </button>
      <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          {/* FILTRO CATEGORIA */}
          <div style={{ maxWidth: 260 }}>
            <label style={{ ...styles.label, marginBottom: 6 }}>
              Categoria
            </label>

            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              style={styles.input}
            >
              <option value="tutte">Tutte le categorie</option>

              {categorie.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* FILTRO STATO */}
          <div style={{ maxWidth: 200 }}>
            <label style={{ ...styles.label, marginBottom: 6 }}>
              Stato
            </label>

            <select
              value={statoFiltro}
              onChange={(e) =>
                setStatoFiltro(e.target.value as "tutte" | "fatte" | "non_fatte")
              }
              style={styles.input}
            >
              <option value="tutte">Tutte</option>
              <option value="fatte">Fatte</option>
              <option value="non_fatte">Non fatte</option>
            </select>
          </div>
          {/* GESTIONE CATEGORIE */}
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin/categorie_cose_da_fare")}
              style={{
                ...styles.saveButton,
                backgroundColor: "#0ea5e9",
                marginBottom: 0,
                height: 38,
                display: "flex",
                alignItems: "center",
              }}
            >
              ⚙️ Gestisci categorie
            </button>
          </div>

        </div>



      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Descrizione</th>
            <th style={styles.th}>Fatto</th>
            <th style={styles.th}>Categoria</th>
            <th style={styles.th}>Azioni</th>
          </tr>
        </thead>
        <tbody>
         {coseDaFare
          .filter((c) =>
            categoriaFiltro === "tutte"
              ? true
              : c.categoria === categoriaFiltro
          )
          
          .map((c) => (


            <tr key={c.id}>
              <td style={styles.td}>
               <textarea
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = el.scrollHeight + "px";
                    }
                  }}
                  style={{
                    ...styles.input,
                    resize: "none",
                    overflow: "hidden",
                  }}
                  value={c.elemento}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                  onChange={(e) =>
                    setCoseDaFare((prev) =>
                      prev.map((item) =>
                        item.id === c.id
                          ? { ...item, elemento: e.target.value, dirty: true }
                          : item
                      )
                    )
                  }
/>


              </td>
              <td style={{ ...styles.td, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={c.fatto}
                  onChange={(e) =>
                    setCoseDaFare((prev) =>
                      prev.map((item) =>
                        item.id === c.id
                          ? { ...item, fatto: e.target.checked, dirty: true }
                          : item
                      )
                    )
                  } 
                />


              </td>
              <td style={styles.td}>
                <input
                      style={styles.input}
                      list="categorie-list"
                      value={c.categoria || ""}
                      onChange={(e) =>
                        setCoseDaFare((prev) =>
                          prev.map((item) =>
                            item.id === c.id
                              ? {
                                  ...item,
                                  categoria: e.target.value,
                                  dirty: true,
                                }
                              : item
                          )
                        )
                      }
                    />


              </td>
              <td style={{ ...styles.td, textAlign: "center" }}>
                {c.dirty && (
                  <button
                    onClick={() => salvaCosaDaFareModificata(c)}
                    style={{
                      ...styles.saveButton,
                      padding: "4px 10px",
                      marginRight: 8,
                    }}
                  >
                    💾
                  </button>
                )}

                <button
                  onClick={() => eliminaCosaDaFare(c.id)}
                  onTouchStart={() => eliminaCosaDaFare(c.id)}
                  style={styles.deleteButton}
                >
                  ✕
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 32,
          marginBottom: 16,
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
        }}
      >
        <button onClick={rimandaADomani} style={styles.saveButton}>
          ⏭ Rimanda a domani
        </button>

        {coseDaFare.some((c) => c.dirty) && (
          <button
            onClick={salvaTutteLeModifiche}
            style={{
              ...styles.saveButton,
              backgroundColor: "#2563eb",
            }}
          >
            💾 Salva tutte le modifiche
          </button>
        )}
      </div>
      


      <button
        style={styles.backButton}
        onClick={() => router.push("/admin/calendario_personale")}
      >
        ← Torna al calendario
      </button>
      <button
        onClick={eliminaTutteLeCoseDaFare}
        style={{
          ...styles.deleteButton,
          borderRadius: 6,
          width: "auto",
          height: "auto",
          padding: "10px 16px",
          marginRight: 12,
          marginBottom: 16,
        }}
      >
        🗑 Elimina tutte le cose da fare di oggi
      </button>

      {loading && <p style={{ color: "#111" }}>Salvataggio…</p>}
    </main>
  );
}

/* ================= STILI ================= */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 32,
    maxWidth: 900,
    margin: "0 auto",
    backgroundColor: "#ffffff",
    color: "#111111",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 16,
  },
  dateBox: {
    marginBottom: 24,
    fontSize: 16,
  },
  newBookingRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    minWidth: 140,
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 24,
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    fontSize: 14,
    fontWeight: 700,
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "8px",
    verticalAlign: "top",
  },
  input: {
    width: "100%",
    padding: "6px 8px",
    fontSize: 14,
    border: "1px solid #ccc",
    borderRadius: 4,
    fontFamily: "inherit",
  },
  saveButton: {
    backgroundColor: "#16a34a",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#f3f4f6",
    color: "#111",
    padding: "8px 14px",
    border: "1px solid #ddd",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
    marginRight:12,
  },
 deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    width: 44,
    height: 44,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
},

};
