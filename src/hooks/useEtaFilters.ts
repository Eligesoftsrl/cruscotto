/**
 * Hook filtri a cascata per la scheda Analisi Eta.
 * Comparto -> Macrocategoria -> Categoria (dipendenti); Anno/Regione/Genere indipendenti.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAnni, fetchComparti, fetchRegioni, fetchMacrocategorie, fetchCategorie,
  type FiltroOpzione,
} from "@/services/ca/filtriService";
import type { EtaFiltri, Genere } from "@/services/ca/analisiEtaService";

export function useEtaFilters(annoIniziale = 2023) {
  const [anno, setAnno] = useState<number>(annoIniziale);
  const [comparto, setComparto] = useState<FiltroOpzione | null>(null);
  const [macro, setMacro] = useState<FiltroOpzione | null>(null);
  const [categoria, setCategoria] = useState<FiltroOpzione | null>(null);
  const [regione, setRegione] = useState<string | null>(null);
  const [genere, setGenere] = useState<Genere>("T");

  const anniQ = useQuery({ queryKey: ["mvf", "anni"], queryFn: fetchAnni });
  const compartiQ = useQuery({ queryKey: ["mvf", "comparti", anno], queryFn: () => fetchComparti(anno) });
  const regioniQ = useQuery({ queryKey: ["mvf", "regioni", anno], queryFn: () => fetchRegioni(anno) });
  const macroQ = useQuery({
    queryKey: ["mvf", "macro", anno, comparto?.chiave],
    queryFn: () => fetchMacrocategorie(anno, comparto!.chiave),
    enabled: Boolean(comparto?.chiave),
  });
  const categorieQ = useQuery({
    queryKey: ["mvf", "cat", anno, macro?.chiave],
    queryFn: () => fetchCategorie(anno, macro!.chiave),
    enabled: Boolean(macro?.chiave),
  });

  // reset dei livelli dipendenti quando cambia un livello superiore
  const onComparto = (o: FiltroOpzione | null) => { setComparto(o); setMacro(null); setCategoria(null); };
  const onMacro = (o: FiltroOpzione | null) => { setMacro(o); setCategoria(null); };
  const onAnno = (a: number) => { setAnno(a); setComparto(null); setMacro(null); setCategoria(null); };

  const filtri: EtaFiltri = useMemo(() => ({
    anno,
    comparto: comparto?.codice ?? null,
    macrocategoria: macro?.codice ?? null,
    categoria: categoria?.codice ?? null,
    regione: regione ?? null,
    genere,
  }), [anno, comparto, macro, categoria, regione, genere]);

  return {
    filtri,
    stato: { anno, comparto, macro, categoria, regione, genere },
    opzioni: {
      anni: anniQ.data ?? [],
      comparti: compartiQ.data ?? [],
      regioni: regioniQ.data ?? [],
      macro: macroQ.data ?? [],
      categorie: categorieQ.data ?? [],
    },
    set: { onAnno, onComparto, onMacro, setCategoria, setRegione, setGenere },
  };
}
