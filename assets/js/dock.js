/* =========================================================================
   Dock de navigation, intégré à la barre haute.

   L'effet de loupe du FloatingDock d'origine agrandissait les icônes au
   survol. Sur une barre haute, ce grossissement se lit comme un défaut et
   rend la sélection illisible. Il est remplacé par un indicateur qui glisse
   d'une icône à l'autre : rien ne change de taille, la barre est stable, et
   la section courante est toujours visible.
   ========================================================================= */
(function () {
  'use strict';

  var dock = document.getElementById('dock');
  if (!dock) return;

  var list   = dock.querySelector('.dock__list');
  var pill   = document.getElementById('dock-pill');
  var toggle = document.getElementById('dock-toggle');
  var items  = Array.prototype.slice.call(dock.querySelectorAll('.dock__item'));
  if (!items.length) return;

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isWide  = matchMedia('(min-width: 1101px)');

  /* -------------------------------------------------- indicateur glissant */

  var active = null;   // élément courant selon le défilement
  var hovered = null;  // élément survolé, prioritaire sur l'actif

  function movePill(to, instant) {
    if (!pill || !isWide.matches) return;
    if (!to) { pill.style.opacity = '0'; return; }

    var lb = list.getBoundingClientRect();
    var b = to.getBoundingClientRect();

    if (instant) pill.style.transition = 'none';
    pill.style.opacity = '1';
    pill.style.width = b.width + 'px';
    pill.style.height = b.height + 'px';
    pill.style.transform = 'translateX(' + (b.left - lb.left) + 'px)';
    if (instant) { void pill.offsetWidth; pill.style.transition = ''; }
  }

  function refresh(instant) {
    movePill(hovered || active, instant);
    items.forEach(function (a) {
      a.classList.toggle('is-hot', a === (hovered || active));
    });
  }

  items.forEach(function (a) {
    a.addEventListener('pointerenter', function () { hovered = a; refresh(false); });
    a.addEventListener('focus', function () { hovered = a; refresh(false); });
  });
  list.addEventListener('pointerleave', function () { hovered = null; refresh(false); });
  list.addEventListener('focusout', function () { hovered = null; refresh(false); });

  /* ------------------------------------------------ section courante
     La section active est celle qui contient le tiers haut de la fenêtre.
     Comparer des taux d'intersection ne marche pas ici : la section
     Produits fait plus de trois écrans de haut, son taux plafonne à 0,3
     alors qu'une section courte atteint 1, et elle ne gagne jamais. */

  var linked = items
    .map(function (a) {
      var h = a.getAttribute('href');
      return h && h.charAt(0) === '#' ? { a: a, el: document.querySelector(h) } : null;
    })
    .filter(function (x) { return x && x.el; });

  function pickActive() {
    var line = window.scrollY + window.innerHeight * 0.34;
    var found = null;

    for (var i = 0; i < linked.length; i++) {
      var el = linked[i].el;
      var top = el.getBoundingClientRect().top + window.scrollY;
      if (top <= line) found = linked[i];
    }
    // tout en bas de page, la dernière ancre l'emporte
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      found = linked[linked.length - 1];
    }

    var next = found ? found.a : null;
    if (next === active) return;

    active = next;
    items.forEach(function (a) {
      var on = a === active;
      a.classList.toggle('is-on', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    refresh(false);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; pickActive(); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { pickActive(); refresh(true); });
  isWide.addEventListener('change', function () { refresh(true); });

  // première pose sans animation, une fois les polices chargées
  pickActive();
  refresh(true);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { refresh(true); });
  }

  /* --------------------------------------------------------- repli mobile */

  if (toggle) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      dock.classList.toggle('is-open', open);
      document.body.classList.toggle('no-scroll', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    list.addEventListener('click', function (e) {
      if (e.target.closest('.dock__item')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false); toggle.focus();
      }
    });
    isWide.addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  if (REDUCED && pill) pill.style.transition = 'none';
})();
