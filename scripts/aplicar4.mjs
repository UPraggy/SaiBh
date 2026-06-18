import { readFileSync, writeFileSync } from 'fs';
const F='src/components/funcionalidades/lugaresBH.js';
let src=readFileSync(F,'utf8');
const data={
 15:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Caff%C3%A8_espresso_Specialty_Arabica_variet%C3%A0_Heirloom_originaria_di_Chelbesa_Gedeb_in_Etiopia_a_Milano.jpg/1280px-Caff%C3%A8_espresso_Specialty_Arabica_variet%C3%A0_Heirloom_originaria_di_Chelbesa_Gedeb_in_Etiopia_a_Milano.jpg',
     g:['https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Red_Rock_Coffee_Specialty_Drinks.jpg/1280px-Red_Rock_Coffee_Specialty_Drinks.jpg']},
 16:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Mercado_Novo_de_Belo_Horizonte.jpg/1280px-Mercado_Novo_de_Belo_Horizonte.jpg',
     g:['https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Mercado_Novo_em_BH_01.jpg/1280px-Mercado_Novo_em_BH_01.jpg']},
 23:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Almo%C3%A7o_em_Ouro_Preto.jpg/1280px-Almo%C3%A7o_em_Ouro_Preto.jpg',
     g:['https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Feij%C3%A3o_tropeiro.jpg/1280px-Feij%C3%A3o_tropeiro.jpg']},
 24:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vista_parcial_da_Savassi%2C_Belo_Horizonte_MG2.JPG/1280px-Vista_parcial_da_Savassi%2C_Belo_Horizonte_MG2.JPG',
     g:['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/P%C3%B4r_do_sol_na_Savassi%2C_Belo_Horizonte_MG.JPG/1280px-P%C3%B4r_do_sol_na_Savassi%2C_Belo_Horizonte_MG.JPG']},
};
for(const [id,{c,g}] of Object.entries(data)){
  const at=src.indexOf(`id: ${id},`);
  if(at<0){console.log(`id ${id} NOT FOUND`);continue;}
  const m=src.slice(at).match(/\n([ \t]*)foto:\s*null\s*,/);
  if(!m){console.log(`id ${id}: foto:null not found`);continue;}
  const ind=m[1];
  const rep=`\n${ind}foto: "${c}",\n${ind}galeria: [${g.map(u=>`"${u}"`).join(', ')}],`;
  src=src.slice(0,at)+src.slice(at).replace(m[0],rep);
  console.log(`id ${id}: patched`);
}
writeFileSync(F,src);
