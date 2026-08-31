/* =========================================================================
   POINTS D'INTÉRÊT SUR L'IMAGE D'ACCUEIL

   Chaque produit visible sur le rendu porte une pastille cliquable qui
   ouvre sa fiche courte.

   Le point délicat : l'image est affichée en `object-fit: cover`, donc le
   cadrage réellement visible dépend du format de l'écran. Un point posé à
   « 37 % / 56 % » du conteneur ne tomberait au bon endroit que sur un écran
   au format exact de l'image. Les coordonnées sont donc exprimées dans
   l'espace de l'IMAGE, et projetées ici vers l'espace du conteneur.
   ========================================================================= */
(function () {
  'use strict';

  var media = document.getElementById('hero-media');
  var liste = document.getElementById('pins');
  if (!media || !liste) return;

  var img = media.querySelector('img');
  var points = Array.prototype.slice.call(liste.querySelectorAll('.pin'));
  if (!img || !points.length) return;

  var FINE = matchMedia('(pointer: fine)').matches;

  /* ------------------------------------------------------------ projection
     Reproduit le calcul de `object-fit: cover` : l'image est agrandie
     jusqu'à couvrir le conteneur, puis centrée, le débord étant rogné à
     parts égales de chaque côté. */
  function placer() {
    var cw = media.clientWidth;
    var ch = media.clientHeight;
    var iw = img.naturalWidth;
    var ih = img.naturalHeight;
    if (!cw || !ch || !iw || !ih) return;

    var echelle = Math.max(cw / iw, ch / ih);
    var affichee = { w: iw * echelle, h: ih * echelle };
    var decalage = { x: (cw - affichee.w) / 2, y: (ch - affichee.h) / 2 };

    points.forEach(function (p) {
      var px = parseFloat(p.dataset.x);   // % dans l'espace de l'image
      var py = parseFloat(p.dataset.y);
      var x = decalage.x + affichee.w * px / 100;
      var y = decalage.y + affichee.h * py / 100;

      p.style.left = x + 'px';
      p.style.top = y + 'px';

      // Un point rogné hors cadre ne doit pas rester cliquable dans le vide.
      var dedans = x >= 0 && x <= cw && y >= 0 && y <= ch;
      p.hidden = !dedans;
    });
  }

  /* ---------------------------------------------------------- ouverture */
  var ouvert = null;

  function fermer() {
    if (!ouvert) return;
    ouvert.classList.remove('is-open');
    ouvert.querySelector('.pin__btn').setAttribute('aria-expanded', 'false');
    ouvert = null;
  }

  function ouvrir(p) {
    if (ouvert === p) return fermer();
    fermer();
    p.classList.add('is-open');
    p.querySelector('.pin__btn').setAttribute('aria-expanded', 'true');
    ouvert = p;

    /* La bulle s'ouvre à droite par défaut ; près du bord droit elle
       partirait hors écran, on la bascule alors à gauche. */
    var bulle = p.querySelector('.pin__tip');
    bulle.classList.remove('is-left');
    var r = bulle.getBoundingClientRect();
    if (r.right > window.innerWidth - 16) bulle.classList.add('is-left');
  }

  points.forEach(function (p) {
    var btn = p.querySelector('.pin__btn');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      ouvrir(p);
    });

    /* Au clavier, la bulle doit suivre le focus. Mais un clic à la souris
       déclenche focus PUIS click : ouvrir sur focus revenait à ouvrir puis
       à refermer aussitôt, et rien ne se passait à l'écran.
       :focus-visible ne vaut que pour un focus au clavier, ce qui distingue
       exactement les deux cas. */
    btn.addEventListener('focus', function () {
      if (btn.matches(':focus-visible')) ouvrir(p);
    });

    if (FINE) {
      p.addEventListener('pointerenter', function () { ouvrir(p); });
      p.addEventListener('pointerleave', function () { fermer(); });
    }
  });

  document.addEventListener('click', fermer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fermer();
  });

  /* ------------------------------------------------------------ mesures
     La projection dépend des dimensions rendues : il faut la refaire à
     chaque changement de taille, et une fois l'image réellement décodée
     puisque naturalWidth vaut 0 avant. */
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(placer).observe(media);
  } else {
    window.addEventListener('resize', placer);
  }

  if (img.complete && img.naturalWidth) placer();
  else img.addEventListener('load', placer);

  window.addEventListener('load', placer);
})();
