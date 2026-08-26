Deux règles sont désactivées dans `.htmlvalidate.json`, volontairement :

- **`doctype-style`** exige `<!DOCTYPE html>` en majuscules. La spécification
  WHATWG écrit elle-même la déclaration en minuscules et les deux formes sont
  strictement équivalentes. Pure préférence, aucun effet sur le rendu.

- **`tel-non-breaking`** demande des espaces insécables à l'intérieur des
  numéros de téléphone, pour éviter qu'ils se coupent en fin de ligne. La
  recommandation est bonne, mais les numéros du dépôt sont des placeholders
  destinés à être remplacés : les truffer de `&nbsp;` rendrait cette
  substitution pénible et source d'erreurs. À réactiver le jour où les vrais
  numéros seront figés dans le code.

Toutes les autres règles de `html-validate:recommended` sont actives et la CI
échoue au moindre manquement.
