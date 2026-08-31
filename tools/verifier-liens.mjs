/* =========================================================================
   Vérificateur de liens et de ressources locales.

   Le site n'a aucun build : rien ne casse bruyamment quand un fichier est
   renommé ou qu'une ancre disparaît. Ce script rejoue à froid ce qu'un
   navigateur ferait, et fait échouer la CI si une référence pointe dans le
   vide.

   Sans dépendance : il tourne partout où Node tourne.
   Usage : node tools/verifier-liens.mjs
   ========================================================================= */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';

const RACINE = resolve(process.cwd());
const erreurs = [];
let verifiees = 0;

/* -------------------------------------------------- fichiers HTML à lire
   On descend dans les sous-dossiers : le catalogue vit dans catalogue/ et
   ses treize pages doivent être vérifiées comme les autres. */
function pagesDe(dossier) {
  const trouvees = [];
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    // version-era-residence est un projet parallèle, avec ses propres
    // ressources : il se vérifie séparément.
    if (e.name.startsWith('.') || e.name === 'node_modules'
        || e.name === 'version-era-residence') continue;
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) trouvees.push(...pagesDe(chemin));
    else if (e.name.endsWith('.html')) trouvees.push(chemin);
  }
  return trouvees;
}

const pagesHtml = pagesDe(RACINE).map((p) => p.slice(RACINE.length + 1));
if (pagesHtml.length === 0) {
  console.error('Aucune page HTML trouvée à la racine.');
  process.exit(1);
}

/* ------------------------------------------------------------- collecte */
// href, src, et la première URL de chaque candidat d'un srcset
const MOTIF_ATTR = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
const MOTIF_SRCSET = /srcset\s*=\s*["']([^"']+)["']/gi;
const MOTIF_ID = /\sid\s*=\s*["']([^"']+)["']/gi;

/** Une référence est-elle externe, donc hors du périmètre de ce script ? */
function estExterne(url) {
  return /^(https?:|mailto:|tel:|data:|javascript:|#$)/i.test(url);
}

for (const page of pagesHtml) {
  const chemin = join(RACINE, page);
  const source = readFileSync(chemin, 'utf8');

  // identifiants présents dans CETTE page, pour valider les ancres
  const ids = new Set();
  for (const m of source.matchAll(MOTIF_ID)) ids.add(m[1]);

  const refs = [];
  for (const m of source.matchAll(MOTIF_ATTR)) refs.push(m[1]);
  for (const m of source.matchAll(MOTIF_SRCSET)) {
    for (const candidat of m[1].split(',')) {
      const url = candidat.trim().split(/\s+/)[0];
      if (url) refs.push(url);
    }
  }

  for (const brut of refs) {
    const url = brut.trim();
    if (!url || estExterne(url)) continue;

    // ---------------------------------------------------- ancre interne
    if (url.startsWith('#')) {
      verifiees++;
      const cible = decodeURIComponent(url.slice(1));
      if (!ids.has(cible)) {
        erreurs.push(`${page} : ancre morte « ${url} » (aucun id correspondant)`);
      }
      continue;
    }

    // ------------------------------------------------- fichier local
    verifiees++;
    const sansFragment = decodeURIComponent(url.split('#')[0].split('?')[0]);
    if (!sansFragment) continue;

    const cible = sansFragment.startsWith('/')
      ? join(RACINE, sansFragment)
      : resolve(dirname(chemin), sansFragment);

    // on refuse toute sortie hors du dépôt
    if (!cible.startsWith(RACINE + sep) && cible !== RACINE) {
      erreurs.push(`${page} : « ${url} » sort du dépôt`);
      continue;
    }
    if (!existsSync(cible)) {
      erreurs.push(`${page} : ressource introuvable « ${url} »`);
      continue;
    }
    // Un lien vers un dossier (« / », « docs/ ») est servi par son index.html :
    // c'est ce que fait n'importe quel serveur statique, y compris GitHub Pages.
    if (statSync(cible).isDirectory() && !existsSync(join(cible, 'index.html'))) {
      erreurs.push(`${page} : « ${url} » vise un dossier sans index.html`);
    }
  }
}

/* -------------------------------------------------------------- rapport */
if (erreurs.length) {
  console.error(`\n${erreurs.length} référence(s) cassée(s) :\n`);
  for (const e of erreurs) console.error('  ✗ ' + e);
  console.error('');
  process.exit(1);
}

console.log(`${verifiees} références locales vérifiées dans ${pagesHtml.length} page(s) : aucune cassée.`);
