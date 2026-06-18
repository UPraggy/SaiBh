const qs={
 3065:'Centro Cultural Banco do Brasil Belo Horizonte',
 3129:'Lagoa da Pampulha Belo Horizonte',
 3128:'Casa do Baile Pampulha',
 3071:'Casa Fiat de Cultura',
 3041:'Parque Burle Marx Belo Horizonte',
 3137:'Casa Kubitschek Pampulha',
 3139:'Mineirão estádio',
 3069:'Centro Cultural UFMG',
};
const base='https://commons.wikimedia.org/w/api.php';
for(const [id,q] of Object.entries(qs)){
  const u=`${base}?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url|mime&iiurlwidth=1280&format=json&origin=*`;
  let j; try{j=await (await fetch(u,{headers:{'User-Agent':'SaiBH/1.0'}})).json();}catch(e){console.log(`\n### ${id} ERR`);continue;}
  const pages=j?.query?.pages?Object.values(j.query.pages):[];
  console.log(`\n### ${id} :: ${q}`);
  for(const p of pages){const ii=p.imageinfo?.[0];if(!ii||!/image\/(jpeg|png)/.test(ii.mime))continue;console.log(`${p.title} | ${ii.thumburl}`);}
  await new Promise(r=>setTimeout(r,400));
}
