import { readFileSync } from 'fs';
const G=JSON.parse(readFileSync('src/components/funcionalidades/lugaresGoogle.json','utf8'));
const O=JSON.parse(readFileSync('src/components/funcionalidades/lugaresOSM.json','utf8'));
const all=[...G,...O];
const pub=/parque|praça|praca|museu|igreja|catedral|mirante|memorial|teatro|centro cultural|biblioteca|jardim|basílica|basilica|palácio|palacio|monumento/i;
const ja=new Set([3065,3069,3128,3129,3137,3139]);
const cand=all.filter(p=>!p.foto && !ja.has(p.id) && (pub.test(p.nome)||pub.test(p.categoria||'')));
cand.sort((a,b)=>(b.avaliacoes||0)-(a.avaliacoes||0)||(b.nota||0)-(a.nota||0));
for(const p of cand.slice(0,20)) console.log(`${p.id}\t${p.avaliacoes||0}av ${p.nota||0}★\t${p.nome}\t[${p.categoria}]`);
