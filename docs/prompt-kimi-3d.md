# Prompt à donner à Kimi — scène 3D interactive

## Image à joindre

**Une seule : `docs/media/reference/vue-ensemble-gamme.jpg`**

C'est la vue d'ensemble du catalogue, que j'ai redressée, recadrée et passée en
16:9. Les dix produits y sont légendés et lisibles — c'est exactement ce qu'il
faut pour que Kimi comprenne la composition attendue.

> **Important sur la formulation.** Le prompt ci-dessous demande de *s'inspirer*
> de la composition, pas de reproduire le rendu. Cette image appartient au
> fabricant turc : demander une copie fidèle produirait une œuvre dérivée que
> vous ne pourriez pas publier. Une maison générique portant les mêmes types de
> produits est à la fois plus sûre et plus utile, puisqu'elle vous appartiendra.

N'envoyez pas les autres photos : elles sont illisibles une fois réduites et
n'apporteront rien au modèle.

---

## Le prompt

Copiez tout ce qui suit.

---

Tu es développeur front-end spécialisé en WebGL et en interfaces interactives.

**Contexte.** Je construis le site vitrine d'un poseur français de pergolas
bioclimatiques. Le site existant est en HTML, CSS et JavaScript natifs,
**sans aucune étape de build** et sans framework. Cette contrainte n'est pas
négociable : le propriétaire du site n'est pas développeur et doit pouvoir
ouvrir un fichier et le modifier.

**Ce que je veux.** Une scène 3D interactive d'une maison contemporaine
équipée des différents produits de la gamme. Au survol d'un produit, la caméra
s'anime en douceur pour cadrer cet endroit de la maison, et une étiquette
apparaît avec le nom du produit. Un clic déclenche un évènement que je pourrai
brancher sur l'ouverture d'une fiche produit.

**Inspire-toi de la composition de l'image jointe** — l'implantation des
produits autour de la maison, l'angle de vue général — mais **ne cherche pas à
reproduire ce rendu.** Construis une maison générique, en volumes simples et
propres. L'image sert de plan d'implantation, pas de modèle à copier.

**Les dix éléments à placer et à rendre survolables :**

| Identifiant | Étiquette française | Emplacement |
|---|---|---|
| `compact` | Pergola bioclimatique Compact | terrasse latérale, rez-de-chaussée |
| `platin` | Pergola bioclimatique Platin | grande terrasse arrière |
| `oval` | Pergola Oval | jonction entre les deux corps de bâtiment |
| `pergola` | Pergola à toile | jardin, en autoportant |
| `zip` | Store Zip Screen | façade de la terrasse latérale |
| `guillotine` | Vitrage Guillotine | étage, façade principale |
| `sliding` | Coulissant vitré | étage, angle |
| `glassroof` | Toiture vitrée | passage entre maison et jardin |
| `cassette` | Store banne coffre | façade droite, à l'étage |
| `umbrella` | Parasol déporté | jardin, à gauche |

**Contraintes techniques, à respecter strictement :**

- Three.js importé depuis un CDN en module ES, via un `importmap`. Aucun
  bundler, aucun `npm install`, aucun fichier à compiler.
- Livre exactement deux fichiers : une page `demo.html` autonome et un module
  `scene.js` commenté en français.
- Géométrie construite en code — `BoxGeometry`, `ExtrudeGeometry`, etc. Aucun
  fichier `.glb` ou `.obj` à télécharger.
- Poids total du JavaScript sous **600 Ko**, temps d'affichage sous 2 secondes
  sur un ordinateur portable courant.
- Sur mobile et sur écran tactile : le survol n'existe pas, remplace-le par un
  appui. Réduis la qualité de rendu et le nombre de lumières.
- Respecte `prefers-reduced-motion` : si l'utilisateur a réduit les animations,
  la caméra se déplace instantanément au lieu de s'animer.
- **Prévois une solution de repli** si WebGL est indisponible : affiche une
  image fixe avec des zones cliquables positionnées en pourcentages, qui
  déclenchent les mêmes évènements. Le site ne doit jamais afficher un cadre
  vide.
- Accessibilité : chaque point d'intérêt doit être atteignable au clavier par
  tabulation, avec un nom accessible. Ne piège pas le focus dans le canevas.
- Expose une API simple : `scene.focus('platin')`, `scene.reset()`, et un
  évènement `produit:selection` portant l'identifiant, pour que je puisse
  brancher mes fiches produit.

**Palette :** accent rouge `#D80110`, anthracite `#2D3740`, fond blanc cassé
`#F4F1EB`. Structures des pergolas en gris anthracite.

**Ce que je ne veux pas :** pas de React, pas de TypeScript, pas de
`package.json`, pas de post-processing lourd, pas de contrôles orbitaux libres
— la caméra reste sur des positions que tu définis.

Commente le code en français, en expliquant les choix plutôt que la syntaxe.
Termine par les étapes d'intégration, numérotées.

---

## Avant de lancer Kimi, une remarque

L'effet que vous décrivez — survoler une zone, zoomer dessus — **ne nécessite
pas de 3D.** Une image large en 16:9 avec des zones cliquables et une animation
de zoom en CSS produit exactement la même sensation, pèse quelques dizaines de
kilo-octets au lieu de six cents, fonctionne partout, et se modifie en changeant
une image.

La 3D apporte autre chose : la possibilité de tourner autour, de voir les lames
s'ouvrir réellement, de changer la teinte en direct. Si c'est cela que vous
visez, elle se justifie pleinement. Si vous vouliez surtout le zoom au survol,
dites-le-moi et je vous le construis directement, sans passer par Kimi ni par
Three.js.

Dans tous les cas, gardez le repli en tête : c'est lui qui fera tourner le site
sur le téléphone d'un client en zone blanche.
