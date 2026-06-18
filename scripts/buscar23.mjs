const qs = ['feijão tropeiro','frango com quiabo Minas','culinária mineira'];
const base='https://commons.wikimedia.org/w/api.php';
for (const q of qs){
  const u=`${base}?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|mime&iiurlwidth=1280&format=json&origin=*`;
  const j=await (await fetch(u,{headers:{'User-Agent':'SaiBH/1.0'}})).json();
  const pages=j?.query?.pages?Object.values(j.query.pages):[];
  console.log(`\n### ${q}`);
  for(const p of pages){const ii=p.imageinfo?.[0];if(!ii||!/image\/(jpeg|png)/.test(ii.mime))continue;console.log(`${p.title} | ${ii.thumburl}`);}
}
