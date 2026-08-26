/* =========================================================================
   Animations au défilement.
   Un seul observateur pour toute la page, piloté par des attributs :
     data-reveal        révèle l'élément quand il entre dans le cadre
     data-reveal="left" révèle depuis la gauche (ou "right", "zoom", "blur")
     data-stagger       révèle les enfants en cascade
     data-delay="120"   décalage en millisecondes
     data-count="9000"  compte jusqu'à la valeur
     data-parallax="18" translation verticale douce au défilement
   ========================================================================= */
(function () {
  'use strict';

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* --------------------------------------------------------- révélations */

  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal],[data-stagger]'));

  if (REDUCED) {
    targets.forEach(function (el) {
      el.classList.add('is-revealed');
      el.querySelectorAll(':scope > *').forEach(function (c) { c.classList.add('is-revealed'); });
    });
  } else {
    root.classList.add('has-reveal');

    targets.forEach(function (el) {
      if (!el.hasAttribute('data-stagger')) return;
      var step = Number(el.dataset.stagger) || 70;
      Array.prototype.forEach.call(el.children, function (c, i) {
        c.classList.add('rv-child');
        c.style.setProperty('--rd', (i * step) + 'ms');
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var delay = Number(el.dataset.delay) || 0;
        if (delay) el.style.setProperty('--rd', delay + 'ms');
        el.classList.add('is-revealed');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------ compteurs */

  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length) {
    var fmt = new Intl.NumberFormat('fr-FR');

    var run = function (el) {
      var to = Number(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      if (REDUCED) { el.textContent = fmt.format(to) + suffix; return; }

      var dur = 1200, t0 = null;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        // easeOutExpo, l'arrivée est franche
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = fmt.format(Math.round(to * e)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ------------------------------------------------------------ parallaxe */

  var para = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (para.length && !REDUCED) {
    var live = [];
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = live.indexOf(e.target);
        if (e.isIntersecting && i < 0) live.push(e.target);
        else if (!e.isIntersecting && i >= 0) live.splice(i, 1);
      });
      if (live.length) wake();
    }, { rootMargin: '20% 0px' });
    para.forEach(function (el) { pio.observe(el); });

    var ticking = false;
    function paint() {
      ticking = false;
      var vh = window.innerHeight;
      live.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var amp = Number(el.dataset.parallax) || 16;
        // -1 en bas de l'écran, +1 en haut
        var p = 1 - (r.top + r.height / 2) / (vh / 2 + r.height / 2);
        el.style.setProperty('--py', (p * amp).toFixed(1) + 'px');
      });
    }
    function wake() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    }
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    wake();
  }
})();
