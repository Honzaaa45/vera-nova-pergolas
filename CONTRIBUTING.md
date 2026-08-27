# Contribuer

Merci de l'intérêt porté au projet.

Ce dépôt est sous [tous droits réservés](LICENSE) : il est publié pour être lu,
pas pour être repris. Les **issues** — remarques, questions, signalements de
bugs — sont les bienvenues. Une *pull request* ne sera fusionnée que sur
sollicitation préalable.

Le reste de ce document décrit comment lancer et vérifier le site. Il tient en
une page : sans étape de build, il n'y a presque rien à installer.

## Lancer le site en local

Aucune dépendance à installer. Il suffit d'un serveur statique, parce que la
page charge des polices et un fichier JSON — ce que `file://` bloque.

```bash
npx --yes serve -l 5178 .
```

Puis ouvrez <http://localhost:5178>.

Toute autre méthode fonctionne : `python -m http.server 5178`, l'extension
Live Server de VS Code, ou n'importe quel serveur statique.

## Vérifier avant de proposer une modification

Les trois commandes lancées par la CI. Elles doivent toutes passer.

```bash
for f in assets/js/*.js; do node --check "$f"; done
```

```bash
npx --yes html-validate@9 index.html 404.html mentions-legales.html confidentialite.html
```

```bash
node tools/verifier-liens.mjs
```

Sous PowerShell, la première boucle s'écrit :

```powershell
Get-ChildItem assets/js/*.js | ForEach-Object { node --check $_.FullName }
```

## Règles du projet

Elles sont détaillées dans [AGENTS.md](AGENTS.md). Les trois qui comptent le
plus :

1. **Aucune étape de build.** Le site doit rester modifiable par une personne
   qui ouvre un fichier dans un éditeur. Pas de bundler, pas de transpilation,
   pas de `package.json` en dépendance de production.
2. **`motion.css` se charge en dernier**, il recompose des transformations
   posées par les feuilles précédentes.
3. **Rien d'inventé dans le contenu.** Pas de faux témoignage, pas de fausse
   référence client, pas de chiffre décoratif. La section Avis reste masquée
   tant que `assets/data/temoignages.json` est vide.

## Style de code

- JavaScript en ES5 dans une IIFE, sans dépendance. Chaque module est
  autonome et sort silencieusement si son point d'ancrage est absent.
- Commentaires en français, qui expliquent **pourquoi** plutôt que quoi.
- CSS : une seule teinte d'accent (`#D80110`), un seul rayon d'angle.
- Toute animation doit être neutralisée sous `prefers-reduced-motion`.

## Messages de commit

Convention `type: description`, en français, à l'impératif.

```
feat: ajouter le filtre par gamme sur les réalisations
fix: corriger le calcul de largeur du titre tournant sur mobile
docs: préciser la procédure de mise en ligne
chore: mettre à jour la version de GSAP
ci: vérifier aussi les pages légales
```

## Médias du README

Les bannières et l'image sociale sont générées à partir des sources SVG de
`docs/media/`. Après avoir modifié une source, régénérez le PNG :

```bash
npx --yes sharp-cli@5 --input docs/media/social.svg --output docs/media/rendu resize 1280 640
```

L'outil conserve le nom du fichier d'entrée : renommez ensuite
`docs/media/rendu/social.svg` en `docs/media/social.png`, puis supprimez le
dossier `rendu`.

### Enregistrer la démonstration

`docs/media/demo.png` est un visuel d'attente. Pour le remplacer par une vraie
démonstration, enregistrez un GIF de **12 à 15 secondes**, en **1200×600**,
puis déposez-le sous `docs/media/demo.gif` et changez l'extension dans le
README.

À filmer, dans cet ordre :

1. le haut de page, en laissant le titre tourner sur deux ou trois formules ;
2. un défilement lent jusqu'à la section Produits, pour montrer la révélation
   des titres mot par mot ;
3. un clic sur « Plus de détails », qui déplie le panneau produit ;
4. un passage de souris sur deux cartes de réalisation, pour l'inclinaison et
   le liseré.

Outils possibles : ScreenToGif (Windows, gratuit), ou l'enregistreur d'écran
de Windows suivi d'une conversion.
