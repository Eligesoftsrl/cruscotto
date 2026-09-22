# Header di cache per il deploy (anti-cache stantia)

Dopo ogni build i file in `dist/assets/*` hanno un **hash nel nome** (cambiano a
ogni release), mentre `index.html` e `version.json` mantengono lo stesso nome.
Regola d'oro:

| File | Cache-Control |
|------|---------------|
| `index.html` | `no-cache, no-store, must-revalidate` |
| `version.json` | `no-cache, no-store, must-revalidate` |
| `assets/*` (hashati) | `public, max-age=31536000, immutable` |

Così il browser rivalida sempre l'HTML (ottenendo i riferimenti ai chunk
corretti) e riusa in cache in modo aggressivo solo gli asset immutabili.
Questo elimina il problema del "caricamento parziale" su browser con cache
stantia (tipico di Chrome/Edge dopo un nuovo deploy).

> L'app include comunque protezioni lato client (ricarica automatica su chunk
> mancante + banner "Nuova versione disponibile"), ma la configurazione header
> lato server è la soluzione autorevole.

---

## Netlify / Cloudflare Pages
Già pronto: il file **`public/_headers`** viene copiato in `dist/_headers`.
Nessuna azione ulteriore.

## Apache
Già pronto: il file **`public/.htaccess`** viene copiato in `dist/.htaccess`
(richiede `mod_headers` e `mod_rewrite` abilitati).

## Nginx
Aggiungere al `server { ... }` che serve la cartella `dist`:

```nginx
root /var/www/cruscotto/dist;
index index.html;

# SPA fallback
location / {
    try_files $uri $uri/ /index.html;
}

# HTML e version.json: mai in cache
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
location = /version.json {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    default_type application/json;
}

# Asset hashati: cache lunga e immutabile
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## IIS (Windows) — `web.config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <!-- webp/immagini -->
      <mimeMap fileExtension=".webp" mimeType="image/webp" />
    </staticContent>
    <caching enabled="true" />
    <location path="assets">
      <system.webServer>
        <httpProtocol>
          <customHeaders>
            <add name="Cache-Control" value="public, max-age=31536000, immutable" />
          </customHeaders>
        </httpProtocol>
      </system.webServer>
    </location>
    <location path="index.html">
      <system.webServer>
        <httpProtocol>
          <customHeaders>
            <add name="Cache-Control" value="no-cache, no-store, must-revalidate" />
          </customHeaders>
        </httpProtocol>
      </system.webServer>
    </location>
    <location path="version.json">
      <system.webServer>
        <httpProtocol>
          <customHeaders>
            <add name="Cache-Control" value="no-cache, no-store, must-revalidate" />
          </customHeaders>
        </httpProtocol>
      </system.webServer>
    </location>
  </system.webServer>
</configuration>
```

---

## Come funziona il rilevamento nuove versioni
- Ogni build genera `dist/version.json` con un `buildId` univoco (timestamp).
- Lo stesso `buildId` è incorporato nel bundle JS (`__APP_BUILD_ID__`).
- L'app interroga periodicamente `/version.json` (senza cache); se il `buildId`
  del server è diverso da quello in esecuzione, mostra il banner
  **"Nuova versione disponibile — Ricarica"**.
- In più, se un import dinamico fallisce (chunk mancante per cache stantia),
  l'app ricarica automaticamente una sola volta.
