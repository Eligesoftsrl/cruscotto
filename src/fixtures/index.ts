/**
 * Layer FIXTURES (ex "mock").
 *
 * Questi dati NON sono la sorgente primaria: vanno usati SOLO come fallback
 * esplicito quando i dati reali da Supabase non sono disponibili (es. tabella
 * vuota, ambiente demo, sviluppo offline).
 *
 * Migrazione graduale: le sezioni che ancora importano da `@/data/mockData`
 * verranno spostate una alla volta a consumare i dati reali tramite gli hook in
 * `@/hooks` (che a loro volta usano i service in `@/services`). Le fixtures
 * restano qui come rete di sicurezza.
 */
export * from "@/data/mockData";
