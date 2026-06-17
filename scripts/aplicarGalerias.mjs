import fs from 'fs';

const candsPath = 'scripts/galeria-candidatos.json';
const filePath = 'src/components/funcionalidades/lugaresBH.js';

const cands = JSON.parse(fs.readFileSync(candsPath, 'utf8'));
let src = fs.readFileSync(filePath, 'utf8');

const TARGET = [1, 2, 3, 4, 6, 8, 9, 10, 11, 13, 17, 20, 21, 25, 28, 29, 30, 32];
const MAX = 3;

// Normalize a Commons URL to its hash+filename key, stripping the thumb wrapper.
function key(u) {
  if (!u) return null;
  const m = u.match(/commons\/(?:thumb\/)?([0-9a-f]\/[0-9a-f]{2}\/[^/]+?)(?:\/\d+px-[^/]+)?$/);
  return m ? decodeURIComponent(m[1]) : u;
}

// Pick up to MAX gallery URLs for an id, excluding the cover and any extra-excluded keys.
function pickGaleria(id, coverUrl, exclude = []) {
  const coverKey = key(coverUrl);
  const exKeys = new Set([coverKey, ...exclude]);
  const list = (cands[String(id)]?.candidatos || [])
    .filter((c) => c.mime === 'image/jpeg')
    .filter((c) => !exKeys.has(key(c.thumburl)));
  // Prefer real 1280 thumbs (width >= 1280 and a /thumb/ url) but keep order otherwise.
  list.sort((a, b) => {
    const sa = (a.width >= 1280 && a.thumburl.includes('/thumb/')) ? 1 : 0;
    const sb = (b.width >= 1280 && b.thumburl.includes('/thumb/')) ? 1 : 0;
    return sb - sa;
  });
  const out = [];
  const seen = new Set();
  for (const c of list) {
    const k = key(c.thumburl);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c.thumburl);
    if (out.length >= MAX) break;
  }
  return out;
}

// Locate the `foto:` line that belongs to a given id block.
function findFotoMatch(id) {
  const idRe = new RegExp(`\\bid:\\s*${id}\\b`);
  const idIdx = src.search(idRe);
  if (idIdx < 0) return null;
  const rest = src.slice(idIdx);
  const fotoRe = /\n([ \t]*)foto:\s*(null|"[^"]*"|'[^']*'|`[^`]*`)\s*,/;
  const fm = rest.match(fotoRe);
  if (!fm) return null;
  return {
    indent: fm[1],
    fullLine: fm[0],
    fotoVal: fm[2],
    absStart: idIdx + fm.index,
  };
}

function fmtGaleria(indent, urls) {
  const inner = urls.map((u) => `${indent}  "${u}",`).join('\n');
  return `\n${indent}galeria: [\n${inner}\n${indent}],`;
}

const report = [];

for (const id of TARGET) {
  const fm = findFotoMatch(id);
  if (!fm) { report.push(`id ${id}: FOTO LINE NOT FOUND`); continue; }

  if (src.includes(`galeria:`) && src.slice(fm.absStart, fm.absStart + 200).includes('galeria:')) {
    report.push(`id ${id}: galeria already present, skip`);
    continue;
  }

  const exclude = id === 11
    ? [key('https://upload.wikimedia.org/wikipedia/commons/7/73/x.jpg')] // Rio de Janeiro CCBB
    : [];

  if (id === 32) {
    // Promote cover (f/fe ...Brasil_1.JPG = candidate 0) then build gallery from the rest.
    const cover = cands['32'].candidatos[0].thumburl;
    const galeria = pickGaleria(32, cover, exclude);
    const newLine = fm.fullLine
      .replace(/foto:\s*null/, `foto: "${cover}"`)
      .replace(/,\s*$/, ',') + fmtGaleria(fm.indent, galeria);
    src = src.slice(0, fm.absStart) + newLine + src.slice(fm.absStart + fm.fullLine.length);
    report.push(`id 32: cover promoted + galeria(${galeria.length})`);
    continue;
  }

  // Cover URL = current foto value (strip quotes).
  const coverUrl = fm.fotoVal.replace(/^["'`]|["'`]$/g, '');
  const galeria = pickGaleria(id, coverUrl, exclude);
  if (!galeria.length) { report.push(`id ${id}: no candidates after exclude`); continue; }
  const newLine = fm.fullLine + fmtGaleria(fm.indent, galeria);
  src = src.slice(0, fm.absStart) + newLine + src.slice(fm.absStart + fm.fullLine.length);
  report.push(`id ${id}: galeria(${galeria.length})`);
}

fs.writeFileSync(filePath, src, 'utf8');
console.log(report.join('\n'));
console.log('\nTotal galeria fields:', (src.match(/galeria:/g) || []).length);
