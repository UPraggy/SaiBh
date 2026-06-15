/**
 * expandirDataset.mjs
 * -----------------------------------------------------------------------------
 * Expande a base do SaiBH de forma ADITIVA e segura:
 *
 *  1. Mantem tudo que ja existe em lugaresOSM.json (ids estaveis).
 *  2. Busca POIs reais em Belo Horizonte + municipios da Regiao Metropolitana
 *     (RMBH) no OpenStreetMap via Overpass, reusando o pipeline de
 *     gerarDataset.mjs (mesmo schema, mesmas categorias, mesma estimativa de
 *     qualidade).
 *  3. Deduplica contra: (a) curados, (b) OSM ja existente, (c) o que veio
 *     nesta mesma rodada — por nome normalizado + coordenada arredondada.
 *  4. Acrescenta apenas os INEDITOS, com ids continuando do maior id atual.
 *  5. Nunca cria estrela em lugar de OSM (nota = null) e nunca toca nos curados.
 *  6. Grava lugaresOSM.json e um relatorio em scripts/relatorio-expansao.json.
 *
 * Regiao = "Belo Horizonte e regiao" (escopo do projeto). Fonte: OpenStreetMap
 * (ODbL) — atribuicao exibida no Rodape.
 *
 * Rode:  node scripts/expandirDataset.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { montarQuery, buscarOSM, transformar, normNome, LugaresBH } from './gerarDataset.mjs'

const __dir = dirname(fileURLToPath(import.meta.url))
const SAIDA = resolve(__dir, '../src/components/funcionalidades/lugaresOSM.json')
const RELATORIO = resolve(__dir, 'relatorio-expansao.json')

// Belo Horizonte + Regiao Metropolitana (RMBH) — municipios com nome exato no OSM.
// Ordem: BH primeiro (ja deve estar na base), depois a regiao para expandir.
const MUNICIPIOS = [
  'Belo Horizonte',
  'Contagem',
  'Betim',
  'Nova Lima',
  'Sabará',
  'Santa Luzia',
  'Ribeirão das Neves',
  'Ibirité',
  'Vespasiano',
  'Lagoa Santa',
  'Pedro Leopoldo',
  'Brumadinho',
  'Caeté',
  'Raposos',
  'Confins',
  'São José da Lapa',
  'Mateus Leme',
  'Igarapé',
  'Esmeraldas',
  'Sarzedo',
]

const dorme = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  // ---- 1) carrega base atual --------------------------------------------
  const atuais = JSON.parse(readFileSync(SAIDA, 'utf8'))
  console.log(`Base OSM atual: ${atuais.length} lugares.`)

  const curadosNorm = new Set(LugaresBH.lista.map((l) => normNome(l.nome)))

  // chaves ja ocupadas (curados + OSM existente) p/ dedup
  const vistos = new Set()
  for (const l of atuais) {
    const nn = normNome(l.nome)
    if (l.lat != null && l.lng != null) vistos.add(`${nn}@${l.lat.toFixed(3)},${l.lng.toFixed(3)}`)
    vistos.add(nn) // tambem por nome puro (pega rede de lojas em coords diferentes? nao — so nome+coord; nome puro e fraco)
  }
  // recomeca: dedup forte por nome+coord, fraco so contra curados por nome
  vistos.clear()
  for (const l of atuais) {
    if (l.lat != null && l.lng != null) {
      vistos.add(`${normNome(l.nome)}@${l.lat.toFixed(3)},${l.lng.toFixed(3)}`)
    }
  }

  let proxId = atuais.reduce((m, l) => Math.max(m, l.id || 0), 999) + 1

  const novos = []
  const porMunicipio = {}
  const porCategoria = {}
  let dupCurado = 0
  let dupExistente = 0
  let descartados = 0

  // ---- 2) varre cada municipio ------------------------------------------
  for (const mun of MUNICIPIOS) {
    process.stdout.write(`\n[${mun}] buscando… `)
    let elementos
    try {
      elementos = await buscarOSM(montarQuery(mun))
    } catch (e) {
      console.warn(`FALHOU (${e.message}) — pulando municipio.`)
      continue
    }
    console.log(`${elementos.length} elementos com nome.`)

    let addMun = 0
    for (const el of elementos) {
      const lugar = transformar(el)
      if (!lugar) { descartados++; continue }
      const nn = normNome(lugar.nome)
      if (!nn) { descartados++; continue }
      if (curadosNorm.has(nn)) { dupCurado++; continue }
      const chave = `${nn}@${lugar.lat.toFixed(3)},${lugar.lng.toFixed(3)}`
      if (vistos.has(chave)) { dupExistente++; continue }
      vistos.add(chave)
      lugar.id = proxId++
      // marca o municipio na regiao quando o OSM nao trouxe bairro proprio
      if (lugar.regiao === 'Belo Horizonte' && mun !== 'Belo Horizonte') lugar.regiao = mun
      lugar.municipio = mun
      novos.push(lugar)
      porCategoria[lugar.categoria] = (porCategoria[lugar.categoria] || 0) + 1
      addMun++
    }
    porMunicipio[mun] = addMun
    console.log(`  + ${addMun} ineditos (acumulado novo: ${novos.length})`)

    await dorme(1200) // gentileza com a Overpass (evita rate-limit)
  }

  // ---- 3) grava base expandida ------------------------------------------
  const final = [...atuais, ...novos]
  writeFileSync(SAIDA, JSON.stringify(final, null, 0), 'utf8')

  const relatorio = {
    geradoEm: new Date().toISOString(),
    fonte: 'OpenStreetMap (Overpass) — ODbL',
    escopo: 'Belo Horizonte + Regiao Metropolitana (RMBH)',
    baseAnterior: atuais.length,
    adicionados: novos.length,
    totalOSM: final.length,
    curados: LugaresBH.lista.length,
    descartados,
    dupCurado,
    dupExistente,
    porMunicipio,
    porCategoria,
  }
  writeFileSync(RELATORIO, JSON.stringify(relatorio, null, 2), 'utf8')

  console.log('\n================  EXPANSAO CONCLUIDA  ================')
  console.log(`Base anterior:   ${atuais.length}`)
  console.log(`Adicionados:     ${novos.length}`)
  console.log(`Total OSM agora: ${final.length}`)
  console.log(`Dup. curados:    ${dupCurado}`)
  console.log(`Dup. existentes: ${dupExistente}`)
  console.log(`Descartados:     ${descartados}`)
  console.log('\nNovos por municipio:')
  Object.entries(porMunicipio)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(5)}  ${k}`))
  console.log('\nNovos por categoria:')
  Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(5)}  ${k}`))
  console.log(`\nRelatorio: ${RELATORIO}`)
}

main().catch((e) => {
  console.error('FALHOU:', e.message)
  process.exit(1)
})
