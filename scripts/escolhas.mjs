import fs from 'fs';
const d = JSON.parse(fs.readFileSync('scripts/fotos-faltantes.json','utf8'));
// id: [coverIdx, ...galeriaIdx]
const picks = { 14:[0,1,2], 18:[0,1,2], 19:[0,1,2], 22:[1,2,3], 26:[2,0,1], 27:[5,4], 31:[4,0,2] };
const res = {};
for (const [id, idxs] of Object.entries(picks)) {
  res[id] = idxs.map(i => d[id][i]?.thumburl).filter(Boolean);
}
// extra: re-search Praça da Assembleia (id 5)
const q = 'Espelho d\'água Praça da Assembleia Belo Horizonte';
const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent('Praça da Assembleia Belo Horizonte espelho')}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&format=json&origin=*`;
try {
  const r = await fetch(url, { headers: { 'User-Agent': 'SaiBH/1.0' } });
  const j = await r.json();
  const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
  console.log('id5 retry:'); pages.forEach(p=>{const ii=p.imageinfo?.[0]; if(ii&&ii.mime==='image/jpeg') console.log('  '+p.title.replace('File:','')+' ['+ii.thumbwidth+']');});
} catch(e){ console.log('id5 err', e.message); }
fs.writeFileSync('scripts/escolhas.json', JSON.stringify(res,null,1));
for (const [id,arr] of Object.entries(res)) console.log(`id ${id}: ${arr.length} urls`);
