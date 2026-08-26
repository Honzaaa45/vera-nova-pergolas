/* =========================================================================
   VERA NOVA - couche d'interactions
   Défilement fluide, révélations typographiques, magnétisme, inclinaison
   des cartes, parallaxe multi-couches, en-tête réactif.

   Bibliothèques : Lenis 1.1 (défilement) et GSAP 3.12 + ScrollTrigger.
   Chargées en CDN, sans build.

   Deux règles tenues partout dans ce fichier :
     - rien ne se déclenche si l'utilisateur a réduit les animations ;
     - tout ce qui dépend de la souris est coupé sur écran tactile.
   ========================================================================= */
(function () {
  'use strict';

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE    = matchMedia('(pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST   = hasGsap && typeof window.ScrollTrigger !== 'undefined';

  if (hasST) gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('has-motion');

  /* ===================================================================
     1. DÉFILEMENT FLUIDE
     Lenis pilote la molette, GSAP fournit l'horloge. Sans cette
     synchronisation, ScrollTrigger calcule ses positions sur une valeur
     de défilement en retard d'une image et les déclenchements sautent.
     =================================================================== */

  var lenis = null;

  /* Le navigateur restaure la position de défilement au rechargement, mais
     Lenis, lui, repart de zéro. Les deux valeurs divergent alors et
     ScrollTrigger calcule ses déclenchements sur une page fantôme : on a vu
     des positions de départ négatives et un parallaxe figé. On reprend donc
     la main sur la restauration et on remonte en haut avant l'initialisation. */
  if (!REDUCED && typeof window.Lenis !== 'undefined' && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    // sauf si l'adresse vise déjà une ancre : remonter écraserait le lien
    // d'arrivée d'un partage du type .../#contact
    if (!location.hash) window.scrollTo(0, 0);
  }

  if (!REDUCED && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.05,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      // jamais au doigt : le défilement natif d'un téléphone est meilleur
      // que toute interpolation, et l'inertie du système est attendue
      syncTouch: false
    });

    if (hasGsap) {
      lenis.on('scroll', function () { if (hasST) ScrollTrigger.update(); });
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }

    // les ancres du dock doivent passer par Lenis, sinon le saut est brutal
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var cible = document.querySelector(id);
      if (!cible) return;
      e.preventDefault();
      var haut = parseFloat(getComputedStyle(document.documentElement)
                  .getPropertyValue('--top-h')) || 74;
      lenis.scrollTo(cible, { offset: -haut - 12, duration: 1.1 });
    });
  }

  /* ===================================================================
     2. RÉVÉLATION TYPOGRAPHIQUE
     Chaque mot est glissé sous un masque puis remonte, en cascade.
     Le découpage se fait par mot et non par lettre : sur un titre
     français, la césure lettre par lettre casse la lecture et fait
     exploser le nombre de noeuds à animer.
     =================================================================== */

  function decouper(el) {
    if (el.dataset.splitDone) return [];
    var mots = [];

    // on ne traverse que les noeuds de texte : le balisage interne
    // (<em>, <span>) est conservé tel quel
    var arbre = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var textes = [], n;
    while ((n = arbre.nextNode())) if (n.textContent.trim()) textes.push(n);

    textes.forEach(function (noeud) {
      var frag = document.createDocumentFragment();
      noeud.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
        var masque = document.createElement('span');
        masque.className = 'sp';
        var inner = document.createElement('span');
        inner.className = 'sp__i';
        inner.textContent = part;
        masque.appendChild(inner);
        frag.appendChild(masque);
        mots.push(inner);
      });
      noeud.parentNode.replaceChild(frag, noeud);
    });

    el.dataset.splitDone = '1';
    return mots;
  }

  var titres = Array.prototype.slice.call(document.querySelectorAll('[data-split]'));

  if (REDUCED || !hasST) {
    titres.forEach(function (el) { el.classList.add('is-shown'); });
  } else {
    titres.forEach(function (el) {
      var mots = decouper(el);
      if (!mots.length) { el.classList.add('is-shown'); return; }
      el.classList.add('is-shown');

      gsap.set(mots, { yPercent: 115 });
      gsap.to(mots, {
        yPercent: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.055,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ===================================================================
     3. BOUTONS MAGNÉTIQUES
     Le bouton se déplace vers le curseur au lieu de remplacer le curseur.
     Même sensation, sans priver l'utilisateur de son pointeur système.
     =================================================================== */

  if (FINE && !REDUCED) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var force = parseFloat(el.dataset.magnetic) || 0.32;
      var rayon = 90;   // marge autour du bouton où l'attraction opère
      var rect = null;
      var brut = el.querySelector('.mag__in') || el;

      var mesurer = function () { rect = el.getBoundingClientRect(); };

      el.addEventListener('pointerenter', mesurer);

      el.addEventListener('pointermove', function (e) {
        if (!rect) mesurer();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) * force;
        var dy = (e.clientY - cy) * force;
        if (hasGsap) gsap.to(brut, { x: dx, y: dy, duration: 0.45, ease: 'power3.out' });
        else brut.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });

      el.addEventListener('pointerleave', function () {
        rect = null;
        if (hasGsap) gsap.to(brut, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        else brut.style.transform = '';
      });

      // la zone sensible dépasse le bouton pour que l'attraction s'amorce avant
      el.style.setProperty('--mag-r', rayon + 'px');
    });
  }

  /* ===================================================================
     4. CARTES : INCLINAISON ET REFLET
     L'inclinaison reste faible (6 degrés). Au-delà, le texte des cartes
     devient pénible à lire et l'effet passe pour un gadget.
     =================================================================== */

  if (FINE && !REDUCED) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 6;
      var rect = null;

      el.addEventListener('pointerenter', function () {
        rect = el.getBoundingClientRect();
        el.classList.add('is-tilting');
      });

      el.addEventListener('pointermove', function (e) {
        if (!rect) rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;

        // le reflet suit le curseur, en pourcentage de la carte
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');

        var ry = (px - 0.5) * 2 * max;
        var rx = (0.5 - py) * 2 * max;
        if (hasGsap) {
          gsap.to(el, { rotateX: rx, rotateY: ry, duration: 0.5, ease: 'power2.out', transformPerspective: 900 });
        } else {
          el.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        }
      });

      el.addEventListener('pointerleave', function () {
        rect = null;
        el.classList.remove('is-tilting');
        if (hasGsap) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
        else el.style.transform = '';
      });
    });
  }

  /* ===================================================================
     5. PARALLAXE MULTI-COUCHES

     data-depth donne l'amplitude en centièmes de pixel de course :
     0.18 vaut un déplacement de 18 px de part et d'autre. Une valeur
     négative fait reculer la couche au lieu de l'avancer.

     On n'écrit PAS de transform ici, mais la variable --dy, que le CSS
     compose ensuite avec la transformation propre de chaque couche.
     Ces couches portent déjà un translateZ et parfois une rotation :
     leur poser un transform GSAP effacerait leur profondeur et leur
     inclinaison. La variable, elle, s'ajoute sans rien détruire.
     =================================================================== */

  if (hasST && !REDUCED) {
    document.querySelectorAll('[data-depth]').forEach(function (el) {
      var amp = (parseFloat(el.dataset.depth) || 0.15) * 100;
      gsap.fromTo(el,
        { '--dy': amp.toFixed(1) + 'px' },
        {
          '--dy': (-amp).toFixed(1) + 'px',
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6
          }
        }
      );
    });
  }

  /* ===================================================================
     6. EN-TÊTE RÉACTIF
     La barre se resserre et son verre s'épaissit dès les premiers pixels.
     Un seuil unique évite le clignotement quand on oscille autour.
     =================================================================== */

  (function () {
    var bar = document.getElementById('topbar');
    if (!bar) return;
    var reduit = false;

    var maj = function () {
      var y = window.scrollY;
      if (!reduit && y > 60) { reduit = true; bar.classList.add('is-shrunk'); }
      else if (reduit && y < 30) { reduit = false; bar.classList.remove('is-shrunk'); }
    };

    var attente = false;
    window.addEventListener('scroll', function () {
      if (attente) return;
      attente = true;
      requestAnimationFrame(function () { attente = false; maj(); });
    }, { passive: true });
    maj();
  })();

  /* ===================================================================
     7. IMAGES : APPARITION SOUS MASQUE
     Le cadre s'ouvre par le bas pendant que l'image relâche son échelle.
     =================================================================== */

  if (hasST && !REDUCED) {
    document.querySelectorAll('[data-mask]').forEach(function (el) {
      var img = el.querySelector('img') || el;
      gsap.fromTo(el,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.15,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      );
      // Une image deja pilotee par la parallaxe a sa propre transformation :
      // lui appliquer une echelle ici ecraserait le decalage vertical.
      if (img !== el && !img.hasAttribute('data-parallax')) {
        gsap.fromTo(img,
          { scale: 1.18 },
          {
            scale: 1,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        );
      }
    });
  }

  /* ===================================================================
     8. RECALCUL
     Les polices et les images changent la hauteur du document après coup :
     sans ce rafraîchissement, les déclencheurs restent calés sur une mise
     en page périmée.
     =================================================================== */

  if (hasST) {
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }

    /* Filet de sécurité.
       Les révélations partent d'un état masqué (mot descendu, image
       entièrement rognée). Si un déclencheur ne se joue jamais, à cause
       d'un recalcul raté ou d'un onglet resté en arrière-plan, le contenu
       resterait invisible en permanence. Passé un délai, tout élément déjà
       dépassé par le défilement est forcé à son état final. */
    window.addEventListener('load', function () {
      setTimeout(function () {
        ScrollTrigger.refresh();
        ScrollTrigger.getAll().forEach(function (st) {
          if (!st.animation) return;
          // Uniquement les révélations. Une couche de parallaxe est liée au
          // défilement en continu : la pousser à sa fin la ferait sauter.
          if (st.vars && st.vars.scrub) return;
          if (st.progress === 0 && st.animation.progress() === 0 && st.scroll() > st.start) {
            st.animation.progress(1);
          }
        });
      }, 2500);
    });

    // même filet quand on revient sur un onglet laissé de côté
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) ScrollTrigger.refresh();
    });
  }
})();
