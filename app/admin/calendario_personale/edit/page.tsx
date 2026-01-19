"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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
      .select("id, data, ora_inizio, ora_fine, nome_evento")
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
    value: string
  ) => {
    setLoading(true);
    await supabase
      .from("calendario_personale")
      .update({ [field]: value })
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
        <td style={{ ...styles.td, textAlign: "center" }}>
          <button
            onClick={() => eliminaEvento(e.id)}
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
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 28,
    height: 28,
    fontSize: 16,
    cursor: "pointer",
  },
};
