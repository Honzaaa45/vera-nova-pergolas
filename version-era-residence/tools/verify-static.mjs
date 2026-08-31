import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function localTarget(sourceFile, rawReference) {
  if (/^(?:https?:|mailto:|tel:|data:|#|javascript:)/i.test(rawReference)) return null;
  const clean = rawReference.split("#")[0].split("?")[0];
  if (!clean) return null;
  let target = path.resolve(path.dirname(sourceFile), clean);
  if (clean.endsWith("/")) target = path.join(target, "index.html");
  return target;
}

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));

const catalogueSource = fs.readFileSync(path.join(root, "assets/js/catalogue-data.js"), "utf8");
const catalogueContext = { window: {} };
vm.runInNewContext(catalogueSource, catalogueContext);
const products = catalogueContext.window.VERA_PRODUCTS || [];
const productIds = new Set(products.map((product) => product.id));
if (productIds.size !== products.length) failures.push("Catalogue: identifiant produit dupliqué");
for (const product of products) {
  for (const image of [product.image, product.altImage, product.thirdImage]) {
    const target = path.join(root, "assets/img/gallery", image);
    if (!fs.existsSync(target)) failures.push(`Catalogue ${product.id}: image absente ${image}`);
  }
  if (!productIds.has(product.next)) failures.push(`Catalogue ${product.id}: produit suivant absent ${product.next}`);
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  const h1Count = (source.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) failures.push(`${relative}: ${h1Count} élément(s) h1`);

  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) failures.push(`${relative}: identifiants dupliqués ${[...new Set(duplicates)].join(", ")}`);

  for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)) {
    const target = localTarget(file, match[1]);
    if (target && !fs.existsSync(target)) failures.push(`${relative}: référence absente ${match[1]}`);
  }

  for (const match of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[0])) failures.push(`${relative}: image sans attribut alt`);
  }
}

for (const file of files.filter((item) => /\.(?:css|html|js)$/i.test(item))) {
  const source = fs.readFileSync(file, "utf8");
  if (/[—–]/.test(source)) failures.push(`${path.relative(root, file)}: tiret long interdit`);

  if (file.endsWith(".css")) {
    for (const match of source.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
      const target = localTarget(file, match[1]);
      if (target && !fs.existsSync(target)) failures.push(`${path.relative(root, file)}: ressource CSS absente ${match[1]}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`OK: ${htmlFiles.length} pages et ${products.length} produits. Liens locaux, images, h1, identifiants et ressources CSS vérifiés.`);
