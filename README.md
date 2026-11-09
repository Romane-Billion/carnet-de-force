# Carnet de force

Appli d'entraînement de Romane pour iPhone, installable depuis Safari sur l'écran d'accueil (appli web plein écran, fonctionne hors-ligne à la salle).
Programme : 2 séances corps entier A/B qui commencent par 20 min de cardio, centrées tractions et fessiers. On coche les séries, la pause démarre toute seule, et la charge progresse automatiquement.

- `index.html`, `css/app.css`, `js/app.js` : l'appli (sans outil de construction, fichiers servis tels quels par GitHub Pages)
- `js/data.js` : le programme (exercices, séries, reps, repos, conseils)
- `js/schemas.js` : les dessins explicatifs des exercices nouveaux (positions de départ et d'arrivée)
- `js/repas.js`, `js/plats.js` : l'onglet Repas (bilan du jour, recherche d'aliments, code-barres, favoris, plats du dehors à portions, pas, poids et mensurations)
- `data/ciqual.json` : table Ciqual de l'Anses (kcal, protéines, glucides, lipides pour 100 g), licence ouverte
- `js/vendor/html5-qrcode.min.js` : lecture des codes-barres ([html5-qrcode](https://github.com/mebjas/html5-qrcode), Apache 2.0)
- `sw.js` : le cache hors-ligne (changer `CACHE` à chaque mise à jour importante)

Les produits du commerce viennent d'[Open Food Facts](https://world.openfoodfacts.org) (en ligne). Les séances et les repas sont enregistrés sur le téléphone (localStorage), rien n'est envoyé ailleurs. Onglet Historique : export / import d'une sauvegarde JSON.
