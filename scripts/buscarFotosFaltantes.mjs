import fs from 'fs';
const queries = {
  5:  'Praça da Assembleia Belo Horizonte',
  14: 'Museu de Artes e Ofícios Belo Horizonte',
  18: 'Mercado Central Belo Horizonte',
  19: 'Mercado Novo Belo Horizonte',
  22: 'Viaduto Santa Tereza Belo Horizonte',
  26: 'Jardim Zoológico Belo Horizonte',
  27: 'Parque Guanabara Belo Horizonte',
  31: 'Centro Histórico Sabará',
};
const out = {};
for (const [id, q] of Object.entries(queries)) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&format=json&origin=*`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'SaiBH/1.0 (rafael; educational)' } });
    const j = await r.json();
    const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
    out[id] = pages.map(p => {
      const ii = p.imageinfo?.[0];
      return ii ? { title: p.title, thumburl: ii.thumburl, w: ii.thumbwidth, mime: ii.mime } : null;
    }).filter(Boolean).filter(c => c.mime === 'image/jpeg' && c.w >= 800);
  } catch (e) { out[id] = []; }
}
fs.writeFileSync('scripts/fotos-faltantes.json', JSON.stringify(out, null, 1));
for (const [id, arr] of Object.entries(out)) console.log(`id ${id}: ${arr.length} cands`);
