# AGENTS.md — Site Vera Nova

Site vitrine une page pour **Vera Nova**, pergolas bioclimatiques,
5 rue René Bonnet, 41200 Romorantin-Lanthenay. Entreprise récente, sans
chantier photographié à ce jour. But du site : générer des demandes de devis
locales.

**À lire avant toute modification de structure :**
`docs/contenu-du-site.md` pour la reprise générale, et
`docs/catalogue-produits.md` pour les caractéristiques produits, qui font foi.

---

## Stack

HTML, CSS et JavaScript **natifs**. Aucun build, aucun framework, aucun
`npm install`. Le propriétaire n'est pas développeur : il doit pouvoir
changer un texte sans chaîne de compilation.

**N'introduis ni React, ni Tailwind, ni bundler, ni gestionnaire de paquets.**
Si une amélioration semble exiger un framework, propose-la en texte, ne
l'implémente pas.

Aperçu local : `npx serve -l 5178 .`

## Carte du projet

```
index.html               page principale
mentions-legales.html    obligatoire, 11 champs à compléter
confidentialite.html     notice RGPD
404.html

assets/css/fonts.css     @font-face locaux, généré par tools/telecharger-polices.py
assets/css/site.css      feuille principale : jetons, typographie, sections
assets/css/motion.css    couche d'animation, chargée en DERNIER

assets/js/nav.js           barre haute, menu, écran d'ouverture
assets/js/text-rotate.js   titre à mots tournants
assets/js/pins.js          points d'intérêt sur l'image d'accueil
assets/js/nuancier.js      les vingt teintes RAL, construites depuis des données
assets/js/map.js           carte Leaflet du secteur
assets/js/main.js          formulaire de devis
assets/js/motion.js        Lenis + GSAP : défilement, révélations, parallaxe

assets/img/gallery/        24 webp : 12 photos en 1000 px et 520 px
assets/data/temoignages.json  vide, volontairement
```

## Design system

Direction éditoriale, inspirée d'era-residence.com : **deux registres
typographiques et rien entre les deux.**

- **Titres** : Bodoni Moda, Didone à fort contraste, posée très grande
  (jusqu'à 6,5 rem) avec un interlettrage négatif de -.02em. Jamais sous
  20 px : ses déliés y disparaissent.
- **Tout le reste** : Archivo, grotesque à chasse variable, employée
  minuscule (.6 à .7 rem), en capitales, interlettrage +.2em.
- **Un mot d'accent par section** : Pinyon Script. Au-delà, l'anglaise
  cesse d'être un accent pour devenir un motif.

Palette : blanc chaud `#F3F3EC`, bleu nuit `#17233B`, aubergine `#340C24`
pour l'écran d'ouverture, rouge de la marque `#D80110`.

Angles vifs, sauf les boutons en pilule. La variable `--air` porte toute la
respiration verticale : la réduire tasse instantanément la page.

## Couche d'animation

`motion.js` + `motion.css`, au-dessus de Lenis 1.1 et GSAP 3.12 / ScrollTrigger,
chargés en CDN. Tout se pilote par attribut, sans toucher au JS :

| attribut | effet |
|---|---|
| `data-scroll-reveal="h"` | titre révélé mot par mot sous un masque |
| `data-scroll-reveal="p"` | paragraphe qui monte en fondu |
| `data-scroll-reveal="a"` | même mouvement, plus vif, pour un fragment court |
| `data-scroll-reveal="ctn"` | les enfants du conteneur montent en cascade |
| `data-scroll-reveal="line"` | un filet se trace de gauche à droite |
| `data-scroll-reveal="slide"` | un bloc entre par le côté |
| `data-magnetic="0.3"` | le bouton est attiré par le curseur |
| `data-tilt="5"` | la carte s'incline et reçoit un reflet |
| `data-glow` | liseré rouge au survol |
| `data-mask` | l'image se dévoile par le bas |
| `data-parallax="18"` | l'image dérive de ±18 px au défilement |

Règles à ne pas casser :

- `motion.css` se charge **en dernier**, il recompose des transformations.
- `data-depth` n'écrit **que la variable `--dy`**. Les couches du héros portent
  déjà un `translateZ` et une rotation : leur poser un `transform` GSAP les
  aplatirait. Toute nouvelle couche doit recomposer son transform dans
  `motion.css`.
- Le masquage des éléments révélés est conditionné à `.has-motion`, posée par
  le script lui-même. Sans ce garde-fou, un CDN injoignable ferait disparaître
  la moitié de la page pour de bon.
- Les coordonnées des points d'intérêt sont exprimées **dans l'espace de
  l'image**, pas du conteneur : l'image est en `object-fit: cover`, donc le
  cadrage visible dépend du format de l'écran. `pins.js` fait la projection.
- `history.scrollRestoration` passe en `manual` : sinon la position restaurée
  au rechargement désynchronise Lenis et ScrollTrigger, et le parallaxe se fige.

Tout est neutralisé sous `prefers-reduced-motion`, et les effets de survol
sont coupés sur écran tactile.

---

## Contraintes à ne jamais enfreindre

Ces points sont volontaires. Les « corriger » casserait le site ou exposerait
le client juridiquement.

1. **N'invente aucun témoignage client.** La section est masquée tant que
   `assets/data/temoignages.json` a moins de trois entrées. Les faux avis
   sont interdits par le code de la consommation.
2. **N'invente aucune réalisation, commune ou référence client.** Les 12
   photos viennent d'Unsplash et sont déclarées comme illustrations dans les
   mentions légales.
3. **Ne réintroduis aucune 3D.** Un configurateur Three.js puis une maquette
   CSS 3D ont existé et ont été retirés à la demande du propriétaire.
4. **N'ajoute ni cookie ni traceur.** L'absence de cookie est ce qui permet
   de se passer de bannière de consentement. Ajouter Google Analytics rendrait
   la bannière obligatoire et imposerait de réécrire `confidentialite.html`.
5. **Ne repasse pas sur Google Fonts.** Les polices sont en local dans
   `assets/fonts/` pour éviter de transmettre l'IP des visiteurs à Google.
6. **Ne détourne jamais le défilement.** Pas de `preventDefault` sur `wheel`,
   pas de scroll-jacking : ça casse le clavier et les lecteurs d'écran.
   Utilise `position: sticky`.
7. **Ne supprime pas le piège à robots** du formulaire (champ `website`,
   classe `.pot`).
8. **N'affiche aucun prix.** Exigence explicite de l'entreprise : chaque
   pergola étant calculée pour son emplacement, un tarif au mètre carré
   serait démenti par la visite. Tout passe par le devis.
9. **Zéro tiret cadratin** (`—`) et zéro demi-cadratin (`–`) dans tout texte
   visible. Utilise le trait d'union ou reformule.
10. **Respecte `prefers-reduced-motion`** sur toute nouvelle animation.

## Valeurs provisoires

Ne les présente jamais comme certaines. Elles portent un commentaire
`À CONFIRMER` ou `[À COMPLÉTER]` dans le code :

- garanties 10 ans (structure) et 5 ans (motorisation)
- délais 6 à 10 semaines, pose en 1 à 2 jours
- `contact@veranova.fr` est un exemple
- les 11 champs des mentions légales, dont **assurance RC pro et garantie
  décennale**, obligatoires dans le bâtiment

## Contrôles avant de rendre la main

- aucune erreur dans la console
- aucun débordement horizontal : `document.documentElement.scrollWidth`
  ne doit pas dépasser `innerWidth`
- aucune image cassée
- un seul `<h1>`
- testé à 1280 px **et** à 375 px
