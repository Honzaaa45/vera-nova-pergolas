/* =========================================================================
   NUANCIER RAL

   Les vingt références du catalogue fabricant, construites depuis des
   données plutôt que depuis une image : le nuancier reste net à toute
   taille, se lit au lecteur d'écran, et ne coûte pas un octet de plus.

   Les valeurs hexadécimales sont les correspondances usuelles des codes
   RAL. Un écran ne restitue jamais fidèlement un thermolaquage : le texte
   de la section le dit, et la visite apporte le nuancier physique.
   ========================================================================= */
(function () {
  'use strict';

  var hote = document.getElementById('nuancier');
  if (!hote) return;

  var TEINTES = [
    { ral: '7012', hex: '#575D5E', nom: 'Gris basalte' },
    { ral: '7015', hex: '#51565C', nom: 'Gris ardoise' },
    { ral: '7016', hex: '#383E42', nom: 'Gris anthracite' },
    { ral: '7021', hex: '#2F3234', nom: 'Gris noir' },
    { ral: '7022', hex: '#4C4A44', nom: 'Gris terre d’ombre' },
    { ral: '7037', hex: '#7D7F7D', nom: 'Gris poussière' },
    { ral: '7039', hex: '#6C6960', nom: 'Gris quartz' },
    { ral: '7040', hex: '#9DA3A6', nom: 'Gris fenêtre' },
    { ral: '7047', hex: '#C8C8C7', nom: 'Télégris 4' },

    { ral: '8003', hex: '#7E4B26', nom: 'Brun argile' },
    { ral: '8011', hex: '#5A3A29', nom: 'Brun noisette' },
    { ral: '8012', hex: '#673831', nom: 'Brun rouge' },
    { ral: '8014', hex: '#4A3526', nom: 'Brun sépia' },
    { ral: '8015', hex: '#5E2E2B', nom: 'Brun marron' },
    { ral: '8016', hex: '#4C2B20', nom: 'Brun acajou' },
    { ral: '8017', hex: '#442F29', nom: 'Brun chocolat' },

    { ral: '9001', hex: '#E9E0D2', nom: 'Blanc crème' },
    { ral: '9002', hex: '#D7D5CB', nom: 'Blanc gris' },
    { ral: '9010', hex: '#F1EDE1', nom: 'Blanc pur' },
    { ral: '9011', hex: '#27292B', nom: 'Noir graphite' }
  ];

  /* Un texte foncé sur une teinte sombre serait illisible. On calcule la
     luminance perçue plutôt que la moyenne des canaux : l'œil est bien
     plus sensible au vert qu'au bleu. */
  function estClair(hex) {
    var r = parseInt(hex.substr(1, 2), 16);
    var v = parseInt(hex.substr(3, 2), 16);
    var b = parseInt(hex.substr(5, 2), 16);
    return (0.2126 * r + 0.7152 * v + 0.0722 * b) > 140;
  }

  var frag = document.createDocumentFragment();

  TEINTES.forEach(function (t) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'teinte' + (estClair(t.hex) ? ' est-clair' : '');
    el.style.setProperty('--teinte', t.hex);
    el.setAttribute('aria-label', 'RAL ' + t.ral + ', ' + t.nom);

    var code = document.createElement('span');
    code.className = 'teinte__ral';
    code.textContent = t.ral;

    var nom = document.createElement('span');
    nom.className = 'teinte__nom';
    nom.textContent = t.nom;

    el.append(code, nom);
    frag.appendChild(el);
  });

  hote.appendChild(frag);

  /* Cliquer une teinte la reporte dans le formulaire de devis : le visiteur
     n'a pas à retenir un code à quatre chiffres jusqu'en bas de page. */
  hote.addEventListener('click', function (e) {
    var el = e.target.closest('.teinte');
    if (!el) return;

    hote.querySelectorAll('.teinte').forEach(function (t) {
      t.classList.toggle('est-choisie', t === el);
    });

    var msg = document.getElementById('f-msg');
    if (!msg) return;
    var ral = el.querySelector('.teinte__ral').textContent;
    var ligne = 'Teinte souhaitée : RAL ' + ral;
    msg.value = msg.value.replace(/Teinte souhaitée : RAL \d+\n?/, '');
    msg.value = ligne + (msg.value ? '\n' + msg.value : '');
  });
})();
