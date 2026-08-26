/* =========================================================================
   Vera Nova - comportements de la page
   La scène du hero et la galerie courbe vivent dans leurs propres modules.
   ========================================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     OÙ ARRIVENT LES DEMANDES DE DEVIS
     Collez ici l'URL de votre service de formulaire (Formspree, Web3Forms,
     Netlify Forms, Brevo...). Tant que la chaîne est vide, le formulaire
     bascule sur l'ouverture d'un e-mail prérempli pour ne perdre aucun
     contact. Voir README.md, section "Recevoir les demandes".
  ----------------------------------------------------------------------- */
  var FORM_ENDPOINT = '';
  var FORM_MAILTO   = 'contact@veranova.fr';   // À REMPLACER par votre e-mail

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------ frise verticale */
  (function () {
    var items = $$('.tl__i');
    if (!items.length) return;
    if (REDUCED) { items.forEach(function (x) { x.classList.add('is-in'); }); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (x) { io.observe(x); });
  })();

  /* ---------------------------------------------------------- témoignages
     Alimentés par assets/data/temoignages.json. Ce fichier part VIDE et la
     section reste masquée : aucun avis n'est inventé. Format attendu :
       { "texte": "...", "nom": "Prénom N.", "role": "Romorantin-Lanthenay",
         "photo": "assets/img/avis/xxx.jpg" }   // photo facultative
  ----------------------------------------------------------------------- */
  (function () {
    var section = $('#avis'), host = $('#avis-cols');
    if (!section || !host) return;

    function initiales(nom) {
      return String(nom || '?').trim().split(/\s+/).slice(0, 2)
        .map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
    }

    function carte(t) {
      var el = document.createElement('figure');
      el.className = 'tcard';

      var p = document.createElement('p');
      p.textContent = t.texte || '';
      el.appendChild(p);

      var who = document.createElement('figcaption');
      who.className = 'tcard__who';

      if (t.photo) {
        var img = document.createElement('img');
        img.src = t.photo; img.alt = ''; img.width = 40; img.height = 40;
        img.loading = 'lazy';
        who.appendChild(img);
      } else {
        var ini = document.createElement('span');
        ini.className = 'tcard__ini';
        ini.setAttribute('aria-hidden', 'true');
        ini.textContent = initiales(t.nom);
        who.appendChild(ini);
      }

      var txt = document.createElement('div');
      var b = document.createElement('b');
      b.textContent = t.nom || '';
      var s = document.createElement('span');
      s.textContent = t.role || '';
      txt.append(b, s);
      who.appendChild(txt);

      el.appendChild(who);
      return el;
    }

    fetch('assets/data/temoignages.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (list) {
        if (!Array.isArray(list) || list.length < 3) return;   // rien à montrer

        // trois colonnes qui défilent à des vitesses différentes
        var cols = [[], [], []];
        list.forEach(function (t, k) { cols[k % 3].push(t); });
        var durees = [26, 34, 30];

        cols.forEach(function (group, k) {
          if (!group.length) return;
          var col = document.createElement('div');
          col.className = 'tcol';
          col.style.setProperty('--dur', durees[k] + 's');
          // doublé pour que la boucle soit sans couture. Le second jeu est
          // masqué aux lecteurs d'écran, sinon chaque avis est lu deux fois.
          group.forEach(function (t) { col.appendChild(carte(t)); });
          group.forEach(function (t) {
            var c = carte(t);
            c.setAttribute('aria-hidden', 'true');
            col.appendChild(c);
          });
          host.appendChild(col);
        });

        section.hidden = false;
      });
  })();

  /* ---------------------------------------------------------- formulaire */
  (function () {
    var form = $('#form');
    if (!form) return;

    var state = $('#form-state');
    var btn = $('#submit');

    var RULES = {
      'f-nom':  { test: function (v) { return v.trim().length >= 2; }, msg: 'Indiquez votre nom.' },
      'f-tel':  { test: function (v) { return /^(?:\+33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}$/.test(v.trim()); }, msg: 'Numéro à 10 chiffres, par exemple 06 XX XX XX XX.' },
      'f-mail': { test: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); }, msg: 'Adresse e-mail incomplète.' },
      'f-cp':   { test: function (v) { return /^\d{5}$/.test(v.trim()); }, msg: 'Code postal à 5 chiffres.' }
    };

    function check(id) {
      var el = document.getElementById(id);
      var field = el.closest('.field');
      var slot = form.querySelector('.err[data-for="' + id + '"]');
      var ok = RULES[id].test(el.value);
      field.classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', String(!ok));
      if (slot) slot.textContent = ok ? '' : RULES[id].msg;
      return ok;
    }

    Object.keys(RULES).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', function () { if (el.value) check(id); });
      el.addEventListener('input', function () {
        if (el.closest('.field').classList.contains('is-bad')) check(id);
      });
    });

    function say(msg, kind) {
      state.textContent = msg;
      state.className = 'form__state' + (kind ? ' is-' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Piège à robots rempli : on fait comme si tout allait bien, sans rien
      // envoyer. Répondre par une erreur apprendrait au robot à contourner.
      var pot = document.getElementById('f-site');
      if (pot && pot.value) {
        say('Demande reçue. Nous vous rappelons sous 48 heures ouvrées.', 'ok');
        return;
      }

      var bad = Object.keys(RULES).filter(function (id) { return !check(id); });
      if (bad.length) {
        say('Il manque ' + bad.length + (bad.length > 1 ? ' informations.' : ' information.'), 'bad');
        document.getElementById(bad[0]).focus();
        return;
      }

      var d = new FormData(form);
      btn.disabled = true;
      say('Envoi en cours');

      if (!FORM_ENDPOINT) {
        var body =
          'Nom : ' + d.get('nom') + '\n' +
          'Téléphone : ' + d.get('tel') + '\n' +
          'E-mail : ' + d.get('email') + '\n' +
          'Code postal : ' + d.get('cp') + '\n' +
          'Intérêt : ' + d.get('type') + '\n\n' +
          'Projet :\n' + (d.get('message') || '(non précisé)');
        window.location.href = 'mailto:' + FORM_MAILTO +
          '?subject=' + encodeURIComponent('Demande de devis - ' + d.get('nom')) +
          '&body=' + encodeURIComponent(body);
        btn.disabled = false;
        say('Votre logiciel de messagerie s\'ouvre avec la demande préremplie. Il ne reste qu\'à l\'envoyer.', 'ok');
        return;
      }

      fetch(FORM_ENDPOINT, { method: 'POST', body: d, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          say('Demande reçue. Nous vous rappelons sous 48 heures ouvrées.', 'ok');
        })
        .catch(function () {
          say('L\'envoi a échoué. Appelez-nous au 07 XX XX XX XX, nous prenons votre projet par téléphone.', 'bad');
        })
        .finally(function () { btn.disabled = false; });
    });
  })();

  /* --------------------------------------------------------------- année */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
