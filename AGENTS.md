# AGENTS.md — Site Vera Nova

Site vitrine une page pour **Vera Nova**, pergolas bioclimatiques,
5 rue René Bonnet, 41200 Romorantin-Lanthenay. Entreprise récente, sans
chantier photographié à ce jour. But du site : générer des demandes de devis
locales.

**Dossier complet : `RESUME-DU-SITE.md`.** À lire avant toute modification
de structure.

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

assets/css/style.css     design system et mise en page
assets/css/premium.css   couche de finition
assets/css/motion.css    couche d'animation, chargée en DERNIER
assets/css/fonts.css     @font-face locaux

assets/js/text-rotate.js   titre à mots tournants
assets/js/hero-marquee.js  ruban d'images
assets/js/dock.js          navigation de la barre haute
assets/js/anim.js          révélations, compteurs, parallaxe
assets/js/products.js      section Produits
assets/js/map.js           carte Leaflet
assets/js/main.js          frise, témoignages, formulaire
assets/js/premium.js       effets de finition
assets/js/motion.js        Lenis + GSAP : défilement, révélations, magnétisme

assets/img/gallery/        24 webp : 12 photos en 1000 px et 520 px
assets/data/temoignages.json  vide, volontairement
```

## Design system

Un seul accent : le rouge `#D80110`. Anthracite `#2D3740` pour les titres.
Fond blanc. Un seul rayon d'angle (8 px), pilule pour les boutons.
Sora pour les titres, Manrope pour le texte. **Ni Inter, ni serif.**

## Couche d'animation

`motion.js` + `motion.css`, au-dessus de Lenis 1.1 et GSAP 3.12 / ScrollTrigger,
chargés en CDN. Tout se pilote par attribut, sans toucher au JS :

| attribut | effet |
|---|---|
| `data-split` | le titre se révèle mot par mot |
| `data-magnetic="0.3"` | le bouton est attiré par le curseur |
| `data-tilt="5"` | la carte s'incline et reçoit un reflet |
| `data-glow` | liseré rouge au survol |
| `data-mask` | l'image se dévoile par le bas |
| `data-depth="0.2"` | parallaxe ; négatif pour reculer la couche |

Règles à ne pas casser :

- `motion.css` se charge **en dernier**, il recompose des transformations.
- `data-depth` n'écrit **que la variable `--dy`**. Les couches du héros portent
  déjà un `translateZ` et une rotation : leur poser un `transform` GSAP les
  aplatirait. Toute nouvelle couche doit recomposer son transform dans
  `motion.css`.
- Ne jamais cumuler `data-depth` et `data-parallax` sur un même élément :
  ce sont deux systèmes distincts, `data-parallax` vit dans `anim.js`.
- Le masquage des titres est conditionné à `.has-motion`, posé par le script.
  Sans ce garde-fou, un CDN injoignable ferait disparaître les titres.
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
7. **Ne supprime pas le piège à robots** du formulaire (champ `site`, classe
   `.pot` dans `main.js` et `style.css`).
8. **N'ajoute pas d'effet de loupe au dock.** Animer `width`/`height`
   déformait la barre. L'indicateur glissant actuel le remplace.
9. **Zéro tiret cadratin** (`—`) et zéro demi-cadratin (`–`) dans tout texte
   visible. Utilise le trait d'union ou reformule.
10. **Respecte `prefers-reduced-motion`** sur toute nouvelle animation.

## Valeurs provisoires

Ne les présente jamais comme certaines. Elles portent un commentaire
`À CONFIRMER` ou `[À COMPLÉTER]` dans le code :

- prix de 750 € TTC le m², fourchette 9 000 à 13 000 €
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
