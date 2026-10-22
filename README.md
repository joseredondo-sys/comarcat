# Comarcat

Joc web per aprendre les 4 províncies, les 43 comarques i les seves capitals de Catalunya. HTML, CSS i JavaScript sense dependències, publicat a GitHub Pages.

## Modalitats

| Mode | Què fa |
|---|---|
| Explora | Toca qualsevol comarca i en veus la capital, la província i la superfície. Filtres per província i etiquetes. |
| On és? | Et diu una comarca i l'has de trobar al mapa (3 intents: 100 / 60 / 30 punts). |
| Quina és? | S'il·lumina una comarca i tries el nom entre 4 opcions. |
| Capitals | Tries la capital de la comarca marcada. |
| Províncies | Dius a quina de les 4 províncies pertany cada comarca. |
| Contrarellotge | 60 s per trobar-ne tantes com puguis (+2 s per encert, −3 s per error). |

Es pot jugar a tot Catalunya o a una sola província, amb rondes de 10 preguntes o de totes. Ratxes (punts ×2 i ×3), estrelles, rècords, nivell d'experiència, comarques dominades i repàs dels errors. Interfície en català i castellà. El progrés es guarda al navegador.

## Dades

`js/data.js` es genera amb `python tools/build_data.py` a partir del GeoJSON oficial de l'ICGC (divisions administratives v2r2, escala 1:1.000.000, 2026-01-20), inclòs a `tools/`. L'assignació de cada comarca a una província segueix la seva capital (Cerdanya → Girona, Moianès i Lluçanès → Barcelona).

## Local

Obre `index.html` directament o serveix la carpeta: `python -m http.server`.
