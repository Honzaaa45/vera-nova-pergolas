# Images de référence

Ce dossier contient les pages du catalogue Royal Tente, redressées par
`tools/nettoyer-catalogue.py`. Il est exclu du dépôt : ces fichiers pèsent
lourd et n'ont pas à voyager avec le code.

Vera Nova est partenaire de Royal Tente sous contrat, l'usage des visuels du
catalogue est donc couvert. La question qui reste est celle de la **qualité**.

## Pourquoi ces fichiers ne peuvent pas aller sur le site tels quels

Ce sont des photographies d'un exemplaire imprimé posé sur un bureau. Le
recadrage ne corrige ni la trame d'impression, ni les reflets spéculaires, ni
la pliure centrale, ni la courbure du papier. Sur un écran, ça se voit
immédiatement — et un site de pergolas haut de gamme ne peut pas se permettre
des visuels qui ressemblent à des photocopies.

Le redressement automatique reste d'ailleurs imparfait : sur plusieurs pages
le clavier subsiste et l'orientation est fausse.

## Les trois voies vers de vrais visuels, par ordre de qualité

1. **Le media kit de Royal Tente.** Les fichiers d'origine, en haute
   définition. C'est une demande normale entre partenaires, et le résultat
   est sans comparaison.
2. **Le nettoyage par IA** des photographies existantes, avec le prompt de
   `docs/nettoyage-photos-ia.md`. Rattrape le cadrage et la lumière, mais pas
   la définition. Convient pour des visuels secondaires.
3. **La génération d'images originales** à partir des caractéristiques
   techniques, avec `docs/prompts-images-produits.md`.

## Attention aux chiffres

Une IA qui « nettoie » une image en réécrit souvent le texte. Les valeurs qui
font foi sont celles de `docs/catalogue-produits.md`, transcrites à la main
depuis les originaux. Ne recopiez jamais une mesure lue sur une image
retouchée.
