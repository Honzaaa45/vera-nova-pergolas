# Variante Vera Nova inspirée d'Era Residence

Cette variante est autonome et ne dépend d'aucun fichier situé au-dessus de ce
dossier. Elle reprend les contenus Vera Nova disponibles au moment de sa
création dans une nouvelle expérience en trois niveaux :

- `index.html` : page d'accueil narrative ;
- `catalogue/index.html` : catalogue filtrable des douze systèmes ;
- `catalogue/produit.html?ref=platin` : modèle de fiche dynamique, disponible
  pour les douze identifiants déclarés dans `assets/js/catalogue-data.js`.

Le site reste en HTML, CSS et JavaScript natifs. Les polices et les images sont
hébergées localement. Aucun cookie et aucun outil de suivi ne sont utilisés.

## Aperçu local

Depuis ce dossier :

```powershell
python -m http.server 5180 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:5180/`.

## Contenu à confirmer

Les coordonnées, garanties, délais, tarifs et champs juridiques provisoires
conservent le même statut que dans le projet principal. Le formulaire utilise
encore `contact@veranova.fr` comme adresse d'exemple.
