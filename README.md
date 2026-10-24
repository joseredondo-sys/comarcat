# Comarcat

Joc web per estudiar dos mapes, a triar a la pantalla d'inici:

- **Comarques de Catalunya**: 43 comarques, les seves capitals i les 4 províncies.
- **Províncies d'Espanya**: 50 províncies més Ceuta i Melilla, les seves capitals i les comunitats autònomes.

HTML, CSS i JavaScript sense dependències, publicat a GitHub Pages. Interfície en català i castellà; els noms dels llocs canvien amb l'idioma (Saragossa / Zaragoza) i en escriure s'accepten totes dues formes i els noms tradicionals (Vizcaya, Lérida, Gerona…). Enllaços directes: `#catalunya` i `#espanya`.

## Modalitats

| Mode | Què fa |
|---|---|
| Explora | Toca qualsevol territori i en veus la capital, el grup (província o comunitat) i la superfície. Filtres per grup i etiquetes. |
| On és? | Et diu un nom i l'has de trobar al mapa (3 intents: 100 / 60 / 30 punts). |
| Quina és? | S'il·lumina un territori i tries el nom entre 4 opcions. |
| Escriu-la | S'il·lumina un territori i se n'escriu el nom. No compten accents ni majúscules, s'accepten errates petites (mostrant com s'escriu), 2 intents i 2 pistes. |
| Capitals | Tries la capital del territori marcat. A Espanya només surten les capitals que no es diuen igual que la província (Vitòria, Bilbao, Oviedo…). |
| Províncies / Comunitats | Dius a quin grup pertany cada territori. A Espanya no surten les comunitats d'una sola província ni Ceuta i Melilla. |
| Contrarellotge | 60 s per trobar-ne tantes com puguis (+2 s per encert, −3 s per error). |

Es pot jugar a tot el mapa o a un sol grup, amb rondes de 10 preguntes o de totes. Ratxes (punts ×2 i ×3), estrelles, rècords, nivell d'experiència, territoris dominats i repàs dels errors. El progrés es guarda al navegador, separat per a cada joc.

## Dades

`js/data.js` es genera amb `python tools/build_data.py` a partir de:

- Catalunya: GeoJSON oficial de l'ICGC (divisions administratives v2r2, 1:1.000.000, 2026-01-20). Cada comarca s'assigna a la província de la seva capital (Cerdanya → Girona, Moianès i Lluçanès → Barcelona).
- Espanya: Eurostat GISCO, NUTS 2024 (1:3.000.000). NUTS 3 són les províncies (les illes de Balears i Canàries s'ajunten) i NUTS 2 les comunitats. Canàries es mostra desplaçada dins d'un requadre. Les superfícies es calculen sobre aquest mapa i són aproximades.

Els fitxers font són a `tools/`.

## Local

Obre `index.html` directament o serveix la carpeta: `python -m http.server`.
