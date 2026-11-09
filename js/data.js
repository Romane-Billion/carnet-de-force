// Programme de Romane : 2 séances corps entier qui alternent (A, B, A, B…).
// Chaque séance commence par 20 min de cardio.
// mode : "assist" = kg d'assistance machine (on la baisse en progressant)
//        "charge" = kg (on monte en progressant)
//        "reps"   = poids du corps, on ajoute des reps
// Progression automatique : quand toutes les séries sont cochées au nombre de reps prévu,
// la fois suivante on ajoute 1 rep ; arrivée au haut de la fourchette, on change la charge et on repart du bas.
// Assistance machine : paliers de 6,8 kg (6,8 / 13,6 / 20,4 / 27,2 / 34 / 40,8).
// repos : pause entre deux séries (secondes). schema : dessin explicatif dans js/schemas.js.

export const CARDIO = {min: 20, choix: ["Marche inclinée et course", "Montée de marches"]};
export const PAUSE_EXO = 150; // pause entre deux exercices

export const EX = {
  A: [
    {id:"traction", nom:"Tractions assistées", sets:4, min:5, max:8, mode:"assist", start:13.6, step:6.8, repos:120,
      tip:"Machine à genoux. Monte jusqu'au menton au-dessus de la barre, redescends doucement."},
    {id:"presse", nom:"Presse inclinée, pieds hauts et écartés", sets:4, min:10, max:10, mode:"charge", start:75, step:5, repos:120, schema:"presse",
      tip:"Pieds en haut du plateau, plus écartés que les hanches. Descends jusqu'à 90° aux genoux, pas plus bas."},
    {id:"dc", nom:"Développé couché", sets:3, min:8, max:10, mode:"charge", start:30, step:2.5, repos:90, unite:"kg au total",
      tip:"Poids total barre comprise (la barre fait 20 kg). Omoplates serrées contre le banc."},
    {id:"ext45", nom:"Extension au banc à 45°", sets:3, min:12, max:15, mode:"charge", start:0, step:2.5, repos:90, schema:"ext45", nouveau:true,
      tip:"0 kg = sans poids. Coussin sous le pli de la hanche, pieds ouverts en V, serre les fesses pour remonter."},
    {id:"abduc", nom:"Abducteurs (jambes qui s'ouvrent)", sets:3, min:15, max:15, mode:"charge", start:50, step:5, repos:90,
      tip:"Penche le buste un peu en avant : le haut des fesses travaille plus. Ouvre fort, reviens lentement."},
    {id:"releves", nom:"Relevé de genoux à la chaise romaine", sets:3, min:12, max:15, mode:"reps", repos:90, schema:"releves", nouveau:true,
      tip:"Dos collé au dossier, monte les genoux vers la poitrine en enroulant le bassin."}
  ],
  B: [
    {id:"negatives", nom:"Négatives de traction", sets:3, min:3, max:5, mode:"reps", repos:120, schema:"negatives", nouveau:true,
      tip:"Pars d'en haut (banc ou saut) et descends en comptant 5 secondes."},
    {id:"tirage", nom:"Tirage vertical", sets:3, min:10, max:10, mode:"charge", start:null, step:2.5, repos:90,
      tip:"Première fois : choisis une charge où les 10 reps sont dures mais propres. Tire la barre vers le haut de la poitrine."},
    {id:"dips", nom:"Dips assistés", sets:4, min:8, max:10, mode:"assist", start:20.4, step:6.8, repos:120,
      tip:"Même machine que les tractions. Descends jusqu'à 90° aux coudes."},
    {id:"presseB", nom:"Presse inclinée, pieds hauts et écartés", sets:3, min:12, max:12, mode:"charge", start:null, step:5, repos:120, schema:"presse", lie:"presse",
      tip:"Comme en séance A, avec plus de reps : prends environ 10 kg de moins que ta charge de la séance A."},
    {id:"militaire", nom:"Développé militaire", sets:3, min:10, max:10, mode:"charge", start:10, step:2.5, repos:90, unite:"kg par côté",
      tip:"Gaine les abdos et serre les fesses pour ne pas cambrer en poussant."},
    {id:"ext45B", nom:"Extension au banc à 45°", sets:3, min:12, max:15, mode:"charge", start:null, step:2.5, repos:90, schema:"ext45", nouveau:true, lie:"ext45",
      tip:"Même exercice qu'en séance A, même charge."},
    {id:"relevesB", nom:"Relevé de genoux à la chaise romaine", sets:3, min:12, max:15, mode:"reps", repos:90, schema:"releves", nouveau:true, lie:"releves",
      tip:"Même exercice qu'en séance A."},
    {id:"pecdeck", nom:"Pec deck (si tu as le temps)", sets:2, min:12, max:12, mode:"charge", start:5, step:2.5, repos:90, unite:"kg par côté", optionnel:true,
      tip:"Optionnel. Coudes légèrement fléchis, ferme les bras devant toi sans hausser les épaules."}
  ]
};

// Fiches explicatives (onglet Exercices). Les nouveaux exercices d'abord.
export const FICHES = [
  {id:"ext45", titre:"Extension au banc à 45°", schema:"ext45", nouveau:true,
    quoi:"Le banc en pente (souvent appelé banc à lombaires) : un coussin sur lequel tu poses le haut des cuisses, et des rouleaux en bas pour bloquer tes chevilles. Tu es penchée en avant à 45°, tu descends le buste vers le sol, puis tu remontes.",
    travaille:"Fessiers et arrière des cuisses. Il remplace le hip thrust sans rien appuyer sur les os des hanches.",
    etapes:[
      "Règle la hauteur du coussin pour qu'il arrive juste sous le pli de ta hanche (en haut des cuisses). Il ne doit pas être sur ton ventre : tu dois pouvoir te plier en deux librement.",
      "Cale tes chevilles sous les rouleaux, pieds ouverts vers l'extérieur en V. C'est ce qui fait travailler les fesses plutôt que le bas du dos.",
      "Croise les bras sur la poitrine. Laisse descendre le buste vers le sol en pliant à la hanche, dos un peu arrondi, jusqu'à sentir l'étirement derrière les cuisses.",
      "Remonte en serrant fort les fesses, comme si tu voulais enfoncer le bassin dans le coussin.",
      "Arrête-toi quand ton corps forme une ligne droite des talons à la tête. Ne remonte pas plus haut, sinon tu cambres et c'est le dos qui travaille."],
    eviter:"Monter au-dessus de la ligne droite. Aller vite. Sentir le bas du dos plutôt que les fesses : dans ce cas, ouvre plus les pieds et arrondis un peu le dos.",
    plus:"Quand 15 reps sont faciles, tiens un disque de 2,5 ou 5 kg contre ta poitrine."},
  {id:"negatives", titre:"Négatives de traction", schema:"negatives", nouveau:true,
    quoi:"Une traction faite seulement dans la descente. Tu te mets en haut sans effort (avec un banc ou un saut), puis tu descends le plus lentement possible.",
    travaille:"Dos et biceps. C'est l'exercice le plus efficace pour réussir des tractions sans assistance : tes muscles sont plus forts en descente qu'en montée.",
    etapes:[
      "Place un banc ou une marche sous la barre de traction.",
      "Attrape la barre paumes vers l'avant, mains un peu plus écartées que les épaules.",
      "Pousse sur tes jambes pour arriver en haut : menton au-dessus de la barre, coudes pliés, épaules basses.",
      "Lève les pieds et descends en comptant lentement jusqu'à 5, jusqu'aux bras tendus.",
      "Remets les pieds sur le banc, souffle 2 ou 3 secondes, recommence."],
    eviter:"Te laisser tomber. Si tu descends en moins de 3 secondes, tu es fatiguée : arrête la série.",
    plus:"Quand tu tiens 5 négatives propres, vise une descente de 6 à 8 secondes."},
  {id:"releves", titre:"Relevé de genoux à la chaise romaine", schema:"releves", nouveau:true,
    quoi:"La chaise romaine est la grande station avec un dossier vertical et deux appuis pour les avant-bras, souvent à côté de la barre de traction. Tu es suspendue sur tes avant-bras, dos contre le dossier, et tu montes les genoux.",
    travaille:"Les abdominaux, surtout le bas du ventre.",
    etapes:[
      "Monte sur les marches, pose les avant-bras sur les appuis et attrape les poignées. Colle le dos au dossier.",
      "Laisse pendre les jambes. Épaules basses, loin des oreilles.",
      "Monte les genoux vers la poitrine et, à la fin, enroule le bassin vers toi : les fesses se décollent un peu du dossier. C'est cet enroulement qui fait travailler les abdos.",
      "Redescends en 2 secondes, sans te balancer."],
    eviter:"Monter les genoux seulement jusqu'à l'horizontale sans enrouler le bassin : ce sont alors les cuisses qui travaillent, pas les abdos.",
    plus:"Quand 15 reps sont faciles, monte les jambes presque tendues."},
  {id:"presse", titre:"Presse : où mettre les pieds", schema:"pressepieds",
    quoi:"Utilise la presse inclinée (tu es assise en arrière et tu pousses le plateau en diagonale vers le haut), pas la presse assise horizontale.",
    travaille:"Pieds hauts et écartés : les fessiers et l'arrière des cuisses. Pieds bas et serrés : surtout l'avant des cuisses et les genoux.",
    etapes:[
      "Pose les pieds en haut du plateau, les talons presque au bord.",
      "Écarte-les un peu plus que la largeur des hanches, pointes légèrement vers l'extérieur.",
      "Déverrouille, descends jusqu'à ce que tes genoux fassent environ 90°. Pour ton genou, pas plus bas.",
      "Pousse avec les talons, sans verrouiller les genoux en haut."],
    eviter:"Laisser les talons se décoller, ou les fesses se décoller du siège en bas du mouvement : c'est le signe que tu descends trop bas.",
    plus:""},
  {id:"hipthrust", titre:"Hip thrust, à réessayer", schema:"hipthrust", essai:true,
    quoi:"Il n'est pas dans tes séances. Si tu veux le retester un jour, voici comment protéger tes os des hanches. Il est très bon pour les fessiers, mais l'extension à 45° fait déjà ce travail.",
    travaille:"Grand fessier, c'est l'un des meilleurs exercices pour le volume des fesses.",
    etapes:[
      "Protège les os : prends le plus gros coussin de barre de la salle (le manchon en mousse épais). Ajoute un tapis plié ou une mousse épaisse par-dessus si tu sens encore la barre.",
      "Place la barre dans le pli de ta hanche, plus bas que les os qui dépassent à l'avant du bassin. C'est sur ces os que ça fait mal : la barre ne doit pas reposer dessus.",
      "Variante plus douce : un seul haltère tenu à deux mains au creux des hanches, sur une serviette pliée. Moins lourd, mais sans douleur.",
      "Assise au sol, le haut du dos contre le bord d'un banc (sous les omoplates). Pieds à plat, écartés comme les hanches, genoux pliés.",
      "Pousse dans les talons et monte le bassin jusqu'à ce que ton corps fasse une table, des épaules aux genoux. Menton rentré, regarde devant toi.",
      "Serre fort les fesses 1 seconde en haut, redescends lentement.",
      "Commence avec la barre seule ou un haltère de 10 kg pour vérifier que les os ne font pas mal."],
    eviter:"Cambrer en haut (les côtes restent basses), pousser sur la pointe des pieds, ou continuer si ça fait mal aux os : arrête-toi et reprends l'extension à 45°.",
    plus:""}
];

export const ALL = [...EX.A, ...EX.B];
export const byId = Object.fromEntries(ALL.map(e => [e.id, e]));
