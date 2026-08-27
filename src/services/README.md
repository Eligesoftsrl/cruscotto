# Service Layer

Livello di accesso ai dati. Ogni service incapsula le query verso Supabase
(`@/integrations/supabase/client`) e la relativa trasformazione dei dati in
funzioni pure e testabili.

## Principi

- **Un service per dominio** (`dw/etaService.ts`, `dw/genereService.ts`, ...).
- **Funzioni pure `fetchX()`** che ritornano tipi ben definiti; nessun hook React qui.
- Gli **hook** in `src/hooks` si limitano a orchestrare `@tanstack/react-query`
  chiamando i service (thin hooks), rendendo la logica riusabile e testabile.
- **Nessun URL/chiave Supabase hardcoded**: il client legge tutto da `@/config/env`.
- Le **fixtures** (`@/fixtures`) sono usate solo come fallback esplicito.

## Pattern

```ts
// services/dw/etaService.ts
export async function fetchEtaData(anno?: number): Promise<EtaData> {
  /* query + transform */
}

// hooks/useEtaData.ts
export function useEtaData(anno?: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dw_eta", anno],
    queryFn: () => fetchEtaData(anno),
  });
  return { ...(data ?? EMPTY), isLoading, error };
}
```
