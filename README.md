# Dwars Bestelapp

Webapp voor wekelijkse bestellingen bij Cafetaria Dwars.

## Starten

```bash
npm install
npx playwright install chromium
npm run dev
```

Open daarna: http://localhost:3000

## Menu/prijzen verversen

```bash
npm run menu:refresh
```

De scraper opent de bestelsite, leest zichtbare producten en probeert per product de opties/sauzen uit de pop-up te halen. Omdat de site van Dwars kan wijzigen, zit er ook een lokale fallback in `data/menu.json`.

## Wat zit erin

- bestelpagina voor collega's
- naam + producten + opties/sauzen
- live bedrag per persoon
- admin-overzicht
- totalen per product
- totalen per persoon
- Tikkie-tekst per persoon
- orders worden lokaal opgeslagen in `data/orders.json`

## Productie

Voor echt gebruik kun je dit deployen op een kleine VPS, Render, Railway of Vercel. Voor Playwright-scraping is een serveromgeving het handigst.
