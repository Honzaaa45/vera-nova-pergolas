/* =========================================================================
   Section Produits.
   Panneau blanc fixe à gauche, image au centre, panneau sombre à droite.
   Le nom du produit ne s'affiche pas d'un bloc : il se dévoile lettre par
   lettre au fil du défilement, la barre de progression suit le geste.
   Le bouton bascule la mise en page : le panneau blanc se referme, l'image
   glisse, le panneau sombre s'étend et prend toute la partie droite.

   La bascule s'appuie sur une transition de grid-template-columns, qui est
   l'équivalent natif de la prop `layout` de Framer Motion.
   ========================================================================= */
(function () {
  'use strict';

  var root = document.getElementById('produits');
  if (!root) return;

  var pin    = document.getElementById('prod-pin');
  var track  = document.getElementById('prod-track');
  var stage  = document.getElementById('prod-stage');
  var btn    = document.getElementById('prod-btn');
  var detail = document.getElementById('prod-detail');
  var idx    = document.getElementById('prod-idx');

  var nameEl   = document.getElementById('prod-name');
  var serieEl  = document.getElementById('prod-serie');
  var teaserEl = document.getElementById('prod-teaser');
  var meterEl  = document.getElementById('prod-meter');
  var noEl     = document.getElementById('prod-no');

  var dTitle = document.getElementById('prod-dtitle');
  var dText  = document.getElementById('prod-dtext');
  var dList  = document.getElementById('prod-dlist');
  var dImg   = document.getElementById('prod-dimg');
  var dCap   = document.getElementById('prod-dcap');

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------- catalogue
     Noms commerciaux et visuels à remplacer par les vôtres. Voir README. */
  var PRODUITS = [
    {
      nom: 'Pergola bioclimatique',
      serie: 'Série Platin',
      img: 'canopy-acier',
      alt: 'Pergola bioclimatique à lames orientables sur une terrasse',
      teaser: "Des lames en aluminium qui pivotent de 0 à 90 degrés. Vous réglez l'ombre, la lumière et la pluie depuis une télécommande.",
      detail: "Structure aluminium thermolaqué, lames orientables motorisées et chéneaux périphériques avec descente d'eau intégrée dans les poteaux. Adossée à la façade ou autoportée, jusqu'à 4 mètres de portée sans poteau intermédiaire.",
      points: [
        ['Lames orientables', 'De 0 à 90 degrés, moteur silencieux sur télécommande'],
        ['Évacuation cachée', 'Chéneaux périphériques, descente dans les poteaux'],
        ['Capteurs pluie et vent', 'Fermeture ou ouverture automatique des lames'],
        ['Éclairage LED', 'Rubans intégrés aux traverses, sur variateur']
      ]
    },
    {
      nom: 'Pergola occultante',
      serie: 'Série Eco Class 1400',
      img: 'terrasse-couverte',
      alt: "Terrasse couverte par une pergola à toile, avec salon d'extérieur",
      teaser: "Une toile tendue qui se replie en accordéon. La silhouette la plus fine, et la pose la plus directe sur une terrasse déjà aménagée.",
      detail: "Toile technique tendue sur une ossature aluminium, repliable en accordéon. Une silhouette plus fine que la lame orientable, et la solution la plus directe quand la terrasse est déjà aménagée.",
      points: [
        ['Toile rétractable', 'Repliage en accordéon, commande motorisée'],
        ['Pose sur existant', "S'ancre sur une terrasse déjà carrelée"],
        ['Stores latéraux', 'Screen ZIP en option sur les quatre côtés'],
        ['Teintes de toile', 'Sable, gris, blanc et anthracite']
      ]
    },
    {
      nom: 'Fermeture vitrée',
      serie: 'Série 1600 haut de gamme',
      img: 'terrasse-piscine-moderne',
      alt: 'Terrasse contemporaine fermée par des vitrages coulissants',
      teaser: "Des panneaux de verre qui s'empilent sur le côté. La terrasse devient une pièce, sans rien perdre de la vue.",
      detail: "Panneaux de verre coulissants qui s'empilent sur le côté, sans montant vertical entre les vantaux. Associés à une pergola bioclimatique, ils transforment la terrasse en pièce fermée sans rien perdre de la vue.",
      points: [
        ['Verre sans montant', "Vantaux qui s'empilent, vue dégagée"],
        ['Quatre saisons', 'Coupure thermique et joints brosse'],
        ['Chauffage infrarouge', 'Fixé sous le chéneau, en option'],
        ['Verrouillage', 'Serrure multipoints sur le vantail de service']
      ]
    }
  ];

  /* --------------------------------------------------------- construction */

  PRODUITS.forEach(function (p, i) {
    var fig = document.createElement('figure');
    fig.className = 'pslide' + (i === 0 ? ' is-on' : '');
    fig.dataset.i = String(i);

    var img = document.createElement('img');
    img.className = 'pslide__img';
    img.src = 'assets/img/gallery/' + p.img + '.webp';
    img.alt = p.alt;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    fig.appendChild(img);
    stage.appendChild(fig);

    var li = document.createElement('li');
    li.innerHTML = '<b></b><span></span>';
    li.querySelector('b').textContent = p.nom;
    li.querySelector('span').textContent = p.serie;
    li.dataset.i = String(i);
    li.tabIndex = 0;
    li.addEventListener('click', function () { goTo(i, true); });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i, true); }
    });
    idx.appendChild(li);
  });

  /* Cadre de visée : quatre équerres qui se referment au survol de l'image. */
  var focus = document.createElement('div');
  focus.className = 'pfocus';
  focus.setAttribute('aria-hidden', 'true');
  focus.innerHTML = '<span></span><span></span><span></span><span></span><em class="pfocus__tag"></em>';
  stage.appendChild(focus);
  var focusTag = focus.querySelector('.pfocus__tag');

  var slides = Array.prototype.slice.call(stage.querySelectorAll('.pslide'));
  var idxItems = Array.prototype.slice.call(idx.querySelectorAll('li'));

  /* ------------------------------------------------------ produit courant */

  var cur = -1;
  var lettres = [];
  var detailOpen = false;

  function goTo(i, fromClick) {
    if (i === cur || i < 0 || i >= PRODUITS.length) return;
    cur = i;
    var p = PRODUITS[i];

    slides.forEach(function (s, k) {
      s.classList.toggle('is-on', k === i);
      s.classList.toggle('is-prev', k < i);
    });
    idxItems.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });

    // le nom est reconstruit lettre par lettre, masqué au départ
    nameEl.textContent = '';
    lettres = [];
    p.nom.split(' ').forEach(function (mot, wi, arr) {
      var w = document.createElement('span');
      w.className = 'pn__w';
      Array.from(mot).forEach(function (ch) {
        var c = document.createElement('span');
        c.className = 'pn__c';
        c.textContent = ch;
        w.appendChild(c);
        lettres.push(c);
      });
      nameEl.appendChild(w);
      if (wi !== arr.length - 1) nameEl.appendChild(document.createTextNode(' '));
    });
    nameEl.setAttribute('aria-label', p.nom);

    serieEl.textContent = p.serie;
    teaserEl.textContent = p.teaser;
    noEl.textContent = String(i + 1).padStart(2, '0');
    focusTag.textContent = p.serie;

    dTitle.textContent = p.nom;
    dText.textContent = p.detail;
    if (dCap) dCap.textContent = p.serie;
    if (dImg) {
      dImg.src = 'assets/img/gallery/' + p.img + '.webp';
      dImg.alt = p.alt;
    }

    dList.textContent = '';
    p.points.forEach(function (pt) {
      var dt = document.createElement('dt');
      dt.textContent = pt[0];
      var dd = document.createElement('dd');
      dd.textContent = pt[1];
      dList.appendChild(dt);
      dList.appendChild(dd);
    });

    detail.classList.remove('is-fresh');
    void detail.offsetWidth;
    detail.classList.add('is-fresh');

    if (fromClick && !empile()) {
      var total = track.offsetHeight - window.innerHeight;
      if (total > 0) {
        var y = track.offsetTop + (total * (i + 0.35)) / PRODUITS.length;
        window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
      }
    }
  }

  /* En dessous de 920 px la section n'est plus collante : elle s'empile et
     le défilement ne pilote plus rien. On le détecte sur la mise en page
     réelle plutôt que sur une largeur codée en dur. */
  function empile() {
    return getComputedStyle(pin).position !== 'sticky';
  }

  /* ------------------------------------------------ révélation au geste
     La progression à l'intérieur du segment du produit courant pilote le
     nombre de lettres visibles. Le mot se compose pendant le glissement. */

  function reveler(local) {
    if (!lettres.length) return;
    // tout est lisible sur la première moitié du segment
    var t = REDUCED ? 1 : Math.min(Math.max(local / 0.45, 0), 1);
    var visibles = Math.round(t * lettres.length);
    for (var k = 0; k < lettres.length; k++) {
      lettres[k].classList.toggle('is-on', k < visibles);
    }
    if (meterEl) meterEl.style.transform = 'scaleX(' + local.toFixed(3) + ')';
  }

  /* ------------------------------------------------------ suivi défilement
     Le défilement reste branché même quand la vue détail est ouverte. */

  var ticking = false, visible = true;

  function paint() {
    ticking = false;
    if (!visible) return;

    // en pile, le nom doit rester entièrement lisible en permanence
    if (empile()) { reveler(1); return; }

    var total = track.offsetHeight - window.innerHeight;
    if (total <= 0) { goTo(0, false); reveler(1); return; }

    var prog = -track.getBoundingClientRect().top / total;
    prog = Math.min(Math.max(prog, 0), 0.9999);

    var n = PRODUITS.length;
    var pos = prog * n;
    goTo(Math.floor(pos), false);
    reveler(pos - Math.floor(pos));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }

  new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    if (visible) onScroll();
  }, { rootMargin: '20% 0px' }).observe(track);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ------------------------------------------------------- vue détail */

  function setDetail(on) {
    detailOpen = on;
    pin.classList.toggle('is-detail', on);
    root.classList.toggle('is-detail', on);
    btn.classList.toggle('is-back', on);
    btn.querySelector('.pbtn__t').textContent = on ? 'Retour' : 'Plus de détails';
    btn.setAttribute('aria-expanded', String(on));
    // inert retire le panneau du parcours clavier ET de l'arbre d'accessibilité.
    // aria-hidden seul laissait le bouton "Demander un devis" tabulable alors
    // que le panneau était replié.
    detail.toggleAttribute('inert', !on);
  }

  btn.addEventListener('click', function (e) { e.stopPropagation(); setDetail(!detailOpen); });
  stage.addEventListener('click', function () { if (!detailOpen) setDetail(true); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && detailOpen) { setDetail(false); btn.focus(); }
  });

  goTo(0, false);
  paint();
})();
