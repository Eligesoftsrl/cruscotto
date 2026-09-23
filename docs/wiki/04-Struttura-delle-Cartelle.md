# 4. Struttura delle cartelle

[◀ Torna all'indice](Home.md)

## Vista d'insieme

```
.
├── src/                      # Codice del frontend (SPA)
│   ├── auth/                 # Integrazione Keycloak (init, refresh token)
│   ├── components/           # Componenti React
│   │   ├── ui/               # Componenti base riutilizzabili (design system)
│   │   ├── dashboard/        # Viste, header, filtri, grafici delle schede
│   │   ├── admin/            # UI del Pannello Admin (flag, log, statistiche)
│   │   └── bussola/          # Percorsi guidati / navigazione tematica
│   ├── pages/                # Pagine instradate (Home, Admin, Login, ...)
│   ├── hooks/                # Hooks React Query (uno per scheda + utilità)
│   ├── services/             # Service layer (accesso ai dati)
│   │   ├── ca/               # Conto Annuale: RPC reali fa_ca_*
│   │   ├── dw/               # Sezioni accessorie / datawarehouse
│   │   └── admin/            # Store e client del Pannello Admin
│   ├── integrations/
│   │   └── supabase/         # Client dati, gestione token, tipi
│   ├── config/               # Variabili d'ambiente e cataloghi (schede, flag)
│   ├── contexts/             # AuthContext, FilterContext
│   ├── data/                 # Dati statici (percorsi guidati, cataloghi)
│   ├── fixtures/             # Dati dimostrativi delle sezioni accessorie
│   ├── lib/                  # Utilità (formattazione, cache busting)
│   └── test/                 # Setup ed esempi di test
│
├── backend_proxy/            # Proxy di sicurezza (FastAPI, Python)
│   ├── main.py               # Endpoint /exchange, /admin/*, /health
│   ├── security.py           # Verifica token SSO, ruoli, conio token dati
│   ├── db.py                 # Connessione al database (tabelle Admin)
│   └── requirements.txt      # Dipendenze Python
│
├── docs/                     # Documentazione, script SQL, guide di deploy
│   ├── sql/                  # Script RLS e tabelle Admin
│   ├── views/                # Definizioni viste dati
│   └── wiki/                 # Questa wiki tecnica
│
├── public/                   # Asset statici (favicon, header di cache)
└── (config di progetto)      # vite, tailwind, tsconfig, eslint, ...
```

## Note utili

- **`components/ui`** contiene i mattoni dell'interfaccia (bottoni, card, tabelle,
  dialog...). Sono componenti generici, riusati ovunque.
- **`services/ca`** è il cuore del Conto Annuale: ogni scheda ha il suo servizio con le
  RPC che le competono.
- **`backend_proxy`** è un'applicazione a sé: viene distribuita e avviata separatamente
  dal frontend (vedi [Sicurezza: proxy e RLS](06-Sicurezza-Proxy-e-RLS.md)).
- La cartella **`dist/`** (non versionata) è l'output della build del frontend: è ciò che
  si pubblica sul web server.

[▶ Prossima pagina: Autenticazione, ruoli e multi-ente](05-Autenticazione-Ruoli-e-Multitenant.md)
