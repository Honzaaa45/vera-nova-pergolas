# -*- coding: utf-8 -*-
"""
Génère le catalogue : la liste et les douze fiches produit.

Pourquoi un générateur plutôt que douze fichiers écrits à la main : les
caractéristiques viennent toutes de la même source, et une valeur corrigée
à un seul endroit doit se propager partout. Le résultat reste du HTML
statique, sans build ni dépendance à l'exécution.

Les fiches sont du HTML RÉEL, pas du JavaScript. C'est le point qui compte :
un site dont l'unique raison d'être est d'être trouvé sur « pergola
bioclimatique Romorantin » ne peut pas cacher ses douze produits derrière un
script que les moteurs de recherche n'exécutent pas de façon fiable.

Usage :
    python tools/generer-catalogue.py
"""

import io
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SORTIE = 'catalogue'

FAMILLES = {
    'pergolas':    ('Les pergolas', 'Toiture pilotable, adossée ou autoportante'),
    'fermetures':  ('Les fermetures', 'Ce qui transforme une terrasse en pièce à vivre'),
    'complements': ('Les compléments', 'Même structure, mêmes teintes'),
}

# Toutes les valeurs proviennent de docs/catalogue-produits.md, relevé sur le
# catalogue du fabricant. Ne rien ajouter ici qui n'y figure pas.
PRODUITS = [
  dict(id='compact', no='01', fam='pergolas', cat='Lames orientables', nom='Compact',
       img='canopy-acier', img2='terrasse-piscine-moderne',
       alt="Pergola bioclimatique à lames orientables adossée à une maison",
       accroche="La pergola à lames la plus compacte de la gamme.",
       txt=["Les lames pivotent jusqu'à 110 degrés, davantage que la plupart des "
            "systèmes du marché. Ouvertes, elles dégagent largement le ciel sans "
            "jamais quitter leur cadre ; fermées, la toiture reprend la charge de "
            "neige et évacue la pluie par les chéneaux périphériques.",
            "C'est le modèle qui convient aux terrasses jusqu'à quatre mètres "
            "cinquante de large, adossé à la façade ou en autoportant."],
       specs=[('Largeur maximale', '4,5 m'), ('Avancée maximale', '7,5 m'),
              ('Rotation des lames', '110°'), ('Toit coulissant', 'non'),
              ('Structure', 'aluminium TS-6063'), ('Motorisation', 'Somfy ou Nice')]),

  dict(id='platin', no='02', fam='pergolas', cat='Lames orientables', nom='Platin',
       img='pergola-guirlandes', img2='lounge-exterieur',
       alt="Grande pergola bioclimatique éclairée en soirée",
       accroche="La toiture ne fait pas que pivoter : elle s'efface.",
       txt=["Les lames s'escamotent et s'empilent sur un côté, découvrant "
            "réellement le ciel — là où une pergola à lames simples ne fait que "
            "les mettre à la verticale. Un bandeau LED est intégré à la poutre "
            "périmétrique, sur variateur.",
            "C'est le plus large de la gamme, jusqu'à six mètres, et celui qui "
            "offre le plus grand écart entre ouvert et fermé."],
       specs=[('Largeur maximale', '6 m'), ('Avancée maximale', '7,5 m'),
              ('Toit coulissant', 'oui'), ('Éclairage', 'LED intégrées'),
              ('Structure', 'aluminium TS-6063'), ('Motorisation', 'Somfy ou Nice')]),

  dict(id='oval', no='03', fam='pergolas', cat='Lames orientables', nom='Oval',
       img='terrasse-piscine-moderne', img2='piscine-table',
       alt="Pergola autoportante à poteaux de section ovale",
       accroche="L'eau descend dans les poteaux, pas le long.",
       txt=["Les poteaux de section ovale intègrent la descente d'eau : aucun "
            "tuyau apparent, et la pièce basse en aluminium moulé oriente "
            "l'évacuation du côté voulu.",
            "Les lames pivotent jusqu'à 75 degrés. Le modèle se pose en "
            "autoportant au milieu d'une terrasse comme en adossé."],
       specs=[('Rotation des lames', '75°'), ('Évacuation', 'intégrée aux poteaux'),
              ('Pose', 'autoportante ou adossée'), ('Structure', 'aluminium TS-6063'),
              ('Motorisation', 'Somfy ou Nice')]),

  dict(id='toile', no='04', fam='pergolas', cat='Toile rétractable', nom='Pergola à toile',
       img='terrasse-couverte', img2='maison-terrasse',
       alt="Terrasse couverte par une pergola à toile tendue",
       accroche="La solution des grandes portées.",
       txt=["Une toile tendue sur rails, repliable en accordéon, avec une "
            "silhouette bien plus fine qu'une toiture à lames. La pente de pose, "
            "de 4 à 12 %, conduit l'eau vers le chéneau quand la toile est tendue.",
            "Deux références existent selon la portée : RCS 1400 jusqu'à huit "
            "mètres d'avancée, RCS 1600 jusqu'à dix. Le système se décline en "
            "deux, trois ou quatre rails selon la largeur."],
       specs=[('Largeur maximale', '12 m'), ('Avancée maximale', '8 à 10 m'),
              ('Largeur entre rails', '4 m'), ('Systèmes de rails', '2, 3 ou 4'),
              ('Pente de pose', '4 à 12 %'), ('Motorisation', 'Somfy ou Nice')]),

  dict(id='guillotine', no='05', fam='fermetures', cat='Vitrage motorisé', nom='Guillotine',
       img='maison-terrasse', img2='terrasse-salon',
       alt="Fermeture vitrée à panneaux coulissants verticaux",
       accroche="Des panneaux de verre qui montent et descendent.",
       txt=["Le mouvement est vertical et motorisé. Les panneaux s'arrêtent à "
            "n'importe quelle hauteur, ce qui permet de ventiler sans tout "
            "ouvrir, et le panneau bas fixe peut servir de garde-corps.",
            "Fermés, le double vitrage 4+16+4 et les profilés à rupture "
            "thermique isolent du bruit et du froid sans rien retirer à la vue."],
       specs=[('Vitrage', 'double, 4+16+4 mm'), ('Hauteur maximale', '3 m'),
              ('Largeur maximale', '4 m'), ('Commande', 'motorisée'),
              ('Structure', 'aluminium 6063'), ('Ventilation', 'à toute hauteur')]),

  dict(id='coulissant', no='06', fam='fermetures', cat='Vitrage manuel', nom='Coulissant vitré',
       img='lounge-exterieur', img2='mobilier-blanc-plantes',
       alt="Fermeture vitrée coulissante ouvrant sur un jardin",
       accroche="Les vantaux glissent et s'empilent sur le côté.",
       txt=["Un système manuel, sans moteur ni électricité. Fermé, il isole du "
            "bruit et du froid ; rangé, il libère entièrement l'ouverture et la "
            "terrasse redevient un extérieur.",
            "C'est la fermeture la plus simple et la plus directe quand la "
            "terrasse est déjà couverte."],
       specs=[('Manœuvre', 'manuelle'), ('Déplacement', 'horizontal'),
              ('Isolation', 'thermique et phonique'), ('Rail bas', 'encastré')]),

  dict(id='pliant', no='07', fam='fermetures', cat='Vitrage manuel', nom='Pliant vitré',
       img='mobilier-blanc-plantes', img2='lounge-exterieur',
       alt="Vitrage pliant ouvrant une terrasse sur le jardin",
       accroche="Il se replie, et s'ouvre des deux côtés.",
       txt=["Même principe que le coulissant, mais les vantaux se replient en "
            "accordéon et le mouvement se fait dans les deux sens. L'ouverture "
            "dégagée est plus grande à largeur égale.",
            "La surface de vie couverte gagne d'autant, sans perdre l'isolation "
            "une fois refermé."],
       specs=[('Manœuvre', 'manuelle'), ('Ouverture', 'dans les deux sens'),
              ('Isolation', 'thermique et phonique'), ('Repli', 'en accordéon')]),

  dict(id='zip', no='08', fam='fermetures', cat='Store toile', nom='Zip Screen',
       img='terrasse-salon', img2='guirlandes-ville',
       alt="Store vertical à coulisses latérales sur une terrasse",
       accroche="Il coupe le soleil sans supprimer la vue.",
       txt=["Une toile technique micro-perforée, tendue dans deux glissières "
            "verticales qui l'empêchent de battre. On voit au travers depuis "
            "l'intérieur, beaucoup moins depuis l'extérieur.",
            "Elle filtre 70 à 80 % des rayons UV, casse la force du vent, tient "
            "les insectes dehors, et contribue aux économies de chauffage en "
            "réduisant les déperditions de la façade."],
       specs=[('Filtration UV', '70 à 80 %'), ('Coupe-vent', 'oui'),
              ('Anti-insectes', 'oui'), ('Toiles disponibles', '14 références'),
              ('Guidage', 'glissières latérales'), ('Commande', 'motorisée')]),

  dict(id='toiture-vitree', no='09', fam='complements', cat='Toiture fixe', nom='Toiture vitrée',
       img='piscine-table', img2='terrasse-piscine-moderne',
       alt="Auvent à toiture vitrée reliant maison et jardin",
       accroche="Abriter sans assombrir.",
       txt=["Un auvent entièrement vitré, en verre feuilleté, qui laisse passer "
            "la lumière tout en protégeant de la pluie. Le chéneau est intégré "
            "au pourtour : aucune gouttière apparente ne vient casser la ligne.",
            "C'est la solution des passages entre la maison et le jardin, ou des "
            "entrées qu'on veut abriter sans les obscurcir."],
       specs=[('Toiture', 'verre feuilleté'), ('Évacuation', 'chéneau intégré'),
              ('Structure', 'aluminium TS-6063')]),

  dict(id='store-banne', no='10', fam='complements', cat='Store de façade', nom='Store banne à coffre',
       img='terrasse-chauffage', img2='guirlandes-ville',
       alt="Store banne à coffre déployé au-dessus d'une terrasse",
       accroche="Le coffre referme la toile complètement.",
       txt=["Au repos, la toile disparaît entièrement dans son coffre : ni "
            "salissure, ni décoloration, ni vieillissement prématuré. C'est ce "
            "qui distingue un store à coffre intégral d'un store ouvert.",
            "Il se pose en façade, sans aucune structure au sol, ce qui en fait "
            "la protection la plus discrète quand la terrasse doit rester libre."],
       specs=[('Coffre', 'intégral'), ('Pose', 'en façade'),
              ('Commande', 'motorisée'), ('Structure au sol', 'aucune')]),

  dict(id='parasol', no='11', fam='complements', cat='Protection mobile', nom='Parasol déporté',
       img='piscine-transats', img2='mobilier-blanc-plantes',
       alt="Parasol déporté à mât latéral au bord d'une piscine",
       accroche="Aucun pied au milieu de la table.",
       txt=["Le mât est déporté sur le côté et la toile se déploie en porte-à-faux. "
            "C'est la solution la plus simple quand rien ne peut être fixé au sol "
            "ni en façade.",
            "Il se déplace, s'oriente et se range, sans travaux."],
       specs=[('Mât', 'déporté'), ('Pose', 'posée, sans ancrage'),
              ('Orientation', 'réglable')]),

  dict(id='carport', no='12', fam='complements', cat='Abri de voiture', nom='Carport',
       img='guirlandes-ville', img2='maison-terrasse',
       alt="Abri de voiture en aluminium adossé à une maison",
       accroche="La même structure, pour la voiture.",
       txt=["Le carport reprend les profilés et les teintes de la gamme, "
            "dimensionnés pour abriter une ou deux voitures. L'ensemble reste "
            "cohérent avec la pergola de la terrasse.",
            "Les caractéristiques détaillées sont établies au moment de l'étude, "
            "selon l'implantation et le nombre de véhicules."],
       specs=[('Structure', 'aluminium thermolaqué'), ('Teintes', 'nuancier de la gamme'),
              ('Caractéristiques', 'établies à l\'étude')]),
]

PAR_ID = {p['id']: p for p in PRODUITS}


# ------------------------------------------------------------------ gabarits

def tete(titre, description, prefixe='../'):
    """En-tête commun. `prefixe` remonte à la racine depuis catalogue/."""
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titre}</title>
<meta name="description" content="{description}">
<meta name="theme-color" content="#F3F3EC">
<link rel="icon" href="{prefixe}assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="preload" href="{prefixe}assets/fonts/bodoni-moda-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{prefixe}assets/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{prefixe}assets/css/fonts.css">
<link rel="stylesheet" href="{prefixe}assets/css/site.css">
<link rel="stylesheet" href="{prefixe}assets/css/motion.css">
</head>
<body>

<a class="skip" href="#contenu">Aller au contenu</a>

<header class="bar is-pose" id="bar">
  <a class="bar__badge" href="{prefixe}index.html" aria-label="Vera Nova, accueil">
    <svg class="bar__ring" viewBox="0 0 100 100" aria-hidden="true">
      <defs><path id="cercle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"/></defs>
      <text><textPath href="#cercle" startOffset="0">VERA NOVA · PERGOLAS BIOCLIMATIQUES · </textPath></text>
    </svg>
    <img class="bar__mark" src="{prefixe}assets/img/logo-mark.png" alt="" width="537" height="333" decoding="async">
  </a>
  <nav class="bar__nav" aria-label="Navigation principale">
    <a class="bar__lien" href="index.html"><span>La gamme</span></a>
    <a class="bar__lien" href="{prefixe}index.html#contact"><span>Demander un devis</span></a>
    <a class="bar__lien" href="{prefixe}index.html#secteur"><span>Notre secteur</span></a>
  </nav>
</header>

<main id="contenu">'''


PIED = '''</main>

<footer class="pied theme-sombre">
  <div class="wrap pied__in">
    <a class="pied__top" href="#"><span>Revenir en haut</span></a>
    <div class="pied__marque">
      <img src="../assets/img/logo-full-light.png" alt="Vera Nova" width="1078" height="272" loading="lazy" decoding="async">
      <p class="script pied__script">Loir-et-Cher</p>
    </div>
    <div class="pied__cols">
      <div><span>Téléphone</span><a href="tel:+33700000000">07 XX XX XX XX</a><a href="tel:+33600000000">06 XX XX XX XX</a></div>
      <div><span>Atelier</span><p>5 rue René Bonnet<br>41200 Romorantin-Lanthenay</p></div>
      <div><span>Secteur</span><p>Loir-et-Cher, Sologne, Val de Loire, Cher, Indre-et-Loire</p></div>
    </div>
    <div class="pied__bas">
      <p>Vera Nova · © 2026 Tous droits réservés</p>
      <p><a href="../mentions-legales.html">Mentions légales</a> · <a href="../confidentialite.html">Confidentialité</a></p>
    </div>
  </div>
</footer>

<script src="../assets/js/nav.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
<script src="../assets/js/motion.js" defer></script>

</body>
</html>
'''


def fiche(p):
    specs = "\n".join(
        f'        <div><dt>{d}</dt><dd>{v}</dd></div>' for d, v in p['specs'])

    autres = [q for q in PRODUITS if q['id'] != p['id'] and q['fam'] == p['fam']][:3]
    if len(autres) < 3:
        autres += [q for q in PRODUITS if q['id'] != p['id'] and q not in autres][:3 - len(autres)]

    liens = "\n".join(
        f'''        <a class="voisin" href="{q['id']}.html">
          <figure class="voisin__fig"><img src="../assets/img/gallery/{q['img']}.webp" alt="" width="1000" height="750" loading="lazy" decoding="async"></figure>
          <p class="voisin__cat">{q['cat']}</p>
          <p class="voisin__nom">{q['nom']}</p>
        </a>''' for q in autres)

    paras = "\n".join(f'        <p data-scroll-reveal="p">{t}</p>' for t in p['txt'])
    fam_titre = FAMILLES[p['fam']][0]

    # Données structurées : un produit sans prix se déclare avec une offre
    # « sur devis ». Sans cela Google ignore le balisage.
    schema = f'''<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{p['nom']}",
  "category": "{p['cat']}",
  "description": "{p['accroche']}",
  "image": "https://www.veranova.fr/assets/img/gallery/{p['img']}.webp",
  "brand": {{ "@type": "Brand", "name": "Vera Nova" }},
  "offers": {{
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "EUR",
    "price": "0",
    "description": "Sur devis après visite technique"
  }}
}}
</script>'''

    corps = f'''

<section class="fiche">
  <div class="wrap fiche__tete">
    <p class="fiche__fil"><a href="index.html">La gamme</a> · {fam_titre}</p>
    <p class="fiche__no">N° {p['no']}</p>
    <h1 class="titre-xl" data-scroll-reveal="h">{p['nom']}</h1>
    <p class="fiche__cat">{p['cat']}</p>
    <p class="fiche__accroche" data-scroll-reveal="p">{p['accroche']}</p>
  </div>

  <figure class="fiche__image" data-mask>
    <img src="../assets/img/gallery/{p['img']}.webp" alt="{p['alt']}"
         width="1600" height="1200" fetchpriority="high" decoding="async">
  </figure>

  <div class="wrap fiche__corps">
    <div class="fiche__texte">
{paras}
    </div>

    <dl class="fiche__specs" data-scroll-reveal="ctn">
{specs}
    </dl>
  </div>
</section>

<section class="fiche__second">
  <div class="wrap">
    <figure class="fiche__image2" data-mask>
      <img src="../assets/img/gallery/{p['img2']}.webp" alt="" width="1600" height="900" loading="lazy" decoding="async" data-parallax="16">
    </figure>
  </div>
</section>

<section class="equip theme-nuit">
  <div class="wrap gamme__tete">
    <p class="surtitre" data-scroll-reveal="p">Sur tous nos systèmes</p>
    <h2 class="titre-l" data-scroll-reveal="h">Ce qui se pilote</h2>
  </div>
  <div class="wrap equip__grille" data-scroll-reveal="ctn">
    <article class="equip__i"><h3 class="titre-s">Motorisation</h3><p>Moteurs Somfy et Nice, de 55 à 120 Nm. Télécommande mono ou multicanal.</p></article>
    <article class="equip__i"><h3 class="titre-s">Capteur vent et soleil</h3><p>Fermeture automatique quand le vent forcit, au seuil que vous réglez.</p></article>
    <article class="equip__i"><h3 class="titre-s">Pilotage à distance</h3><p>Connexoon et Yubi, depuis un téléphone, une tablette ou un ordinateur.</p></article>
    <article class="equip__i"><h3 class="titre-s">Vingt teintes</h3><p>Aluminium thermolaqué. Nuancier RAL complet sur demande.</p></article>
  </div>
</section>

<section class="voisins">
  <div class="wrap gamme__tete">
    <p class="surtitre" data-scroll-reveal="p">Dans la même famille</p>
    <h2 class="titre-l" data-scroll-reveal="h">À regarder aussi</h2>
  </div>
  <div class="wrap voisins__grille" data-scroll-reveal="ctn">
{liens}
  </div>
</section>

<section class="devis devis--fin theme-nuit">
  <div class="wrap">
    <p class="surtitre" data-scroll-reveal="p">Parlons-en</p>
    <h2 class="titre-l" data-scroll-reveal="h">Une visite,<br>puis un <span class="script">devis</span></h2>
    <p class="devis__note" data-scroll-reveal="p">
      Le prix dépend de la portée, des appuis, de la motorisation et des fermetures.
      Nous passons mesurer, puis nous vous remettons un devis détaillé, sans engagement.
    </p>
    <a class="btn btn--solid" href="../index.html#contact" data-magnetic="0.25"><span class="mag__in">Demander une étude</span></a>
  </div>
</section>
'''

    titre = f"{p['nom']} — {p['cat']} | Vera Nova"
    desc = f"{p['accroche']} {p['cat']} Vera Nova, conçue et posée en Loir-et-Cher. Sur mesure, devis gratuit."
    return tete(titre, desc).replace('</head>', schema + '\n</head>') + corps + PIED


def liste():
    blocs = []
    for cle, (titre, chapo) in FAMILLES.items():
        cartes = "\n".join(
            f'''        <a class="sys" id="produit-{p['id']}" href="{p['id']}.html" data-tilt="4" data-glow>
          <figure class="sys__fig" data-mask>
            <img src="../assets/img/gallery/{p['img']}.webp" alt="{p['alt']}"
                 width="1000" height="750" loading="lazy" decoding="async">
          </figure>
          <div class="sys__corps">
            <p class="sys__cat">{p['cat']}</p>
            <h3 class="sys__nom">{p['nom']}</h3>
            <p class="sys__txt">{p['accroche']}</p>
            <dl class="mini">
{chr(10).join(f"              <div><dt>{d}</dt><dd>{v}</dd></div>" for d, v in p['specs'][:3])}
            </dl>
            <span class="sys__lien">Voir la fiche</span>
          </div>
        </a>''' for p in PRODUITS if p['fam'] == cle)

        blocs.append(f'''    <div class="fam" id="{cle}" data-scroll-reveal="ctn">
      <div class="fam__tete">
        <p class="fam__no">{list(FAMILLES).index(cle) + 1:02d}</p>
        <h2 class="fam__titre">{titre}</h2>
        <p class="fam__chapo">{chapo}</p>
      </div>
      <div class="fam__grille">
{cartes}
      </div>
    </div>''')

    corps = f'''

<section class="gamme">
  <div class="wrap gamme__tete">
    <p class="surtitre" data-scroll-reveal="p">La gamme</p>
    <h1 class="titre-l" data-scroll-reveal="h">Douze systèmes,<br>une seule structure</h1>
    <p class="gamme__chapo" data-scroll-reveal="p">
      Tout part du même profilé aluminium et du même nuancier. Vous choisissez la
      toiture, puis les fermetures qui vont autour — et l'ensemble se pilote depuis
      une seule télécommande.
    </p>
  </div>

  <div class="wrap gamme__corps">
{chr(10).join(blocs)}
  </div>
</section>
'''
    return tete("La gamme — douze systèmes | Vera Nova",
                "Pergolas bioclimatiques, fermetures vitrées, stores et compléments. "
                "Douze systèmes conçus et posés par Vera Nova en Loir-et-Cher.") + corps + PIED


def main():
    os.makedirs(SORTIE, exist_ok=True)

    io.open(os.path.join(SORTIE, 'index.html'), 'w', encoding='utf-8',
            newline='\n').write(liste())
    print('  catalogue/index.html')

    for p in PRODUITS:
        io.open(os.path.join(SORTIE, p['id'] + '.html'), 'w', encoding='utf-8',
                newline='\n').write(fiche(p))
        print('  catalogue/%s.html' % p['id'])

    print('\n%d pages générées' % (len(PRODUITS) + 1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
