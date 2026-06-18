import { readFileSync, writeFileSync } from 'fs';
const F='src/components/funcionalidades/lugaresOSM.json';
const data=JSON.parse(readFileSync(F,'utf8'));
const P={
 1001:{foto:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Pirulito_da_Pra%C3%A7a_Sete.jpg/1280px-Pirulito_da_Pra%C3%A7a_Sete.jpg",
   galeria:["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Pirulito_da_Pra%C3%A7a_Sete_e_pr%C3%A9dios_ao_redor.jpg/1280px-Pirulito_da_Pra%C3%A7a_Sete_e_pr%C3%A9dios_ao_redor.jpg"]},
 1042:{foto:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Pra%C3%A7a_do_Papa%2C_Mangabeiras%2C_Belo_Horizonte%2C_fevereiro_de_2023_%286%29.jpg/1280px-Pra%C3%A7a_do_Papa%2C_Mangabeiras%2C_Belo_Horizonte%2C_fevereiro_de_2023_%286%29.jpg",
   galeria:["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Pra%C3%A7a_do_Papa%2C_Mangabeiras%2C_Belo_Horizonte%2C_fevereiro_de_2023_%288%29.jpg/1280px-Pra%C3%A7a_do_Papa%2C_Mangabeiras%2C_Belo_Horizonte%2C_fevereiro_de_2023_%288%29.jpg"]},
 1043:{foto:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mirante_do_Mangabeiras_-_Vista_de_BH_-_panoramio.jpg/1280px-Mirante_do_Mangabeiras_-_Vista_de_BH_-_panoramio.jpg",
   galeria:["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/P%C3%B4r-do-Sol_no_Mirante_do_Mangabeiras_%28Belo_Horizonte-MG%29.JPG/1280px-P%C3%B4r-do-Sol_no_Mirante_do_Mangabeiras_%28Belo_Horizonte-MG%29.JPG"]},
};
let n=0;
for(const p of data){if(P[p.id]){p.foto=P[p.id].foto;p.galeria=P[p.id].galeria;console.log(`${p.id}: ${p.nome} -> foto real`);n++;}}
writeFileSync(F, JSON.stringify(data,null,1));
console.log('patched',n);
