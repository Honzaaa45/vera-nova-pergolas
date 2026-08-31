/* =========================================================================
   Texte tournant.
   Portage natif de TextRotate. Le mot sortant part vers le haut lettre par
   lettre, le mot entrant monte depuis le bas, et la largeur du bloc suit le
   mouvement pour que la phrase ne saute jamais.
   Découpage par graphèmes : un émoji reste une seule lettre.
   ========================================================================= */
(function () {
  'use strict';

  var host = document.getElementById('rotate');
  if (!host) return;

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Formules volontairement courtes et de longueur voisine : la ligne fixe
     au-dessus fait environ 15 signes, tout ce qui dépasse doit être réduit
     et l'écart de taille se verrait.

     Les émojis ont été retirés. Ils fonctionnaient avec la grotesque
     géométrique d'origine ; sous une Didone, un pictogramme en couleur casse
     net le registre que toute la page cherche à tenir. */
  var TEXTES = [
    'toute l’année',
    'à l’ombre',
    'au sec',
    'même en août',
    'à l’abri du vent',
    'sans vis-à-vis',
    'prête à vivre',
    'éclairée le soir',
    'posée en deux jours',
    'ouverte sur le ciel'
  ];

  var INTERVAL = 2800;
  var STAGGER = 34;      // décalage entre lettres, en ms
  var DUREE = 520;

  var live = document.createElement('span');
  live.className = 'rot__live';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  var stage = document.createElement('span');
  stage.className = 'rot__stage';
  stage.setAttribute('aria-hidden', 'true');

  // copie invisible servant à mesurer la largeur du mot suivant
  var ghost = document.createElement('span');
  ghost.className = 'rot__ghost';
  ghost.setAttribute('aria-hidden', 'true');

  host.append(live, stage, ghost);

  function graphemes(txt) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      var seg = new Intl.Segmenter('fr', { granularity: 'grapheme' });
      return Array.from(seg.segment(txt), function (s) { return s.segment; });
    }
    return Array.from(txt);
  }

  function build(txt) {
    var frag = document.createDocumentFragment();
    // on garde les mots solidaires pour que la coupure de ligne reste propre
    txt.split(' ').forEach(function (mot, wi, arr) {
      var w = document.createElement('span');
      w.className = 'rot__w';
      graphemes(mot).forEach(function (g) {
        var c = document.createElement('span');
        c.className = 'rot__c';
        c.textContent = g;
        w.appendChild(c);
      });
      frag.appendChild(w);
      if (wi !== arr.length - 1) {
        var sp = document.createElement('span');
        sp.className = 'rot__sp';
        sp.textContent = ' ';
        frag.appendChild(sp);
      }
    });
    return frag;
  }

  var i = 0;
  var timer = null;
  var busy = false;

  /* Largeur réellement disponible. On mesure le conteneur du titre, pas le
     titre lui-même : celui-ci est un élément flex, sa largeur suit donc
     celle de ce bloc. Se mesurer sur lui créerait une boucle où plus le mot
     est large, plus la place semble grande, et le mot finirait sur l'image. */
  function dispo() {
    var titre = host.parentElement;
    var boite = titre ? titre.parentElement : null;
    var w = boite ? boite.clientWidth : 0;
    if (!w && titre) w = titre.clientWidth;
    return w;
  }

  /* Facteur de réduction calculé UNE fois sur la formule la plus large, puis
     appliqué à toutes. Un facteur par formule ferait sauter la taille du
     texte à chaque changement. */
  var k = 1;

  function calculerEchelle() {
    var maxi = 0;
    TEXTES.forEach(function (t) {
      ghost.textContent = '';
      ghost.appendChild(build(t));
      maxi = Math.max(maxi, ghost.getBoundingClientRect().width);
    });
    k = maxi > 0 ? Math.min(1, (dispo() * 0.99) / maxi) : 1;
    host.style.setProperty('--k', k.toFixed(4));
    return k;
  }

  /* La largeur suit la formule affichée, pour que le bloc respire, mais
     toujours à l'échelle commune. */
  function ajuster(largeurNaturelle) {
    host.style.setProperty('--w', (largeurNaturelle * k).toFixed(2) + 'px');
  }

  function paint(txt, animer) {
    live.textContent = txt;

    ghost.textContent = '';
    ghost.appendChild(build(txt));
    var largeur = ghost.getBoundingClientRect().width;

    var neuf = document.createElement('span');
    neuf.className = 'rot__set is-in';
    neuf.appendChild(build(txt));

    var lettres = neuf.querySelectorAll('.rot__c');
    var n = lettres.length;
    // départ par la dernière lettre, comme staggerFrom "last"
    lettres.forEach(function (c, k) {
      c.style.setProperty('--d', ((n - 1 - k) * STAGGER) + 'ms');
    });

    var vieux = stage.querySelector('.rot__set');

    if (!animer || REDUCED) {
      stage.textContent = '';
      stage.appendChild(neuf);
      neuf.classList.remove('is-in');
      ajuster(largeur);
      return;
    }

    busy = true;
    ajuster(largeur);

    if (vieux) {
      var sortantes = vieux.querySelectorAll('.rot__c');
      var m = sortantes.length;
      sortantes.forEach(function (c, k) {
        c.style.setProperty('--d', ((m - 1 - k) * STAGGER) + 'ms');
      });
      vieux.classList.add('is-out');
      setTimeout(function () { if (vieux.parentNode) vieux.remove(); }, DUREE + m * STAGGER + 60);
    }

    stage.appendChild(neuf);
    // Reflow forcé plutôt qu'un double requestAnimationFrame : rAF est gelé
    // dans un onglet en arrière-plan, et les lettres resteraient invisibles.
    void neuf.offsetWidth;
    neuf.classList.remove('is-in');
    setTimeout(function () { busy = false; }, DUREE + n * STAGGER);
  }

  function suivant() {
    if (busy) return;
    i = (i + 1) % TEXTES.length;
    paint(TEXTES[i], true);
  }

  calculerEchelle();
  paint(TEXTES[0], false);

  function demarrer() {
    if (timer || REDUCED) return;
    timer = setInterval(suivant, INTERVAL);
  }
  function arreter() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  // rien ne tourne quand le hero n'est pas à l'écran, ni quand l'onglet dort
  new IntersectionObserver(function (e) {
    if (e[0].isIntersecting) demarrer(); else arreter();
  }, { threshold: 0.15 }).observe(host);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) arreter(); else demarrer();
  });

  // Poignée de test : les navigateurs gèlent les minuteries des onglets
  // cachés, ce qui empêche de voir la rotation dans un panneau d'aperçu.
  // Appeler veraNovaRotate() dans la console force le passage suivant.
  window.veraNovaRotate = suivant;

  // remesure quand la place disponible change, ou quand les polices
  // arrivent après le premier rendu
  function remesurer() {
    calculerEchelle();
    ghost.textContent = '';
    ghost.appendChild(build(TEXTES[i]));
    ajuster(ghost.getBoundingClientRect().width);
  }

  var reflow;
  function planifier() {
    clearTimeout(reflow);
    reflow = setTimeout(remesurer, 120);
  }

  /* Un ResizeObserver sur le conteneur plutôt qu'un simple calcul au
     chargement : au premier rendu la mise en page n'est pas encore stabilisée
     et la mesure tombe à côté, ce qui laissait le mot rogné jusqu'au premier
     redimensionnement. Le conteneur est une cellule de grille, sa largeur ne
     dépend pas du bloc animé : pas de boucle. */
  var boite = host.parentElement && host.parentElement.parentElement;
  if (boite && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(planifier).observe(boite);
  } else {
    window.addEventListener('resize', planifier);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(planifier);
  }
})();
