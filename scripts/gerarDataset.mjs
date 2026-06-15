/**
 * gerarDataset.mjs
 * -----------------------------------------------------------------------------
 * Pipeline de ingestao: busca ~1900 POIs reais de Belo Horizonte no
 * OpenStreetMap (Overpass API), mapeia cada um para o schema do SaiBH,
 * deduplica contra a base curada (lugaresBH.js) e grava lugaresOSM.json.
 *
 * Regra de notas (decisao do usuario): "So os curados tem estrela".
 *   - Lugares curados: nota real (0-5) + avaliacoes.
 *   - Lugares do OSM:  nota = null, avaliacoes = 0, e um `qualidade` (0-100)
 *                      ESTIMADO a partir da completude dos dados do OSM.
 *
 * Fonte: OpenStreetMap, sob licenca ODbL. Atribuicao exibida no Rodape.
 *
 * Rode:  node scripts/gerarDataset.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import LugaresBH from '../src/components/funcionalidades/lugaresBH.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const SAIDA = resolve(__dir, '../src/components/funcionalidades/lugaresOSM.json')

// ---------------------------------------------------------------------------
// 1) Consulta Overpass (mesma do probe, comprovada: ~1904 lugares com nome)
//    montarQuery(area) permite reusar a mesma busca para BH e para os
//    municipios da Regiao Metropolitana (usado por expandirDataset.mjs).
// ---------------------------------------------------------------------------
export function montarQuery(area = 'Belo Horizonte') {
  return `
[out:json][timeout:240];
area["name"="${area}"]["admin_level"="8"]->.bh;
(
  nwr["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park|artwork|aquarium"](area.bh);
  nwr["leisure"~"park|garden|nature_reserve|stadium"](area.bh);
  nwr["amenity"~"restaurant|cafe|bar|pub|ice_cream|fast_food|theatre|cinema|marketplace"](area.bh);
  nwr["shop"~"mall|bakery"](area.bh);
  nwr["historic"](area.bh);
);
out tags center;
`
}

const QUERY = montarQuery('Belo Horizonte')

// endpoints Overpass com failover automatico (rate-limit / queda)
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

// timeout por tentativa: endpoints da Overpass as vezes ficam pendurados sem
// responder. fetch do Node nao tem timeout padrao curto, entao usamos
// AbortController para cortar em TIMEOUT_MS e cair pro proximo endpoint.
const TIMEOUT_MS = 30000

export async function buscarOSM(query = QUERY) {
  let ultimoErro
  for (const url of ENDPOINTS) {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SaiBH/1.0 (projeto de estudo; contato rafaelmoreira2001ofc@gmail.com)',
        },
        body: 'data=' + encodeURIComponent(query),
        signal: ctrl.signal,
      })
      if (!r.ok) throw new Error(`Overpass HTTP ${r.status}: ${(await r.text()).slice(0, 160)}`)
      const j = await r.json()
      return (j.elements || []).filter((e) => e.tags && e.tags.name)
    } catch (e) {
      ultimoErro = e
      const motivo = e.name === 'AbortError' ? `timeout ${TIMEOUT_MS}ms` : e.message
      console.warn(`  ! endpoint falhou (${url.split('/')[2]}): ${motivo}`)
    } finally {
      clearTimeout(t)
    }
  }
  throw ultimoErro || new Error('Todos os endpoints Overpass falharam')
}

// ---------------------------------------------------------------------------
// 2) Mapeamento OSM -> as 12 categorias do app
// ---------------------------------------------------------------------------
function mapCategoria(t) {
  if (t.tourism === 'viewpoint') return 'mirante'
  if (['museum', 'gallery', 'artwork'].includes(t.tourism)) return 'cultura'
  if (['zoo', 'theme_park', 'aquarium'].includes(t.tourism)) return 'familia'
  if (t.tourism === 'attraction') return 'familia'
  if (['park', 'garden', 'nature_reserve'].includes(t.leisure)) return 'parque'
  if (t.leisure === 'stadium') return 'familia'
  if (t.amenity === 'restaurant') return 'restaurante'
  if (t.amenity === 'fast_food') return 'restaurante'
  if (['cafe', 'ice_cream'].includes(t.amenity)) return 'cafe'
  if (['bar', 'pub'].includes(t.amenity)) return 'bar'
  if (['theatre', 'cinema'].includes(t.amenity)) return 'cultura'
  if (t.amenity === 'marketplace') return 'feira'
  if (t.shop === 'mall') return 'shopping'
  if (t.shop === 'bakery') return 'cafe'
  if (t.historic) return 'cultura'
  return null
}

// caracteristicas padrao por categoria (quando o OSM nao informa)
const AMBIENTE = {
  parque: 'aberto', praca: 'aberto', mirante: 'aberto', feira: 'aberto',
  cultura: 'fechado', cafe: 'fechado', restaurante: 'fechado', bar: 'fechado',
  shopping: 'fechado', mercado: 'misto', familia: 'misto', regiao: 'misto',
}
const CUSTO = {
  parque: 'gratis', praca: 'gratis', mirante: 'gratis', feira: 'gratis',
  cultura: 'barato', cafe: 'barato', restaurante: 'medio', bar: 'medio',
  shopping: 'barato', mercado: 'barato', familia: 'barato', regiao: 'barato',
}
const COM_COMIDA = new Set(['cafe', 'restaurante', 'bar', 'shopping', 'feira', 'mercado'])
const BEBE_OK = new Set(['parque', 'praca', 'mirante', 'cultura', 'cafe', 'restaurante', 'shopping', 'familia', 'feira', 'mercado'])
const PESSOAS = {
  bar: { min: 2, max: 12 }, restaurante: { min: 1, max: 8 }, cafe: { min: 1, max: 6 },
  parque: { min: 1, max: 20 }, praca: { min: 1, max: 20 }, mirante: { min: 1, max: 8 },
  shopping: { min: 1, max: 10 }, cultura: { min: 1, max: 10 }, feira: { min: 1, max: 12 },
  mercado: { min: 1, max: 8 }, familia: { min: 1, max: 12 }, regiao: { min: 1, max: 12 },
}
const PRECO = {
  gratis: { precoMedio: 0, faixaPreco: 'Grátis' },
  barato: { precoMedio: 25, faixaPreco: 'R$ 10–40' },
  medio: { precoMedio: 60, faixaPreco: 'R$ 40–90' },
  caro: { precoMedio: 120, faixaPreco: 'R$ 100+' },
}
const PERIODOS_PADRAO = {
  parque: ['manha', 'tarde'], praca: ['manha', 'tarde', 'noite'], mirante: ['tarde', 'noite'],
  cultura: ['manha', 'tarde'], cafe: ['manha', 'tarde'], restaurante: ['tarde', 'noite'],
  bar: ['noite'], shopping: ['tarde', 'noite'], feira: ['manha', 'tarde'],
  mercado: ['manha', 'tarde'], familia: ['manha', 'tarde'], regiao: ['manha', 'tarde'],
}

// ---------------------------------------------------------------------------
// 3) Parser de opening_hours (subset do padrao OSM) -> {0..6:{abre,fecha}|null}
// ---------------------------------------------------------------------------
const DIA_NUM = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 }
const pad = (hhmm) => {
  const [h, m] = hhmm.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}
const cap = (s) => s.slice(0, 1).toUpperCase() + s.slice(1, 2).toLowerCase()

function parseOpeningHours(oh) {
  if (!oh) return null
  oh = oh.trim()
  if (/^24\/7$/.test(oh)) {
    const o = {}
    for (let i = 0; i < 7; i++) o[i] = { abre: '00:00', fecha: '23:59' }
    return o
  }
  const res = {}
  let achou = false
  for (let regra of oh.split(';')) {
    regra = regra.trim()
    if (!regra || /\b(off|closed|PH|SH)\b/i.test(regra)) continue
    const m = regra.match(/^([A-Za-z0-9,\- ]*?)\s*((?:\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*,?\s*)+)$/)
    if (!m) continue
    const diasParte = m[1].trim()
    const faixas = [...m[2].matchAll(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g)]
    if (!faixas.length) continue
    const abre = pad(faixas[0][1])
    const fecha = pad(faixas[faixas.length - 1][2])

    let dias = []
    if (!diasParte) {
      dias = [0, 1, 2, 3, 4, 5, 6]
    } else {
      for (const parte of diasParte.split(',')) {
        const p = parte.trim()
        const intervalo = p.match(/^([A-Za-z]{2})\s*-\s*([A-Za-z]{2})$/)
        if (intervalo) {
          const a = DIA_NUM[cap(intervalo[1])]
          const b = DIA_NUM[cap(intervalo[2])]
          if (a === undefined || b === undefined) continue
          let i = a
          for (let guard = 0; guard < 8; guard++) {
            dias.push(i)
            if (i === b) break
            i = (i + 1) % 7
          }
        } else {
          const d = DIA_NUM[cap(p)]
          if (d !== undefined) dias.push(d)
        }
      }
    }
    for (const d of dias) {
      achou = true
      if (!res[d]) res[d] = { abre, fecha }
      else {
        if (abre < res[d].abre) res[d].abre = abre
        if (fecha > res[d].fecha) res[d].fecha = fecha
      }
    }
  }
  return achou ? res : null
}

const semanaToda = (abre, fecha) => {
  const o = {}
  for (let i = 0; i < 7; i++) o[i] = { abre, fecha }
  return o
}
function horariosPadrao(cat) {
  if (['parque', 'praca', 'mirante'].includes(cat)) return semanaToda('06:00', '22:00')
  if (cat === 'cafe') return semanaToda('07:00', '19:00')
  if (cat === 'restaurante') return semanaToda('11:00', '23:00')
  if (cat === 'bar') return semanaToda('17:00', '23:59')
  if (cat === 'shopping') return semanaToda('10:00', '22:00')
  if (cat === 'cultura') return semanaToda('09:00', '18:00')
  if (cat === 'feira' || cat === 'mercado') return semanaToda('07:00', '17:00')
  return semanaToda('09:00', '18:00')
}
function completarHorarios(parsed) {
  const o = {}
  for (let i = 0; i < 7; i++) o[i] = parsed[i] || null
  return o
}

const dec = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h + m / 60
}
function periodosDe(horarios) {
  const faixa = { manha: [6, 12], tarde: [12, 18], noite: [18, 24] }
  const set = new Set()
  for (let i = 0; i < 7; i++) {
    const h = horarios[i]
    if (!h) continue
    let a = dec(h.abre)
    let f = dec(h.fecha)
    if (f <= a) f += 24
    for (const [p, [lo, hi]] of Object.entries(faixa)) if (a < hi && f > lo) set.add(p)
  }
  return [...set]
}

// ---------------------------------------------------------------------------
// 4) Campos derivados
// ---------------------------------------------------------------------------
const LABEL = LugaresBH.categorias
function regiaoDe(t) {
  return (
    t['addr:suburb'] ||
    t['addr:neighbourhood'] ||
    t['addr:city_district'] ||
    t['addr:district'] ||
    'Belo Horizonte'
  )
}
function enderecoDe(t) {
  const rua = t['addr:street']
  const num = t['addr:housenumber']
  const bairro = t['addr:suburb'] || t['addr:neighbourhood']
  const partes = []
  if (rua) partes.push(num ? `${rua}, ${num}` : rua)
  if (bairro) partes.push(bairro)
  return partes.join(' · ') || 'Belo Horizonte – MG'
}
const SINGULAR = {
  parque: 'Parque', praca: 'Praça', mirante: 'Mirante', cultura: 'Espaço cultural',
  cafe: 'Café/padaria', restaurante: 'Restaurante', bar: 'Bar', feira: 'Feira',
  mercado: 'Mercado', familia: 'Passeio em família', shopping: 'Shopping', regiao: 'Passeio',
}
function descricaoDe(cat, t) {
  const tipo = SINGULAR[cat] || 'Lugar'
  const culin = t.cuisine ? ` de ${t.cuisine.split(';')[0].replace(/_/g, ' ')}` : ''
  const bairro = regiaoDe(t)
  return `${tipo}${culin} em ${bairro}, Belo Horizonte. Ponto mapeado na comunidade OpenStreetMap.`
}
function qualidadeDe(t) {
  let q = 52
  if (t.website || t['contact:website']) q += 12
  if (t.opening_hours) q += 10
  if (t.phone || t['contact:phone']) q += 6
  if (t['addr:street']) q += 5
  if (t.cuisine) q += 4
  if (t.wikidata || t.wikipedia) q += 9
  if (t.outdoor_seating === 'yes') q += 2
  return Math.min(100, q)
}
function tagsDe(cat, t) {
  const out = [LABEL[cat]?.label].filter(Boolean)
  if (t.cuisine) out.push(...t.cuisine.split(';').slice(0, 2).map((c) => c.replace(/_/g, ' ')))
  if (t.outdoor_seating === 'yes') out.push('área externa')
  if (t['wheelchair'] === 'yes') out.push('acessível')
  return [...new Set(out)].slice(0, 4)
}

// ---------------------------------------------------------------------------
// 5) Normalizacao p/ dedup
// ---------------------------------------------------------------------------
export function normNome(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// 6) Pipeline
// ---------------------------------------------------------------------------
export function transformar(el) {
  const t = el.tags
  const cat = mapCategoria(t)
  if (!cat) return null

  const lat = el.lat ?? el.center?.lat ?? null
  const lng = el.lon ?? el.center?.lon ?? null
  if (lat === null || lng === null) return null

  const parsed = parseOpeningHours(t.opening_hours)
  const horarios = parsed ? completarHorarios(parsed) : horariosPadrao(cat)
  let periodos = periodosDe(horarios)
  if (periodos.length === 0) periodos = PERIODOS_PADRAO[cat] || ['tarde']

  // custo: fast_food e mais barato que restaurante comum
  let custo = CUSTO[cat]
  if (t.amenity === 'fast_food') custo = 'barato'
  if (cat === 'cultura' && (t.fee === 'no' || t.historic)) custo = 'gratis'

  const ambiente = AMBIENTE[cat] || 'misto'
  const bebe = BEBE_OK.has(cat)

  return {
    id: 0, // preenchido depois
    curado: false,
    fonte: 'osm',
    foto: null,
    nome: t.name,
    categoria: cat,
    regiao: regiaoDe(t),
    endereco: enderecoDe(t),
    descricao: descricaoDe(cat, t),
    custo,
    ...PRECO[custo],
    temComida: COM_COMIDA.has(cat),
    ambiente,
    bebe,
    bebeObs: '',
    periodos,
    horarios,
    nota: null, // OSM nao tem estrela (decisao do usuario)
    qualidade: qualidadeDe(t),
    avaliacoes: 0,
    idealPessoas: PESSOAS[cat] || { min: 1, max: 10 },
    tags: tagsDe(cat, t),
    motivo: '',
    destaqueHoje: false,
    website: t.website || t['contact:website'] || null,
    telefone: t.phone || t['contact:phone'] || null,
    lat,
    lng,
  }
}

async function main() {
  console.log('Buscando POIs de BH no OpenStreetMap (Overpass)…')
  const elementos = await buscarOSM()
  console.log(`Recebidos ${elementos.length} elementos com nome.`)

  // nomes curados (para nao duplicar)
  const curadosNorm = new Set(LugaresBH.lista.map((l) => normNome(l.nome)))

  const vistos = new Set() // dedup interno: nome normalizado + coord arredondada
  const lugares = []
  let proxId = 1000
  let descartados = 0
  let dupCurado = 0
  let dupInterno = 0

  for (const el of elementos) {
    const lugar = transformar(el)
    if (!lugar) {
      descartados++
      continue
    }
    const nn = normNome(lugar.nome)
    if (!nn) {
      descartados++
      continue
    }
    if (curadosNorm.has(nn)) {
      dupCurado++
      continue
    }
    const chave = `${nn}@${lugar.lat.toFixed(3)},${lugar.lng.toFixed(3)}`
    if (vistos.has(chave)) {
      dupInterno++
      continue
    }
    vistos.add(chave)
    lugar.id = proxId++
    lugares.push(lugar)
  }

  // estatisticas
  const porCat = {}
  for (const l of lugares) porCat[l.categoria] = (porCat[l.categoria] || 0) + 1
  const comHorarioReal = elementos.filter((e) => e.tags.opening_hours).length

  writeFileSync(SAIDA, JSON.stringify(lugares, null, 0), 'utf8')

  console.log('\n================  RESULTADO  ================')
  console.log(`Gravados:        ${lugares.length} lugares  ->  ${SAIDA}`)
  console.log(`Descartados:     ${descartados} (sem categoria/coord/nome)`)
  console.log(`Dup. curados:    ${dupCurado}`)
  console.log(`Dup. internos:   ${dupInterno}`)
  console.log(`Com horario real (OSM): ${comHorarioReal}`)
  console.log(`Curados (estrela real): ${LugaresBH.lista.length}`)
  console.log(`TOTAL no app:    ${LugaresBH.lista.length + lugares.length}`)
  console.log('\nPor categoria:')
  Object.entries(porCat)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(5)}  ${k}`))
}

// so roda main() quando executado direto (node scripts/gerarDataset.mjs),
// nao quando importado por expandirDataset.mjs.
const ESTE = resolve(fileURLToPath(import.meta.url))
const INVOCADO = process.argv[1] ? resolve(process.argv[1]) : ''
if (ESTE === INVOCADO) {
  main().catch((e) => {
    console.error('FALHOU:', e.message)
    process.exit(1)
  })
}

// reaproveitado pelo expandirDataset.mjs
export { LugaresBH }
