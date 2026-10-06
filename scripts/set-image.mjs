#!/usr/bin/env node
// Gestion des images du storefront depuis le terminal.
//   node scripts/set-image.mjs list                 -> slots + fichiers de ./picture (numérotés)
//   node scripts/set-image.mjs set <slot> <n|nom>   -> remplace une image
//   node scripts/set-image.mjs auto                 -> remplit tous les slots avec les 1res photos
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PICTURE = path.join(ROOT, "picture");
const OUT = path.join(ROOT, "storefront/public/images");
const MANIFEST = path.join(ROOT, "storefront/src/config/images.json");

const SLOTS = {
  "hero-poster": "Accueil – image de fond du bandeau vidéo",
  "origin": "Accueil – section « savoir-faire »",
  "cat-chemises": "Catégorie Chemises (carte accueil + bandeau)",
  "cat-polos": "Catégorie Polos",
  "cat-tee-shirts": "Catégorie Tee-shirts",
  "cat-costumes": "Catégorie Costumes & Blazers",
  "cat-pantalons": "Catégorie Pantalons",
  "cat-accessoires": "Catégorie Accessoires",
  "cat-nouveautes": "Catégorie Nouveautés",
};
const EXT = /\.(jpe?g|png|webp|avif)$/i;
const pics = () => fs.existsSync(PICTURE)
  ? fs.readdirSync(PICTURE).filter((f) => EXT.test(f)).sort() : [];
const load = () => (fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {});

function setSlot(slot, src) {
  if (!SLOTS[slot]) throw new Error(`Slot inconnu "${slot}". Voir: node scripts/set-image.mjs list`);
  const list = pics();
  let file = /^\d+$/.test(src) ? list[Number(src) - 1] : src;
  if (!file) throw new Error(`Image n°${src} introuvable dans ${PICTURE}`);
  let full = path.isAbsolute(file) ? file : fs.existsSync(path.join(PICTURE, file)) ? path.join(PICTURE, file) : path.resolve(file);
  if (!fs.existsSync(full)) throw new Error(`Fichier introuvable : ${file}`);
  fs.mkdirSync(OUT, { recursive: true });
  const ext = path.extname(full).toLowerCase().replace(".jpeg", ".jpg");
  const m = load();
  if (m[slot]) fs.rmSync(path.join(OUT, m[slot].file), { force: true });
  const name = slot + ext;
  fs.copyFileSync(full, path.join(OUT, name));
  m[slot] = { file: name, v: Date.now() };          // v = anti-cache navigateur
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");
  console.log(`✔ ${slot}  <-  ${path.basename(full)}`);
}

const [cmd, a, b] = process.argv.slice(2);
try {
  if (cmd === "list" || !cmd) {
    const m = load();
    console.log("\nSLOTS (emplacements du site)");
    for (const [s, d] of Object.entries(SLOTS)) console.log(`  ${s.padEnd(16)} ${d}  ${m[s] ? "[" + m[s].file + "]" : "[non défini]"}`);
    console.log(`\nIMAGES dans ${path.relative(ROOT, PICTURE)}/`);
    pics().forEach((f, i) => console.log(`  ${String(i + 1).padStart(2)}. ${f}`));
    console.log("\nUsage : node scripts/set-image.mjs set <slot> <numéro|fichier>\n");
  } else if (cmd === "set" && a && b) setSlot(a, b);
  else if (cmd === "auto") {
    const big = pics().filter((f) => fs.statSync(path.join(PICTURE, f)).size > 20000);
    Object.keys(SLOTS).forEach((s, i) => big[i] && setSlot(s, big[i]));
  } else console.log("Usage : list | set <slot> <numéro|fichier> | auto");
} catch (e) { console.error("✖", e.message); process.exit(1); }
