/* Interactions premium légères : progression, profondeur et retour visuel. */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var topbar = document.getElementById('topbar');
  var ticking = false;

  function paintScroll() {
    ticking = false;
    var max = root.scrollHeight - innerHeight;
    root.style.setProperty('--scroll-progress', max > 0 ? (scrollY / max) : 0);
    if (topbar) topbar.classList.toggle('is-scrolled', scrollY > 24);
  }

  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paintScroll);
  }, { passive: true });
  paintScroll();

  if (reduced || !matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('[data-depth-card]').forEach(function (card) {
    card.addEventListener('pointermove', function (event) {
      var box = card.getBoundingClientRect();
      var x = (event.clientX - box.left) / box.width - .5;
      var y = (event.clientY - box.top) / box.height - .5;
      card.style.setProperty('--rx', (-y * 3.5).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (x * 4.5).toFixed(2) + 'deg');
      card.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();
