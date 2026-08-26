/* =========================================================================
   Hero à bandeau défilant.
   Portage natif d'AnimatedMarqueeHero : pastille, titre révélé mot à mot,
   description, bouton d'action, et un ruban d'images qui défile en boucle
   au bas de la section.
   ========================================================================= */
(function () {
  'use strict';

  var hero = document.getElementById('top');
  if (!hero) return;

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ ruban
     La piste contient deux copies de la liste ; l'animation translate de
     -50 %, ce qui donne une boucle sans couture. */
  var track = document.getElementById('marquee-track');
  if (!track) return;

  var SOURCES = [
    ['canopy-acier',             'Pergola à structure acier sur terrasse'],
    ['terrasse-salon',           'Salon d\'extérieur sous pergola'],
    ['terrasse-piscine-moderne', 'Terrasse contemporaine avec piscine'],
    ['pergola-guirlandes',       'Pergola habillée de guirlandes lumineuses'],
    ['terrasse-couverte',        'Terrasse couverte avec canapé et table'],
    ['lounge-exterieur',         'Espace lounge extérieur avec bar'],
    ['piscine-transats',         'Transats au bord de la piscine'],
    ['maison-terrasse',          'Maison avec grande terrasse couverte'],
    ['terrasse-chauffage',       'Terrasse avec chauffage d\'extérieur'],
    ['mobilier-blanc-plantes',   'Mobilier blanc et végétation sur terrasse'],
    ['piscine-table',            'Table en bois au bord du bassin'],
    ['guirlandes-ville',         'Terrasse éclairée en soirée']
  ];

  function tile(src, alt, i) {
    var d = document.createElement('div');
    d.className = 'mq__item';
    // inclinaisons alternées, comme dans le composant d'origine
    d.style.setProperty('--rot', (i % 2 === 0 ? -2 : 5) + 'deg');
    var img = document.createElement('img');
    // le ruban affiche les vignettes à environ 200 px de large : la version
    // 520 px suffit, même sur écran à haute densité
    img.src = 'assets/img/gallery/' + src + '-sm.webp';
    img.alt = alt;
    img.loading = i < 4 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.width = 520; img.height = 693;
    d.appendChild(img);
    return d;
  }

  var lane = document.createElement('div');
  lane.className = 'mq__lane';
  SOURCES.forEach(function (s, i) { lane.appendChild(tile(s[0], s[1], i)); });

  var clone = lane.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  // le duplicata ne doit pas être annoncé deux fois
  clone.querySelectorAll('img').forEach(function (im) { im.alt = ''; });

  track.append(lane, clone);

  if (!REDUCED) track.classList.add('is-running');

  // Le ruban se met en pause hors écran : inutile d'animer ce qu'on ne voit pas.
  new IntersectionObserver(function (e) {
    track.classList.toggle('is-paused', !e[0].isIntersecting);
  }, { rootMargin: '100px' }).observe(track);

  hero.classList.add('is-ready');
})();
