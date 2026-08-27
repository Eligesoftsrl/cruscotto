/**
 * Layer FIXTURES (ex "mock").
 *
 * Questi dati NON sono la sorgente primaria: vanno usati SOLO come fallback
 * esplicito quando i dati reali da Supabase non sono disponibili (es. tabella
 * vuota, ambiente demo, sviluppo offline).
 *
 * Nota: nessun componente importa piu direttamente da `@/data/mockData`.
 * L'unico punto di ingresso alle fixtures e questo barrel (`@/fixtures`), cosi
 * la "rete di sicurezza" demo resta centralizzata e facilmente rimovibile quando
 * le tabelle reali (es. `ca_*` via ETL) saranno popolate.
 */
export * from "@/data/mockData";
