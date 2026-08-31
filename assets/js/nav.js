/* =========================================================================
   BARRE HAUTE, MENU ET ÉCRAN D'OUVERTURE
   ========================================================================= */
(function () {
  'use strict';

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------- écran d'ouverture
     Il se retire dès que les polices sont prêtes. Le contenu de la page se
     trouve déjà en dessous, entièrement rendu : si ce script ne s'exécute
     jamais, un simple délai CSS le fera disparaître de toute façon. */
  (function () {
    var intro = document.getElementById('intro');
    if (!intro) return;

    var partir = function () {
      intro.classList.add('is-parti');
      // on le retire du flux une fois l'animation terminée
      setTimeout(function () { intro.remove(); }, 1200);
      document.documentElement.classList.add('intro-finie');
    };

    if (REDUCED) return partir();

    var pret = document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();

    // Deux secondes au maximum : une police qui tarde ne doit pas retenir
    // le visiteur devant un écran vide.
    Promise.race([pret, new Promise(function (r) { setTimeout(r, 2000); })])
      .then(function () { setTimeout(partir, 700); });
  })();

  /* --------------------------------------------------------- barre haute
     Elle flotte sur l'image en haut de page, puis prend un fond opaque.
     Un seuil unique, pour éviter le clignotement quand on oscille autour. */
  (function () {
    var bar = document.getElementById('bar');
    if (!bar) return;
    var pose = false;

    var maj = function () {
      var y = window.scrollY;
      if (!pose && y > 80) { pose = true; bar.classList.add('is-pose'); }
      else if (pose && y < 40) { pose = false; bar.classList.remove('is-pose'); }
    };

    var attente = false;
    window.addEventListener('scroll', function () {
      if (attente) return;
      attente = true;
      requestAnimationFrame(function () { attente = false; maj(); });
    }, { passive: true });
    maj();
  })();

  /* ------------------------------------------------- ambiance jour / soir
     Deux images superposées dans le bandeau ; les boutons font passer la
     classe est-active de l'une à l'autre, le fondu est en CSS. */
  (function () {
    var groupe = document.querySelector('.ambiance');
    var images = document.querySelectorAll('.hero__img');
    var hero = document.querySelector('.hero');
    if (!groupe || images.length < 2 || !hero) return;

    // On arme le fondu seulement une fois la page peinte : sinon la
    // transition se joue au chargement et l'image met une seconde à
    // apparaitre sur un aplat bleu nuit.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('est-prete'); });
    });

    groupe.addEventListener('click', function (e) {
      var b = e.target.closest('.ambiance__b');
      if (!b || b.classList.contains('est-active')) return;
      var vers = b.dataset.vers;

      groupe.querySelectorAll('.ambiance__b').forEach(function (x) {
        var on = x === b;
        x.classList.toggle('est-active', on);
        x.setAttribute('aria-pressed', String(on));
      });

      images.forEach(function (img) {
        img.classList.toggle('est-active', img.dataset.ambiance === vers);
      });
    });
  })();

  /* --------------------------------------------------------------- menu */
  (function () {
    var btn = document.getElementById('burger');
    var menu = document.getElementById('menu');
    if (!btn || !menu) return;

    var ouvrir = function (on) {
      btn.setAttribute('aria-expanded', String(on));
      menu.hidden = !on;
      document.documentElement.classList.toggle('menu-ouvert', on);
      btn.querySelector('.sr-only').textContent = on ? 'Fermer le menu' : 'Ouvrir le menu';
    };

    btn.addEventListener('click', function () {
      ouvrir(btn.getAttribute('aria-expanded') !== 'true');
    });

    // un lien cliqué referme, sinon le menu masque la section visée
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) ouvrir(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        ouvrir(false);
        btn.focus();
      }
    });
  })();
})();
