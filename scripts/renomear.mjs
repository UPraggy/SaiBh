import { readFileSync, writeFileSync } from 'fs';
const F='src/components/funcionalidades/lugaresGoogle.json';
const data=JSON.parse(readFileSync(F,'utf8'));
const nomes={
 3065:'Centro Cultural Banco do Brasil (CCBB BH)',
 3069:'Centro Cultural UFMG',
 3129:'Parque Ecológico da Pampulha',
 3137:'Museu Casa Kubitschek (Casa JK)',
 3139:'Museu Brasileiro do Futebol (Mineirão)',
};
for(const p of data){if(nomes[p.id]){console.log(`${p.id}: "${p.nome}" -> "${nomes[p.id]}"`);p.nome=nomes[p.id];}}
writeFileSync(F, JSON.stringify(data,null,1));
