# Nettoyer les photos du catalogue avec une IA

Les pages du catalogue ont été photographiées au téléphone, posées sur un
bureau. Une IA d'édition d'image sait retirer le décor, redresser la page et
la recadrer — ce que le traitement automatique de `tools/nettoyer-catalogue.py`
ne réussit qu'à moitié.

**Outil conseillé :** Gemini, gratuit et particulièrement bon pour modifier une
image existante sans la redessiner entièrement. ChatGPT fonctionne aussi.
Joignez **une seule photo à la fois**.

---

## Le prompt

```
Nettoie cette photo d'une page de catalogue imprimée.

Ce que tu modifies :
- Supprime tout ce qui entoure la page : le bureau, le clavier, la main,
  les câbles, l'arrière-plan.
- Redresse la page pour qu'elle soit parfaitement rectangulaire, vue de face.
- Recadre pour que la page remplisse tout le cadre, sans marge autour.
- Atténue les reflets et l'ombre portée sur le papier.

Ce que tu conserves à l'identique, lettre pour lettre et trait pour trait :
- tout le texte, tous les chiffres, toutes les mesures ;
- les photos et les schémas imprimés sur la page ;
- les proportions et les couleurs du contenu.

En résumé : tu ne changes que le cadrage et l'éclairage.
Le contenu imprimé de la page reste rigoureusement le même.

Rends l'image en haute résolution.
```

> **Sur la formulation.** Une première version de ce prompt disait « à ne pas
> faire : ne modifie aucun texte ». La double négation se lisait à l'envers et
> pouvait faire croire qu'il fallait effacer le texte. D'où la structure
> ci-dessus : deux listes affirmatives, ce que l'IA change et ce qu'elle garde.

---

## Le piège des chiffres

Les modèles d'image **réécrivent le texte** au lieu de le recopier. Une page
portant `4500 MM` peut ressortir avec `4800 MM`, sans le moindre signe visible
que quelque chose a bougé.

**Les valeurs qui font foi sont celles de `docs/catalogue-produits.md`**,
transcrites à la main depuis les photos d'origine. Ne recopiez jamais une
mesure lue sur une image retouchée par une IA.

---

## Quelles pages valent le nettoyage

Le rapport bénéfice/risque dépend de la proportion d'image et de texte.

| Photo | Contenu | À nettoyer |
|---|---|---|
| `image14` | vue d'ensemble de la maison, dix produits légendés | ✅ la plus utile |
| `image2` | rendus Platin, ambiance de nuit | ✅ |
| `image5` | rendus Compact | ✅ |
| `image1` | Zip Screen et chantiers France | ✅ |
| `image13` | rendus RCS 1400 / 1600 | ✅ |
| `image8` | nuancier RAL et toiles | ⚠️ les codes seront corrompus |
| `image3`, `10`, `11`, `12` | pages techniques très denses | ❌ inutile, déjà transcrites |

Les pages techniques n'ont plus d'intérêt : tout leur contenu est dans
`catalogue-produits.md`, et le site n'affichera jamais une page de catalogue.

---

## Après le nettoyage

Ces images restent des **photographies de papier imprimé**. Même parfaitement
recadrées, la trame d'impression et la définition limitée se verront sur un
écran. Elles conviennent pour des visuels secondaires ou pour caler une
maquette, pas pour le bandeau d'accueil.

Pour des visuels de premier plan, deux options meilleures :

1. **Le media kit de Royal Tente** — les fichiers d'origine. Vera Nova étant
   partenaire sous contrat, c'est une demande ordinaire entre partenaires.
2. **Des images générées** à partir des caractéristiques techniques, avec
   `docs/prompts-images-produits.md`.
