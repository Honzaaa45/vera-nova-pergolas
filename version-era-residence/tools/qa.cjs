const { chromium } = require("C:/Users/vvvb4/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const path = require("node:path");
const os = require("node:os");

const base = process.env.SITE_URL || "http://127.0.0.1:5180";
const pages = [
  ["accueil", "/"],
  ["catalogue", "/catalogue/"],
  ["fiche", "/catalogue/produit.html?ref=platin"]
];
const widths = [1280, 375];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--disable-crash-reporter", "--disable-breakpad", "--no-sandbox"]
  });
  const failures = [];

  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 800 }, reducedMotion: "no-preference" });
    for (const [name, route] of pages) {
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("pageerror", error => consoleErrors.push(error.message));
      const response = await page.goto(base + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(1700);
      const audit = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelectorAll("h1").length,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.getAttribute("src"))
      }));
      if (!response || !response.ok()) failures.push(`${width}px ${name}: réponse HTTP invalide`);
      if (audit.h1 !== 1) failures.push(`${width}px ${name}: ${audit.h1} éléments h1`);
      if (audit.scrollWidth > audit.clientWidth) failures.push(`${width}px ${name}: débordement ${audit.scrollWidth} > ${audit.clientWidth}`);
      if (audit.brokenImages.length) failures.push(`${width}px ${name}: images cassées ${audit.brokenImages.join(", ")}`);
      if (consoleErrors.length) failures.push(`${width}px ${name}: console ${consoleErrors.join(" | ")}`);
      await page.screenshot({ path: path.join(os.tmpdir(), `vera-era-${name}-${width}.png`), fullPage: false });
      await page.close();
    }
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(base + "/catalogue/", { waitUntil: "networkidle" });
  await page.click('[data-filter="fermetures"]');
  const visibleCards = await page.locator(".product-card:not([hidden])").count();
  if (visibleCards !== 4) failures.push(`Filtre fermetures: ${visibleCards} cartes visibles au lieu de 4`);
  await page.goto(base + "/catalogue/produit.html?ref=guillotine", { waitUntil: "networkidle" });
  if ((await page.locator("h1").innerText()).trim() !== "Guillotine") failures.push("La fiche dynamique Guillotine ne se charge pas");
  await page.click('[data-open="menu"]');
  if (!(await page.locator('[data-overlay="menu"]').getAttribute("class")).includes("is-open")) failures.push("Le menu ne s'ouvre pas");
  await page.keyboard.press("Escape");
  if ((await page.locator('[data-overlay="menu"]').getAttribute("class")).includes("is-open")) failures.push("Le menu ne se ferme pas avec Échap");
  await context.close();
  await browser.close();

  if (failures.length) {
    console.error("ÉCHEC QA\n" + failures.map(item => "- " + item).join("\n"));
    process.exit(1);
  }
  console.log("QA réussie: 3 pages, 2 largeurs, catalogue, fiche dynamique et menu.");
})().catch(error => { console.error(error); process.exit(1); });
