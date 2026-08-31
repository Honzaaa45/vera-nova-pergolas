# Du catalogue au modèle 3D — la marche à suivre

Trois étapes, dans cet ordre. Chacune produit l'entrée de la suivante.

```
photo du catalogue  →  ①  image nettoyée  →  ②  image sans étiquettes  →  ③  modèle 3D
   (téléphone)          recadrée, redressée      plus aucun texte           Kimi + Three.js
```

---

## ① C'est déjà fait

`docs/media/reference/vue-ensemble-gamme.jpg` — la double page redressée,
recadrée au format 16:9, sans la main ni le clavier. C'est **ce fichier** qui
sert d'entrée à l'étape suivante, pas la photo brute du téléphone. Autrement
l'IA doit régler deux problèmes difficiles d'un coup, et elle en rate un.

---

## ② Effacer toutes les étiquettes

**Outil :** Gemini, ou tout éditeur d'image par IA. Joignez
`vue-ensemble-gamme.jpg` et collez ceci.

```
Retire tous les éléments graphiques ajoutés par-dessus cette illustration
d'architecture, pour ne laisser que la scène elle-même.

À effacer complètement :
- Tous les mots en majuscules posés sur le ciel et sur la pelouse :
  UMBRELLA, PLATIN, ZIP SCREEN, COMPACT, OVAL PERGOLA, GLASS ROOF,
  SLIDING GLASS, GUILLOTINE, CASSETTE AWNING, PERGOLA.
- Toutes les lignes pointillées et toutes les petites flèches.
- Toutes les pastilles de couleur (vertes, orange, violettes, jaunes, roses).
- Le texte manuscrit en bas à droite.
- Les quatre pictogrammes ronds en haut à gauche.
- Le numéro de page.
- La pliure verticale au centre de l'image, ainsi que les deux taches de
  reflet lumineux sur la pelouse.

À reconstituer sous les éléments effacés :
- Le ciel bleu dégradé, sans raccord visible.
- La pelouse, la végétation et les arbres, en prolongeant naturellement les
  textures voisines.

À conserver strictement intact :
- La maison et toute son architecture.
- Toutes les pergolas, stores, vitrages et structures en aluminium.
- La voiture, le mobilier de jardin, la terrasse en bois, l'allée.
- Le cadrage, les proportions, les couleurs et la lumière.

Résultat attendu : la même illustration, propre, sans aucun texte ni
annotation, comme un rendu d'architecte d'origine. Haute résolution.
```

**Si le résultat n'est pas net du premier coup**, relancez en ajoutant :
`Il reste du texte visible ici : [décrivez l'endroit]. Efface-le et
reconstitue le fond.` Deux ou trois allers-retours sont normaux.

> **Sur la perfection.** Cette image sert de **plan d'implantation pour Kimi**,
> pas de visuel pour le site. Kimi a besoin de comprendre où se trouve chaque
> produit, pas de pixels irréprochables. Ne passez pas deux heures dessus :
> dès que les étiquettes ont disparu et que la scène est lisible, c'est bon.

---

## ③ Le modèle 3D

Votre démonstration **Villa Ravine** montre exactement ce dont Kimi est
capable, et confirme que l'approche est compatible avec le site :

| Ce que fait Villa Ravine | Verdict |
|---|---|
| Three.js 0.166 chargé en `importmap` depuis unpkg | ✅ aucun build nécessaire |
| Géométrie générée en code, aucun fichier 3D à charger | ✅ |
| 338 000 triangles à 58 images/seconde | ✅ fluide |
| 64 Ko de code, plus 260 Ko pour Three.js | ✅ dans le budget |
| Points de vue prédéfinis, heure de la journée, calques | ✅ exactement le principe voulu |

Le prompt à donner à Kimi, en joignant **l'image nettoyée de l'étape ②** :

---

Construis un modèle 3D temps réel du même type que « Villa Ravine », dans le
même esprit et avec la même qualité d'exécution.

**Le sujet.** La maison de l'image jointe, avec l'ensemble de ses protections
solaires extérieures. Inspire-toi de l'implantation et de l'angle de vue de
l'image ; ce n'est pas une copie à faire au pixel près, c'est un plan
d'implantation.

**Les dix éléments à modéliser et à rendre sélectionnables**, chacun avec son
identifiant et son étiquette française :

| Identifiant | Étiquette | Emplacement sur l'image |
|---|---|---|
| `compact` | Pergola bioclimatique Compact | terrasse latérale gauche, rez-de-chaussée |
| `platin` | Pergola bioclimatique Platin | grande terrasse, corps de bâtiment gauche |
| `oval` | Pergola Oval | jonction entre les deux corps de bâtiment |
| `pergola` | Pergola à toile | jardin, autoportante, à droite |
| `zip` | Store Zip Screen | façade de la terrasse latérale |
| `guillotine` | Vitrage Guillotine | étage, façade droite |
| `sliding` | Coulissant vitré | étage, angle du corps droit |
| `glassroof` | Toiture vitrée | passage vitré au centre |
| `cassette` | Store banne à coffre | façade droite, à l'étage |
| `umbrella` | Parasol déporté | jardin, à gauche |

**Les interactions.** Au survol d'un élément, la caméra s'anime vers un
cadrage rapproché et une étiquette apparaît. Un clic émet un évènement
`produit:selection` portant l'identifiant, que je branche sur mes fiches
produit. Une liste de points de vue latérale permet d'y aller directement,
comme dans Villa Ravine.

**Les commandes utiles à garder :** heure de la journée, orbite automatique,
et des bascules pour masquer la végétation ou le mobilier.

**Les contraintes techniques :**

- Three.js en `importmap` depuis un CDN, exactement comme Villa Ravine.
  Aucun `npm install` à faire de mon côté.
- Géométrie construite en code. Aucun fichier `.glb` ou `.obj` externe.
- Sous 400 Ko de code, hors Three.js.
- Sur écran tactile, le survol n'existe pas : remplace-le par un appui, et
  baisse la qualité de rendu.
- Respecte `prefers-reduced-motion` : la caméra se déplace alors sans
  animation.
- **Prévois un repli si WebGL est indisponible** : une image fixe avec des
  zones cliquables en pourcentages, déclenchant les mêmes évènements. Le site
  ne doit jamais afficher un cadre vide.
- Chaque point d'intérêt doit être atteignable au clavier, avec un nom
  accessible. Ne piège pas le focus dans le canevas.
- Expose `scene.focus('platin')` et `scene.reset()`.

**Palette :** structures en gris anthracite RAL 7016, accent rouge `#D80110`,
fond blanc cassé `#F4F1EB`. Maison à enduit clair, terrasse en bois gris,
végétation de climat tempéré français — pas de palmiers.

Commente le code en français. Termine par les étapes d'intégration, numérotées.

---

## Ce que je ferai ensuite

Quand Kimi vous aura livré le modèle, envoyez-le-moi. Je m'occupe de :

1. l'intégrer dans la page sans casser la couche d'animation existante ;
2. brancher `produit:selection` sur les douze fiches produit déjà en place ;
3. vérifier le repli sans WebGL, le clavier et le mobile ;
4. mesurer le coût réel au chargement, et le charger à la demande plutôt qu'au
   démarrage si nécessaire.
