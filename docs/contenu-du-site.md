# Vera Nova — dossier de reprise

Document à transmettre à un autre développeur ou à un autre assistant pour
qu'il reprenne le site sans repartir de zéro.

---

## 1. Le projet

Site vitrine une page pour **Vera Nova**, entreprise de **pergolas
bioclimatiques** basée au 5 rue René Bonnet, 41200 Romorantin-Lanthenay
(Loir-et-Cher, France). Entreprise **récente, sans réalisation photographiée
à ce jour**. Objectif du site : générer des demandes de devis locales.

Cible : propriétaires de 40 à 65 ans, budget 9 000 à 13 000 €, secteur Sologne
et Val de Loire.

Téléphones : 07 XX XX XX XX (principal), 06 XX XX XX XX (secondaire).
Baseline de marque : « Plus qu'un extérieur, un art de vivre. »

---

## 2. Stack

**HTML, CSS et JavaScript natifs. Aucun build, aucun framework, aucun
`npm install`.** On dépose le dossier sur un hébergeur statique et c'est en
ligne. Ce choix est délibéré : le propriétaire n'est pas développeur et doit
pouvoir modifier un texte sans chaîne de compilation.

Dépendances externes, toutes par CDN :

| Ressource | Usage |
|---|---|
| Phosphor Icons (unpkg) | jeu d'icônes |
| Leaflet 1.9.4 (unpkg) | carte de contact |
| Tuiles CARTO / OpenStreetMap | fond de plan |

Les polices (Sora et Manrope) sont **hébergées en local** dans
`assets/fonts/`, volontairement : cela supprime tout appel à Google et
simplifie la conformité RGPD.

---

## 3. Arborescence

```
index.html                    la page principale
mentions-legales.html         obligatoire, 11 champs à compléter
confidentialite.html          notice RGPD
404.html
robots.txt / sitemap.xml

assets/css/style.css          design system et mise en page (~46 Ko)
assets/css/premium.css        couche de finition visuelle
assets/css/fonts.css          @font-face locaux

assets/js/text-rotate.js      titre du hero, mots qui tournent
assets/js/hero-marquee.js     ruban d'images du hero
assets/js/dock.js             navigation dans la barre haute
assets/js/anim.js             révélations, compteurs, parallaxe
assets/js/products.js         section Produits
assets/js/map.js              carte Leaflet
assets/js/main.js             frise, témoignages, formulaire
assets/js/premium.js          effets de finition

assets/fonts/                 16 woff2 (Sora + Manrope, latin et latin-ext)
assets/img/gallery/           24 webp : 12 photos en 1000 px et 520 px
assets/img/logo-*.png         déclinaisons du logo, fond transparent
assets/data/temoignages.json  vide, volontairement
```

---

## 4. Design system

Palette dérivée du logo, **thème clair verrouillé** :

```
--ink-2   #2D3740   anthracite de marque, titres
--red     #D80110   accent unique
--taupe   #8F8882   neutre tertiaire
--paper   #FFFFFF   fond
--paper-2 #F5F7F8   sections alternées
```

**Un seul accent** (le rouge), utilisé partout à l'identique. **Un seul rayon
d'angle** (8 px) pour les surfaces, pilule pour les boutons.

Typographie : **Sora** pour les titres, **Manrope** pour le texte courant.
Ni Inter, ni serif.

---

## 5. Structure de la page

1. **Barre haute** : logo, dock de navigation, téléphone, bouton devis
2. **Hero** : pastille, titre à mots tournants, description, deux boutons,
   ruban d'images en boucle
3. **Le principe** : trois cartes (lames ouvertes, inclinées, fermées)
4. **Nos produits** : section collante à trois zones, bascule vers un détail
5. **Options** : 16 options réparties en 4 groupes
6. **Réalisations** : grille asymétrique de 6 photos
7. **Budget** : prix affiché + engagements
8. **Déroulement** : frise verticale en 4 étapes
9. **Témoignages** : masquée tant que le JSON est vide
10. **Questions** : accordéon de 7 questions
11. **Contact** : formulaire + carte Leaflet + téléphones
12. **Pied de page**

Environ 11 écrans de défilement sur desktop.

---

## 6. Animations en place

- **Titre du hero** : la deuxième ligne change toutes les 2,8 s parmi dix
  formules avec émojis. Découpage par graphèmes, la largeur du bloc suit le
  mot. Liste dans `TEXTES`, en haut de `text-rotate.js`
- **Ruban du hero** : boucle infinie de 52 s, en pause hors écran
- **Dock** : indicateur qui glisse d'une icône à l'autre, point rouge sur la
  section courante
- **Produits** : le nom se dévoile lettre par lettre au fil du défilement,
  barre de progression, cadre de visée au survol de l'image, bascule de mise
  en page par transition de `grid-template-columns`
- **Général** : révélations au défilement (`data-reveal`, `data-stagger`,
  `data-delay`), compteurs animés, parallaxe sur la galerie

`prefers-reduced-motion` respecté partout.

---

## 7. Décisions à ne pas défaire

Un repreneur risque de « corriger » ces points sans savoir pourquoi ils sont
ainsi. Ils sont volontaires.

1. **Aucun témoignage n'est inventé.** La section est masquée tant que
   `temoignages.json` contient moins de trois entrées. Les faux avis clients
   sont interdits par le code de la consommation.
2. **Aucune fausse réalisation.** Les 12 photos viennent d'Unsplash (licence
   commerciale, sans attribution) et sont déclarées comme illustrations dans
   les mentions légales. Aucune commune ni aucun client fictif n'apparaît.
3. **Aucune 3D.** Un configurateur Three.js puis une maquette CSS 3D ont
   existé et ont été retirés à la demande du propriétaire. Ne pas les
   réintroduire.
4. **Aucun cookie, aucun traceur.** C'est ce qui permet de se passer de
   bannière de consentement. Ajouter Google Analytics rendrait la bannière
   obligatoire et imposerait de réécrire la page de confidentialité.
5. **Polices en local.** Ne pas repasser sur Google Fonts.
6. **Piège à robots** dans le formulaire (champ `site`, classe `.pot`). Rempli
   par un robot, la demande est abandonnée en silence.
7. **Le défilement n'est jamais détourné.** Une version antérieure du hero
   bloquait la molette avec `preventDefault`, ce qui cassait le clavier et les
   lecteurs d'écran. Remplacé par du `position: sticky`.
8. **Le dock n'a pas d'effet de loupe.** La version d'origine animait `width`
   et `height`, ce qui déformait la barre. Remplacé par un indicateur
   glissant.

---

## 8. Performance

Premier chargement : **environ 420 Ko** pour 50 requêtes.

Les photos sont en **WebP, deux tailles** : `nom.webp` (1000 px) pour les
produits et réalisations, `nom-sm.webp` (520 px) pour le ruban du hero.
Remplacer une photo suppose de fournir les deux fichiers.

---

## 9. Référencement

Déjà en place : `title` et `meta description` travaillés, données structurées
`HomeAndConstructionBusiness` (adresse, GPS, téléphone, zone desservie),
données structurées `FAQPage` sur les 6 questions, Open Graph, `sitemap.xml`,
`robots.txt`, `alt` sur toutes les images, un seul `h1`.

Reste à faire côté propriétaire : fiche Google Business Profile, avis clients,
et à terme des pages par ville (Blois, Vierzon, Salbris, Lamotte-Beuvron).

---

## 10. Ce qui bloque encore la publication

| Point | Qui |
|---|---|
| 11 champs des mentions légales, dont **assurance RC pro et garantie décennale** | propriétaire |
| Photos des premiers chantiers | propriétaire |
| Prix réel (750 €/m² est une valeur de marché à confirmer) | propriétaire |
| Garanties 10 ans et 5 ans à confirmer | propriétaire |
| Adresse e-mail professionnelle | propriétaire |
| Service de réception du formulaire (Formspree ou équivalent) | propriétaire |
| Nom de domaine | propriétaire |
| Trois avis clients pour activer la section témoignages | propriétaire |

Tous les endroits concernés portent un commentaire `À CONFIRMER` ou
`[À COMPLÉTER]` dans le code.

---

## 11. Pistes d'amélioration non traitées

- pages par ville pour le référencement local
- galerie avant/après une fois les chantiers photographiés
- simulateur de budget en ligne (surface × prix au m²)
- calendrier de prise de rendez-vous
- version anglaise, si clientèle étrangère en Val de Loire
- passage des icônes Phosphor en SVG local pour supprimer la dernière
  dépendance externe non cartographique
