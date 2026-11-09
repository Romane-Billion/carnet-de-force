# Carnet de force

Appli d'entraînement de Romane pour iPhone, installable depuis Safari sur l'écran d'accueil (appli web plein écran, fonctionne hors-ligne à la salle).
Programme : 2 séances corps entier A/B qui commencent par 20 min de cardio, centrées tractions et fessiers. On coche les séries, la pause démarre toute seule, et la charge progresse automatiquement.

- `index.html`, `css/app.css`, `js/app.js` : l'appli (sans outil de construction, fichiers servis tels quels par GitHub Pages)
- `js/data.js` : le programme (exercices, séries, reps, repos, conseils)
- `js/schemas.js` : les dessins explicatifs des exercices nouveaux (positions de départ et d'arrivée)
- `sw.js` : le cache hors-ligne (changer `CACHE` à chaque mise à jour importante)

Les séances sont enregistrées sur le téléphone (localStorage), rien n'est envoyé ailleurs. Onglet Historique : export / import d'une sauvegarde JSON.
