# Mettre le site en ligne

Deux étapes distinctes : d'abord un lien de test gratuit à envoyer à votre ami,
ensuite la vraie mise en ligne avec votre nom de domaine et le référencement
Google.

---

## Étape 1 : un lien à envoyer tout de suite (gratuit, 2 minutes)

**Netlify Drop.** Aucun compte obligatoire, aucune carte bancaire, aucune
installation.

1. Ouvrez **https://app.netlify.com/drop**
2. Ouvrez l'explorateur de fichiers sur le dossier `Bureau`
3. Faites glisser le dossier **`Site Pergola`** entier dans la zone de la page
4. Attendez 20 secondes

Netlify vous donne une adresse du type
`https://exquisite-marzipan-4f2a1c.netlify.app`. Elle est publique, en HTTPS,
et vous pouvez l'envoyer par SMS ou WhatsApp immédiatement.

**Deux choses à savoir :**

- Sans compte, le lien expire au bout de quelques heures. Créez un compte
  gratuit (avec votre e-mail) juste après le dépôt pour le conserver
  définitivement et pouvoir le mettre à jour.
- Pour publier une nouvelle version, vous refaites glisser le dossier. Rien
  d'autre à faire.

**Alternative équivalente :** https://tiiny.host ou https://surge.sh font la
même chose. Netlify reste le plus simple.

---

## Étape 2 : la vraie mise en ligne

### 2.1 Acheter le nom de domaine

Prenez **veranova.fr** (ou `veranova-pergolas.fr` s'il est pris). Comptez 8 à
15 € par an chez OVH, Gandi ou Infomaniak. Le `.fr` est important : il pèse
dans les recherches locales françaises.

Vérifiez la disponibilité sur https://www.afnic.fr/whois

### 2.2 Brancher le domaine sur Netlify

Sur votre site Netlify : **Domain settings → Add custom domain**. Netlify vous
donne des enregistrements DNS à recopier chez votre registraire. Le HTTPS est
activé automatiquement et gratuitement.

Le site est alors en ligne sur `https://www.veranova.fr`, gratuitement et sans
limite de trafic pour un site de cette taille.

### 2.3 Avant de publier, remplacez le domaine dans le code

Trois endroits dans `index.html`, plus deux fichiers :

- balise `<link rel="canonical">`
- balise `<meta property="og:image">`
- bloc de données structurées `"image"`
- `robots.txt` (ligne `Sitemap:`)
- `sitemap.xml` (balise `<loc>`)

Remplacez partout `https://www.veranova.fr/` par votre domaine réel.

---

## Étape 3 : apparaître dans Google

Dans l'ordre d'efficacité pour une entreprise locale.

### 3.1 Fiche Google Business Profile (le plus important, et gratuit)

C'est ce qui vous fait apparaître dans le cadre à droite et sur Google Maps
quand quelqu'un tape « pergola Romorantin ». Pour une entreprise locale, cette
fiche rapporte plus que le site lui-même.

1. https://business.google.com → **Gérer maintenant**
2. Nom : Vera Nova. Catégorie : **Entreprise de construction** ou
   **Fournisseur de pergolas**
3. Adresse : 5 Rue René Bonnet, 41200 Romorantin-Lanthenay
4. Zone desservie : Loir-et-Cher, Sologne, Val de Loire, Cher, Indre-et-Loire
5. Téléphone : 07 XX XX XX XX. Site : votre domaine
6. Google envoie un courrier postal avec un code de validation, comptez 5 à
   14 jours

Ensuite : ajoutez des photos (l'atelier, l'équipe, chaque chantier terminé) et
**demandez un avis à chaque client à la mise en service**. Le nombre d'avis est
le premier critère de classement local.

### 3.2 Google Search Console

1. https://search.google.com/search-console
2. Ajoutez votre domaine, validez la propriété (Netlify permet la validation
   par DNS)
3. Menu **Sitemaps** → saisissez `sitemap.xml` → Envoyer
4. Menu **Inspection d'URL** → collez votre adresse → **Demander l'indexation**

Comptez quelques jours à deux semaines avant l'apparition dans les résultats.

### 3.3 Ce qui est déjà fait dans le code

- balise `<title>` et `<meta name="description">` rédigées avec les mots-clés
  « pergolas bioclimatiques », « Loir-et-Cher », « sur mesure »
- données structurées `HomeAndConstructionBusiness` avec adresse, coordonnées
  GPS, téléphone et zone desservie : c'est ce qui permet à Google d'afficher
  vos horaires et votre position
- `sitemap.xml` et `robots.txt`
- balises Open Graph : quand vous partagez le lien sur WhatsApp ou Facebook,
  l'aperçu affiche une image et un titre propres
- toutes les images ont un attribut `alt` descriptif
- une seule balise `<h1>`, hiérarchie `<h2>` et `<h3>` cohérente

### 3.4 Ce qui vous reste à faire pour monter

- **Les avis Google.** Dix avis récents valent plus que n'importe quelle
  optimisation technique.
- **Des pages par ville.** Quand vous aurez du temps : une page « Pergola
  bioclimatique à Blois », une autre pour Vierzon, Salbris, Lamotte-Beuvron.
  C'est la technique la plus rentable en local.
- **Les annuaires.** Pages Jaunes, Houzz, Travaux.com : inscrivez-vous avec
  exactement le même nom, la même adresse et le même téléphone que sur Google.
  La cohérence de ces trois informations est un critère de classement.
- **Vos photos de chantier.** Elles servent au référencement autant qu'à la
  vente : Google Images amène du trafic sur ce type de recherche.

---

## Récapitulatif des coûts

| Poste | Coût |
|---|---|
| Hébergement Netlify | 0 € |
| Certificat HTTPS | 0 € |
| Nom de domaine .fr | 8 à 15 € par an |
| Fiche Google Business | 0 € |
| Google Search Console | 0 € |
| Formulaire de contact (Formspree gratuit) | 0 € jusqu'à 50 messages par mois |

Soit environ **12 € par an** au total.
