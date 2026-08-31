# -*- coding: utf-8 -*-
"""
Redressement des photographies du catalogue.

Les pages ont été photographiées au téléphone, posées sur un bureau : la page
est vue de biais, entourée de bois, d'un clavier et parfois d'une main. Ce
script isole la page, corrige la perspective et remet le contenu à
l'horizontale.

Il ne corrige PAS la trame d'impression, les reflets spéculaires ni la pliure
centrale : ce sont des propriétés du support photographié, pas du cadrage.

Usage :
    python tools/nettoyer-catalogue.py "Photo donner" docs/media/reference/pages
"""

import sys
import os
import glob
import cv2
import numpy as np

# La console Windows est en cp1252 par defaut et refuse les fleches ou les
# accents ; on force l'UTF-8 plutot que d'appauvrir les messages.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def masque_papier(img):
    """Isole le papier du reste de la scène.

    Le premier essai seuillait la luminosité : il échouait, parce que le
    bureau en bois clair est presque aussi lumineux que la page. La
    saturation sépare bien mieux — le papier est quasi neutre, le bois
    franchement orangé et le tapis de souris coloré. On combine donc
    « peu saturé » ET « suffisamment clair ».
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    sat, val = hsv[:, :, 1], hsv[:, :, 2]

    seuil_val = max(90, int(np.percentile(val, 55)))
    masque = ((sat < 70) & (val > seuil_val)).astype(np.uint8) * 255

    # On bouche les photos sombres imprimées au milieu de la page, sinon
    # la page ressort en plusieurs morceaux disjoints.
    noyau = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))
    masque = cv2.morphologyEx(masque, cv2.MORPH_CLOSE, noyau, iterations=4)
    masque = cv2.morphologyEx(masque, cv2.MORPH_OPEN,
                              cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    return masque


def trouver_page(img):
    """Renvoie les 4 coins de la page, ou None si la détection échoue."""
    h, w = img.shape[:2]
    ech = 700.0 / max(h, w)
    petit = cv2.resize(img, None, fx=ech, fy=ech, interpolation=cv2.INTER_AREA)

    masque = masque_papier(petit)
    contours, _ = cv2.findContours(masque, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    plus_grand = max(contours, key=cv2.contourArea)
    aire = cv2.contourArea(plus_grand)
    if aire < 0.20 * petit.shape[0] * petit.shape[1]:
        return None

    # Le rectangle orienté minimal est plus robuste ici que
    # approxPolyDP : la page est courbée, son contour n'est jamais un
    # quadrilatère net, et l'approximation partait régulièrement en biais.
    rect = cv2.minAreaRect(plus_grand)
    coins = cv2.boxPoints(rect).astype(np.float32)

    # On rogne légèrement vers l'intérieur pour retirer le liseré de bureau
    # que le masque laisse presque toujours dépasser.
    centre = coins.mean(axis=0)
    coins = centre + (coins - centre) * 0.985
    return coins / ech


def ordonner(pts):
    """Range les coins : haut-gauche, haut-droit, bas-droit, bas-gauche."""
    pts = np.array(pts, dtype=np.float32)
    somme = pts.sum(axis=1)
    diff = np.diff(pts, axis=1).ravel()
    return np.array([
        pts[np.argmin(somme)],   # haut-gauche : x+y minimal
        pts[np.argmin(diff)],    # haut-droit  : x-y maximal
        pts[np.argmax(somme)],   # bas-droit
        pts[np.argmax(diff)],    # bas-gauche
    ], dtype=np.float32)


def redresser(img, coins):
    """Applique la correction de perspective sur le quadrilatère donné."""
    hg, hd, bd, bg = ordonner(coins)
    largeur = int(max(np.linalg.norm(hd - hg), np.linalg.norm(bd - bg)))
    hauteur = int(max(np.linalg.norm(bg - hg), np.linalg.norm(bd - hd)))
    if largeur < 50 or hauteur < 50:
        return None

    cible = np.array([[0, 0], [largeur - 1, 0],
                      [largeur - 1, hauteur - 1], [0, hauteur - 1]], dtype=np.float32)
    M = cv2.getPerspectiveTransform(ordonner(coins), cible)
    return cv2.warpPerspective(img, M, (largeur, hauteur), flags=cv2.INTER_CUBIC)


def texte_horizontal(img):
    """Le texte est-il déjà à l'horizontale ?

    Les lignes de texte créent une alternance claire/sombre le long de l'axe
    qui leur est perpendiculaire. On compare donc la variance des moyennes de
    lignes à celle des moyennes de colonnes : la plus forte désigne l'axe
    perpendiculaire au texte.
    """
    gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gris = cv2.resize(gris, (600, 600), interpolation=cv2.INTER_AREA)
    # on accentue le texte avant de mesurer
    bords = cv2.Sobel(gris, cv2.CV_32F, 0, 1, ksize=3)
    var_lignes = np.var(np.abs(bords).mean(axis=1))
    bords = cv2.Sobel(gris, cv2.CV_32F, 1, 0, ksize=3)
    var_colonnes = np.var(np.abs(bords).mean(axis=0))
    return var_lignes >= var_colonnes


def traiter(chemin, dossier_sortie):
    img = cv2.imread(chemin)
    if img is None:
        return chemin, 'illisible'

    coins = trouver_page(img)
    if coins is None:
        plat, note = img, 'page non détectée, image entière conservée'
    else:
        plat = redresser(img, coins)
        if plat is None:
            plat, note = img, 'redressement impossible, image entière conservée'
        else:
            note = 'page détectée et redressée'

    # Les planches du catalogue sont des doubles pages, donc en paysage.
    h, w = plat.shape[:2]
    if h > w:
        sens = cv2.ROTATE_90_COUNTERCLOCKWISE if texte_horizontal(plat) is False else cv2.ROTATE_90_CLOCKWISE
        plat = cv2.rotate(plat, sens)
        note += ' + pivot 90°'

    nom = os.path.splitext(os.path.basename(chemin))[0] + '.jpg'
    cv2.imwrite(os.path.join(dossier_sortie, nom), plat,
                [cv2.IMWRITE_JPEG_QUALITY, 93])
    return nom, f'{note} → {plat.shape[1]}x{plat.shape[0]}'


def main():
    entree = sys.argv[1] if len(sys.argv) > 1 else 'Photo donner'
    sortie = sys.argv[2] if len(sys.argv) > 2 else 'docs/media/reference/pages'
    os.makedirs(sortie, exist_ok=True)

    fichiers = sorted(glob.glob(os.path.join(entree, '*.jpeg')),
                      key=lambda p: (len(p), p))
    if not fichiers:
        print('Aucune image trouvée dans', entree)
        return 1

    for f in fichiers:
        nom, note = traiter(f, sortie)
        print(f'  {nom:<16} {note}')
    print(f'\n{len(fichiers)} images traitées vers {sortie}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
