/* =========================================================================
   Carte interactive, sans habillage.
   Leaflet plus fond de plan Carto clair. Aucun bouton de zoom, aucun
   bandeau. L'attribution reste affichée en très petit : la licence des
   données OpenStreetMap l'exige, la retirer serait une infraction.
   ========================================================================= */
(function () {
  'use strict';

  var host = document.getElementById('map-canvas');
  if (!host || typeof L === 'undefined') return;

  var LAT = 47.3707524, LON = 1.7103779;
  var ADRESSE = '5 Rue René Bonnet, 41200 Romorantin-Lanthenay';

  var map = L.map(host, {
    center: [LAT, LON],
    zoom: 15,
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,      // la molette doit continuer à faire défiler la page
    dragging: true,
    doubleClickZoom: true,
    touchZoom: true,
    keyboard: true
  });

  /* Les fonds CARTO exigent désormais une clé d API : sans elle, chaque
     tuile porte un filigrane « API KEY REQUIRED » en travers de la carte.
     Les tuiles standard d OpenStreetMap sont libres et sans clé ; leur
     politique d usage convient à un site vitrine à faible trafic. */
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // Marqueur dessiné en HTML pour reprendre la goutte rouge de la marque
  var pin = L.divIcon({
    className: 'lpin',
    html:
      '<span class="lpin__ping"></span>' +
      '<span class="lpin__ping lpin__ping--2"></span>' +
      '<span class="lpin__dot"><i class="ph ph-map-pin" aria-hidden="true"></i></span>',
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });

  L.marker([LAT, LON], { icon: pin, title: ADRESSE, keyboard: true, alt: ADRESSE }).addTo(map);

  // La molette ne zoome qu'après un clic dans la carte, et se coupe en sortant.
  map.on('click', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  // Le conteneur change de taille quand la mise en page bouge.
  new ResizeObserver(function () { map.invalidateSize(); }).observe(host);

  // Rien ne sert de calculer la carte hors écran.
  new IntersectionObserver(function (e) {
    if (e[0].isIntersecting) map.invalidateSize();
  }, { rootMargin: '200px' }).observe(host);
})();
