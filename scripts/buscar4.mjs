const qs = {
  16: 'Mercado Novo Belo Horizonte',
  24: 'Savassi Belo Horizonte',
  23: 'comida mineira prato',
  15: 'espresso coffee specialty',
};
const base = 'https://commons.wikimedia.org/w/api.php';
for (const [id,q] of Object.entries(qs)){
  const u = `${base}?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&format=json&origin=*`;
  const r = await fetch(u,{headers:{'User-Agent':'SaiBH/1.0'}});
  const j = await r.json();
  const pages = j?.query?.pages ? Object.values(j.query.pages) : [];
  console.log(`\n### id ${id} :: ${q}`);
  for (const p of pages){
    const ii = p.imageinfo?.[0]; if(!ii||!/image\/(jpeg|png)/.test(ii.mime)) continue;
    console.log(`${p.title} | ${ii.thumburl}`);
  }
}
