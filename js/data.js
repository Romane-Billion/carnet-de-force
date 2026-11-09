// Programme de Romane : 2 séances full body A/B, centrées tractions et fessiers.
// Pas de squat profond ni de hip thrust (genou et os des hanches).
// mode : "assist" (kg d'assistance machine, plus bas = plus forte), "charge" (kg), "reps", "time" (secondes).
// img : photos de départ (0) et d'arrivée (1) dans img/. Sources : Free Exercise DB (domaine public).

export const EX = {
  A: [
    {id:"traction", nom:"Tractions assistées", sets:4, min:6, max:8, mode:"assist", start:15, step:5, repos:120,
      muscles:"Dos, biceps", img:true,
      conseils:["Mains un peu plus larges que les épaules, paumes vers l'avant.",
        "Pars bras tendus, épaules basses (loin des oreilles).",
        "Tire les coudes vers les poches arrière jusqu'au menton au-dessus de la barre.",
        "Redescends en 2 à 3 secondes, sans te laisser tomber."]},
    {id:"sdt", nom:"Soulevé de terre jambes tendues", detail:"haltères, poids total", sets:3, min:8, max:10, mode:"charge", start:null, step:2, repos:90,
      muscles:"Ischios, fessiers", img:true,
      conseils:["Genoux légèrement fléchis et fixes : c'est le bassin qui bouge, pas les genoux.",
        "Pousse les fesses vers l'arrière, haltères qui frôlent les cuisses.",
        "Dos plat, descends jusqu'à sentir l'étirement derrière les cuisses (mi-tibia environ).",
        "Remonte en serrant les fessiers."]},
    {id:"dc", nom:"Développé couché", detail:"barre comprise (20 kg)", sets:3, min:6, max:10, mode:"charge", start:30, step:2.5, repos:120,
      muscles:"Pectoraux, triceps", img:true,
      conseils:["Omoplates serrées et collées au banc, pieds bien à plat.",
        "Descends la barre au bas des pectoraux, coudes à 45° du corps.",
        "Pousse en gardant les fesses sur le banc."]},
    {id:"presse", nom:"Presse inclinée pieds hauts", sets:3, min:10, max:12, mode:"charge", start:75, step:5, repos:90,
      muscles:"Fessiers, ischios, cuisses", img:true,
      conseils:["Pieds en haut du plateau, largeur des épaules : ça met le travail sur les fessiers.",
        "Pour ton genou : descends seulement jusqu'à 90° environ, pas plus bas.",
        "Pousse avec les talons, ne verrouille pas les genoux en haut."]},
    {id:"fentes", nom:"Fentes arrière ou montées sur banc", detail:"0 = poids du corps, reps par jambe", sets:3, min:10, max:12, mode:"charge", start:0, step:2, repos:75,
      muscles:"Fessiers, cuisses", img:true,
      conseils:["Le pas en arrière est plus doux pour le genou que la fente avant.",
        "Buste légèrement penché vers l'avant pour mieux cibler les fessiers.",
        "Genou avant au-dessus de la cheville, pas devant les orteils.",
        "Si le genou tire : montées sur un banc bas à la place."]},
    {id:"abduc", nom:"Abducteurs machine", sets:3, min:12, max:15, mode:"charge", start:50, step:5, repos:60,
      muscles:"Moyen fessier (haut des fesses)", img:true,
      conseils:["Penche le buste un peu vers l'avant : le haut des fesses travaille plus.",
        "Ouvre fort, tiens 1 seconde, reviens lentement sans laisser claquer les poids."]},
    {id:"releves", nom:"Relevés de genoux suspendue", sets:3, min:8, max:12, mode:"reps", repos:60,
      muscles:"Abdominaux", img:true,
      conseils:["Suspendue à la barre, épaules actives (pas complètement relâchées).",
        "Monte les genoux vers la poitrine en enroulant le bassin.",
        "Redescends lentement, sans te balancer."]}
  ],
  B: [
    {id:"negatives", nom:"Négatives de traction", detail:"descente en 5 s", sets:3, min:3, max:5, mode:"reps", repos:120,
      muscles:"Dos, biceps", img:true,
      conseils:["Monte en haut avec un banc ou un saut, menton au-dessus de la barre.",
        "Descends le plus lentement possible : compte 5 secondes.",
        "C'est l'exercice clé pour réussir des tractions sans assistance."]},
    {id:"dips", nom:"Dips assistés", sets:4, min:5, max:8, mode:"assist", start:20, step:5, repos:120,
      muscles:"Triceps, pectoraux, épaules", img:true,
      conseils:["Buste droit, coudes qui partent vers l'arrière.",
        "Descends jusqu'à ce que les bras fassent environ 90°.",
        "Épaules basses, pousse jusqu'aux bras tendus."]},
    {id:"ext45", nom:"Extension à 45° (fessiers)", detail:"0 = sans poids", sets:3, min:10, max:15, mode:"charge", start:0, step:2.5, repos:75,
      muscles:"Fessiers, ischios", img:true,
      conseils:["Règle le coussin sous le pli de la hanche, pas sur le ventre.",
        "Pieds un peu ouverts vers l'extérieur, dos légèrement arrondi.",
        "Remonte en serrant les fesses, sans cambrer le bas du dos.",
        "Remplace le hip thrust sans appuyer sur les os des hanches."]},
    {id:"tirage", nom:"Tirage vertical", sets:3, min:10, max:12, mode:"charge", start:null, step:2.5, repos:90,
      muscles:"Dos, biceps", img:true,
      conseils:["Poitrine sortie, buste à peine penché en arrière.",
        "Tire la barre vers le haut de la poitrine, coudes vers le bas.",
        "Remonte lentement, bras presque tendus."]},
    {id:"kickback", nom:"Kickback fessier poulie", detail:"reps par jambe", sets:3, min:12, max:15, mode:"charge", start:null, step:2.5, repos:60,
      muscles:"Grand fessier", img:true,
      conseils:["Sangle à la cheville, mains sur la machine, buste un peu penché.",
        "Pousse la jambe vers l'arrière en serrant la fesse, sans cambrer.",
        "Tiens 1 seconde en haut, reviens lentement."]},
    {id:"hollow", nom:"Gainage hollow", detail:"en secondes", sets:3, min:20, max:30, mode:"time", repos:60,
      muscles:"Abdominaux, gainage", img:false,
      conseils:["Allongée sur le dos, bas du dos collé au sol (c'est la règle n°1).",
        "Décolle épaules et jambes, bras tendus vers l'arrière.",
        "Trop dur : plie les genoux ou garde les bras le long du corps."]}
  ]
};

export const ALL = [...EX.A, ...EX.B];
export const byId = Object.fromEntries(ALL.map(e => [e.id, e]));
export const LEVELS = ["Recrue","Régulière","Solide","Machine","Athlète","Reine du poids du corps"];
export const XP_LEVEL = 1000;
