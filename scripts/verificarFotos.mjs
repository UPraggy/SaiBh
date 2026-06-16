/**
 * verificarFotos.mjs
 * -----------------------------------------------------------------------------
 * Verifica (via HTTP 200) um pool generoso de fotos topicais por categoria,
 * hospedadas no CDN do Unsplash (uso livre, sem chave de API, hotlink ok).
 * Mantem apenas as URLs que respondem 200 e grava o resultado pronto para
 * ser embutido em src/components/funcionalidades/fotos.js.
 *
 * Pedido do usuario: "use fotos do google fotos, nao precisa ser apenas do
 * wikipedia" -> ou seja, nao restringir a fonte; o que importa e ter fotos
 * boas. Usamos Unsplash (gratuito, sem login/chave) com cenas topicais por
 * categoria. O card cai no icone da categoria se alguma imagem falhar.
 *
 * Rode:  node scripts/verificarFotos.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const SAIDA = resolve(__dir, 'fotos-verificadas.json')

// candidatos: ids de fotos do Unsplash por categoria (cenas topicais).
// generoso de proposito — a verificacao remove os que nao carregam.
const CANDIDATOS = {
  cafe: [
    'photo-1501339847302-ac426a4a7cbb', 'photo-1554118811-1e0d58224f24',
    'photo-1453614512568-c4024d13c247', 'photo-1521017432531-fbd92d768814',
    'photo-1559496417-e7f25cb247f3', 'photo-1442512595331-e89e73853f31',
    'photo-1559925393-8be0ec4767c8', 'photo-1495474472287-4d71bcdd2085',
    'photo-1509042239860-f550ce710b93', 'photo-1447933601403-0c6688de566e',
  ],
  restaurante: [
    'photo-1517248135467-4c7edcad34c4', 'photo-1555396273-367ea4eb4db5',
    'photo-1414235077428-338989a2e8c0', 'photo-1552566626-52f8b828add9',
    'photo-1466978913421-dad2ebd01d17', 'photo-1559339352-11d035aa65de',
    'photo-1504674900247-0877df9cc836', 'photo-1540189549336-e6e99c3679fe',
    'photo-1565299624946-b28f40a0ae38', 'photo-1424847651672-bf20a4b0982b',
  ],
  bar: [
    'photo-1514933651103-005eec06c04b', 'photo-1551024709-8f23befc6f87',
    'photo-1470337458703-46ad1756a187', 'photo-1538488881038-e252a119ace7',
    'photo-1572116469696-31de0f17cc34', 'photo-1543007630-9710e4a00a20',
    'photo-1517732306149-e8f829eb588a', 'photo-1436076863939-06870fe779c2',
  ],
  parque: [
    'photo-1441974231531-c6227db76b6e', 'photo-1502082553048-f009c37129b9',
    'photo-1500382017468-9049fed747ef', 'photo-1473448912268-2022ce9509d8',
    'photo-1416879595882-3373a0480b5b', 'photo-1426604966848-d7adac402bff',
    'photo-1509316975850-ff9c5deb0cd9', 'photo-1497250681960-ef046c08a56e',
  ],
  praca: [
    'photo-1519677100203-a0e668c92439', 'photo-1517457373958-b7bdd4587205',
    'photo-1444723121867-7a241cacace9', 'photo-1486325212027-8081e485255e',
    'photo-1480714378408-67cf0d13bc1b', 'photo-1449824913935-59a10b8d2000',
  ],
  mirante: [
    'photo-1506905925346-21bda4d32df4', 'photo-1464822759023-fed622ff2c3b',
    'photo-1470071459604-3b5ec3a7fe05', 'photo-1454496522488-7a8e488e8606',
    'photo-1501785888041-af3ef285b470', 'photo-1426604966848-d7adac402bff',
    'photo-1444930694458-01babf71870c',
  ],
  cultura: [
    'photo-1518998053901-5348d3961a04', 'photo-1503095396549-807759245b35',
    'photo-1554907984-15263bfd63bd', 'photo-1561214115-f2f134cc4912',
    'photo-1583266699597-e58da9e8f1c0', 'photo-1460661419201-fd4cecdf8a8b',
    'photo-1568667256549-094345857637', 'photo-1497005367839-6e852de72767',
  ],
  shopping: [
    'photo-1441986300917-64674bd600d8', 'photo-1567958451986-2de427a4a0be',
    'photo-1481437156560-3205f6a55735', 'photo-1567401893414-76b7b1e5a7a5',
    'photo-1555529669-e69e7aa0ba9a', 'photo-1519415510236-718bdfcd89c8',
  ],
  feira: [
    'photo-1488459716781-31db52582fe9', 'photo-1542838132-92c53300491e',
    'photo-1506617420156-8e4536971650', 'photo-1524594152303-9fd13543fe6e',
    'photo-1452251889946-8ff5ea7b27ab', 'photo-1473093295043-cdd812d0e601',
  ],
  familia: [
    'photo-1530103862676-de8c9debad1d', 'photo-1542178243-bc20204b769f',
    'photo-1503454537195-1dcabb73ffb9', 'photo-1597466599360-3b9775841aec',
    'photo-1472162072942-cd5147eb3902', 'photo-1560969184-10fe8719e047',
  ],
}

const PARAMS = '?w=800&h=520&auto=format&fit=crop&q=70'
const dorme = (ms) => new Promise((r) => setTimeout(r, ms))

async function vivo(id) {
  const url = `https://images.unsplash.com/${id}${PARAMS}`
  for (let tent = 0; tent < 2; tent++) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 15000)
    try {
      const r = await fetch(url, { method: 'GET', signal: ctrl.signal })
      clearTimeout(t)
      if (r.ok) return true
      if (r.status === 404) return false
    } catch {
      clearTimeout(t)
    }
    await dorme(400)
  }
  return false
}

async function main() {
  const verificadas = {}
  let totalOk = 0
  let totalNok = 0
  for (const [cat, ids] of Object.entries(CANDIDATOS)) {
    const ok = []
    for (const id of ids) {
      const v = await vivo(id)
      if (v) { ok.push(id); totalOk++ } else { totalNok++ }
      process.stdout.write(v ? '.' : 'x')
      await dorme(120)
    }
    verificadas[cat] = ok
    console.log(`  ${cat}: ${ok.length}/${ids.length}`)
  }
  writeFileSync(SAIDA, JSON.stringify({ params: PARAMS, categorias: verificadas }, null, 2), 'utf8')
  console.log(`\nOK: ${totalOk}  FALHA: ${totalNok}  ->  ${SAIDA}`)
  for (const [c, a] of Object.entries(verificadas)) if (a.length < 3) console.log(`  ! ATENCAO: ${c} tem so ${a.length} fotos`)
}

main().catch((e) => { console.error('FALHOU:', e.message); process.exit(1) })
