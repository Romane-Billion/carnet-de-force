# Carnet de force

Appli d'entraînement de Romane pour iPhone, installable depuis Safari sur l'écran d'accueil (appli web plein écran, fonctionne hors-ligne à la salle).
Programme : 2 séances full body A/B centrées tractions et fessiers, sans squat profond ni hip thrust, avec double progression et paliers d'assistance comme niveaux de jeu.

- `index.html`, `css/app.css`, `js/app.js` : l'appli (sans outil de construction, fichiers servis tels quels par GitHub Pages)
- `js/data.js` : le programme (exercices, séries, reps, repos, conseils)
- `img/` : photo de départ (`-0`) et d'arrivée (`-1`) de chaque exercice, issues de [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (domaine public)
- `sw.js` : le cache hors-ligne (changer `CACHE` à chaque mise à jour importante)

Les séances sont enregistrées sur le téléphone (localStorage), rien n'est envoyé ailleurs. Onglet Histo : export / import d'une sauvegarde JSON.
