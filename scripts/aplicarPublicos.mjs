import { readFileSync, writeFileSync } from 'fs';
const F='src/components/funcionalidades/lugaresGoogle.json';
const data=JSON.parse(readFileSync(F,'utf8'));
const fotos={
 3065:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Centro_Cultural_Banco_do_Brasil%2C_Belo_Horizonte_-_panoramio.jpg/1280px-Centro_Cultural_Banco_do_Brasil%2C_Belo_Horizonte_-_panoramio.jpg',
       g:['https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Centro_Cultural_Banco_do_Brasil_-_Belo_Horizonte_%2814104071681%29.jpg/1280px-Centro_Cultural_Banco_do_Brasil_-_Belo_Horizonte_%2814104071681%29.jpg']},
 3069:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Centro_Cultural_da_UFMG_-_Belo_Horizonte_-_20250902125033.jpg/1280px-Centro_Cultural_da_UFMG_-_Belo_Horizonte_-_20250902125033.jpg',g:[]},
 3128:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Casa_do_Baile_-_Pampulha_BH.jpg/1280px-Casa_do_Baile_-_Pampulha_BH.jpg',
       g:['https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Casa_do_Baile_2.jpg/1280px-Casa_do_Baile_2.jpg']},
 3129:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/PedroVilela_Lagoa_da_Pampulha_Belo_Horizonte_MG_%2840158074024%29.jpg/1280px-PedroVilela_Lagoa_da_Pampulha_Belo_Horizonte_MG_%2840158074024%29.jpg',
       g:['https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Por_do_sol_Lagoa_da_Pampulha_Belo_Horizonte.jpg/1280px-Por_do_sol_Lagoa_da_Pampulha_Belo_Horizonte.jpg']},
 3137:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Museu_Casa_Kubitschek.jpg/1280px-Museu_Casa_Kubitschek.jpg',
       g:['https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Museu_Casa_Kubitschek_na_Pampulha.jpg/1280px-Museu_Casa_Kubitschek_na_Pampulha.jpg']},
 3139:{c:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Mineir%C3%A3o_%28Est%C3%A1dio_Governador_Magalh%C3%A3es_Pinto%29.jpg/1280px-Mineir%C3%A3o_%28Est%C3%A1dio_Governador_Magalh%C3%A3es_Pinto%29.jpg',
       g:['https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Est%C3%A1dio_Governador_Magalh%C3%A3es_Pinto_-_Belo_Horizonte_-_20250409150611.jpg/1280px-Est%C3%A1dio_Governador_Magalh%C3%A3es_Pinto_-_Belo_Horizonte_-_20250409150611.jpg']},
};
let n=0;
for(const p of data){
  const f=fotos[p.id];
  if(!f)continue;
  p.foto=f.c;
  if(f.g.length)p.galeria=f.g;
  n++; console.log(`id ${p.id}: ${p.nome} -> foto real`);
}
writeFileSync(F, JSON.stringify(data,null,1));
console.log('patched',n,'entries');
