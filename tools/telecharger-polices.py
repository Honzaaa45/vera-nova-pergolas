# -*- coding: utf-8 -*-
"""
Télécharge les polices depuis Google Fonts pour les héberger localement.

Le site n'appelle jamais le CDN de Google : cela transmettrait l'adresse IP de
chaque visiteur à un serveur tiers sans son consentement, ce qu'un tribunal
allemand a jugé contraire au RGPD en 2022. Les fichiers sont donc rapatriés
une fois pour toutes et servis depuis le même domaine.

Ce script n'est à relancer que pour ajouter une famille ou monter de version.

Usage :
    python tools/telecharger-polices.py
"""

import io
import os
import re
import sys
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Un navigateur récent obtient du woff2 ; sans cet en-tête Google renvoie du
# ttf, quatre fois plus lourd.
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

DOSSIER = 'assets/fonts'

# On ne garde que le latin : le site est en français, les autres sous-ensembles
# (cyrillique, grec, vietnamien) seraient téléchargés pour rien.
SOUS_ENSEMBLES = ('latin', 'latin-ext')

FAMILLES = [
    # Syntaxe de PLAGE (400..600) et non de liste (400;500;600) : la liste
    # fait renvoyer un fichier statique par graisse, la plage renvoie une
    # seule police variable qui les couvre toutes.
    ('Poppins:wght@400;500;600;700', 'poppins', 'titres, grotesque géométrique'),
    ('Inter:wght@400..600', 'inter', 'texte courant et micro-étiquettes'),
]


def recuperer(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def traiter(requete, base):
    """Télécharge les woff2 d'une famille et renvoie ses blocs @font-face."""
    css = recuperer(
        'https://fonts.googleapis.com/css2?family=%s&display=swap' % requete
    ).decode('utf-8')

    blocs = []
    # Google précède chaque @font-face d'un commentaire nommant le sous-ensemble
    for m in re.finditer(r'/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})', css):
        sous, bloc = m.group(1), m.group(2)
        if sous not in SOUS_ENSEMBLES:
            continue

        url = re.search(r'url\((https://[^)]+\.woff2)\)', bloc)
        if not url:
            continue

        # Une police NON variable renvoie un fichier par graisse. Sans le
        # poids dans le nom, les fichiers s'écrasent l'un l'autre et seule
        # la dernière graisse survit — la page s'affiche alors tout en gras.
        poids = re.search(r'font-weight:\s*([\d ]+)', bloc)
        poids = poids.group(1).strip().replace(' ', '-') if poids else '400'
        variable = ' ' in poids or '-' in poids
        nom = ('%s-%s.woff2' % (base, sous) if variable
               else '%s-%s-%s.woff2' % (base, poids, sous))
        chemin = os.path.join(DOSSIER, nom)
        donnees = recuperer(url.group(1))
        with open(chemin, 'wb') as f:
            f.write(donnees)
        print('  %-34s %6d Ko' % (nom, len(donnees) // 1024))

        # on remplace l'URL distante par le fichier local
        bloc = bloc.replace(url.group(1), '../fonts/' + nom)
        bloc = re.sub(r'\s+', ' ', bloc).strip()
        blocs.append(bloc)

    return blocs


def main():
    os.makedirs(DOSSIER, exist_ok=True)
    tout = []
    for requete, base, description in FAMILLES:
        print('%s — %s' % (base, description))
        tout.extend(traiter(requete, base))
        print()

    entete = (
        '/* =========================================================================\n'
        '   POLICES AUTO-HÉBERGÉES\n'
        '\n'
        '   Générées par tools/telecharger-polices.py. Ne pas modifier à la main :\n'
        '   relancer le script.\n'
        '\n'
        '   Le site n\'appelle jamais fonts.googleapis.com. Ce CDN transmet\n'
        '   l\'adresse IP du visiteur à un serveur tiers sans son consentement,\n'
        '   pratique jugée contraire au RGPD par un tribunal allemand en 2022.\n'
        '   Les fichiers sont servis depuis le même domaine, ce qui supprime au\n'
        '   passage un aller-retour DNS.\n'
        '\n'
        '   Bodoni Moda et Archivo sont des polices variables : un seul fichier\n'
        '   couvre toutes les graisses, et Archivo couvre aussi toutes les chasses.\n'
        '   ========================================================================= */\n\n'
    )
    with io.open('assets/css/fonts.css', 'w', encoding='utf-8', newline='\n') as f:
        f.write(entete + '\n\n'.join(tout) + '\n')

    total = sum(os.path.getsize(os.path.join(DOSSIER, n))
                for n in os.listdir(DOSSIER) if n.endswith('.woff2'))
    print('fonts.css régénéré — %d déclarations, %d Ko de polices au total'
          % (len(tout), total // 1024))


if __name__ == '__main__':
    sys.exit(main())
