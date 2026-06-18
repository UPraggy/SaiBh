const UA={'User-Agent':'SaiBH/1.0 (rafaelmr.com.br)'};
const buscas={
 3041:'Parque Roberto Burle Marx Belo Horizonte',
 3071:'Casa Fiat de Cultura Belo Horizonte',
 1001:'Pirulito Praça Sete Belo Horizonte',
 1042:'Praça do Papa Belo Horizonte',
 1043:'Mirante Mangabeiras Belo Horizonte',
};
for(const [id,q] of Object.entries(buscas)){
 const url=`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|mime&iiurlwidth=1280&format=json&origin=*`;
 try{
  const r=await fetch(url,{headers:UA});const j=await r.json();
  const pages=Object.values(j?.query?.pages||{});
  console.log(`\n=== ${id} :: ${q}`);
  for(const p of pages){const ii=p.imageinfo?.[0];if(ii&&/image\/(jpeg|png)/.test(ii.mime))console.log(` ${p.title.replace('File:','')}\n   ${ii.thumburl}`);}
 }catch(e){console.log(id,'ERR',e.message);}
 await new Promise(r=>setTimeout(r,1200));
}
