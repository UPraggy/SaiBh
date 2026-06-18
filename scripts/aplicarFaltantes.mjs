import fs from 'fs';
const filePath = 'src/components/funcionalidades/lugaresBH.js';
const picks = JSON.parse(fs.readFileSync('scripts/escolhas.json','utf8'));
let src = fs.readFileSync(filePath,'utf8');
const report = [];
for (const [id, urls] of Object.entries(picks)) {
  if (!urls.length) { report.push(`id ${id}: no urls`); continue; }
  const idIdx = src.indexOf(`id: ${id},`);
  if (idIdx < 0) { report.push(`id ${id}: id not found`); continue; }
  const rest = src.slice(idIdx);
  const fm = rest.match(/\n([ \t]*)foto:\s*null\s*,/);
  if (!fm) { report.push(`id ${id}: foto:null not found`); continue; }
  const indent = fm[1];
  let block = `\n${indent}foto: "${urls[0]}",`;
  const galeria = urls.slice(1);
  if (galeria.length) block += `\n${indent}galeria: [\n` + galeria.map(u=>`${indent}  "${u}",`).join('\n') + `\n${indent}],`;
  const abs = idIdx + fm.index;
  src = src.slice(0, abs) + block + src.slice(abs + fm[0].length);
  report.push(`id ${id}: foto + galeria(${galeria.length})`);
}
fs.writeFileSync(filePath, src, 'utf8');
console.log(report.join('\n'));
console.log('foto:null restantes =', (src.match(/foto:\s*null/g)||[]).length, '| galeria total =', (src.match(/galeria:/g)||[]).length);
