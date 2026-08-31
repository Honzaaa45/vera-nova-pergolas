# Images de référence — ne pas publier

Ce dossier contient les pages du catalogue du fabricant, redressées par
`tools/nettoyer-catalogue.py`.

**Elles servent uniquement de référence de travail.** Aucune ne doit se
retrouver sur le site :

- ce sont des photographies d'un catalogue imprimé, avec trame d'impression,
  reflets spéculaires, pliure centrale et courbure du papier — le recadrage ne
  corrige rien de tout cela ;
- le contenu appartient au fabricant turc, pas à Vera Nova.

Le redressement automatique reste imparfait : sur plusieurs pages le clavier
reste dans le cadre et l'orientation est fausse. C'est assumé — ces fichiers
n'ont besoin d'être que lisibles.

Pour obtenir de vrais visuels, deux chemins, dans cet ordre :

1. **Demander le media kit du fabricant.** C'est la solution propre : fichiers
   haute définition et droits d'usage. Tout distributeur légitime y a accès.
2. **Générer des visuels originaux** à partir des caractéristiques techniques,
   avec les prompts de `docs/prompts-images-produits.md`.

Le contenu exploitable de ces pages est déjà extrait dans
`docs/catalogue-produits.md`. Les photos n'ont plus à être consultées.
