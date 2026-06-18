import { readFileSync } from 'fs';
const D='src/components/funcionalidades/';
const all=[...JSON.parse(readFileSync(D+'lugaresOSM.json','utf8')),...JSON.parse(readFileSync(D+'lugaresGoogle.json','utf8'))];
const cats=new Set(['parque','praca','mirante','cultura','historico','igreja','museu','natureza','turismo']);
const dist={}; for(const x of all){dist[x.categoria]=(dist[x.categoria]||0)+1;}
console.log('categorias:',JSON.stringify(dist));
const top=all.filter(x=>!x.foto && cats.has(x.categoria)).sort((a,b)=>(b.avaliacoes||0)-(a.avaliacoes||0)).slice(0,25);
console.log('\n#id\tnota\taval\tcat\tnome\t|\tregiao');
for(const t of top)console.log(`${t.id}\t${t.nota||''}\t${t.avaliacoes||0}\t${t.categoria}\t${t.nome}\t|\t${t.regiao}`);
