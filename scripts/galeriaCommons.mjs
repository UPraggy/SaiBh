/**
 * galeriaCommons.mjs
 * -----------------------------------------------------------------------------
 * "Mais fotos": para cada lugar CURADO, busca no Wikimedia Commons (API pública,
 * sem chave) fotos REAIS adicionais do local, para montar uma galeria no
 * lightbox do card. Diferente do pool ilustrativo do Unsplash (fotos.js), aqui
 * são imagens do PRÓPRIO ponto — por isso ampliáveis e sem selo "ilustrativa".
 *
 * Estratégia: generator=search no namespace de Arquivos (6), pegando imageinfo
 * com thumburl 1280px. Filtra para JPEG/PNG largos (>=900px), descarta mapas,
 * plantas, brasões e SVGs. Grava CANDIDATOS para curadoria manual antes de
 * embutir em lugaresBH.js — não confiamos cegamente no ranking de busca.
 *
 * Rode:  node scripts/galeriaCommons.mjs
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const SAIDA = resolve(__dir, 'galeria-candidatos.json')

const API = 'https://commons.wikimedia.org/w/api.php'

// Termos de busca por id de lugar curado (nome do landmark + cidade quando ajuda).
const TERMOS = {
  1: 'Praça do Papa Belo Horizonte',
  2: 'Mirante das Mangabeiras Belo Horizonte',
  3: 'Praça da Liberdade Belo Horizonte',
  4: 'Praça da Assembleia Belo Horizonte',
  6: 'Parque das Mangabeiras Belo Horizonte',
  7: 'Parque Municipal Belo Horizonte',
  8: 'Igreja São Francisco de Assis Pampulha',
  9: 'Parque Lagoa do Nado Belo Horizonte',
  10: 'Estádio Mineirão Belo Horizonte',
  11: 'CCBB Belo Horizonte',
  12: 'Praça da Liberdade museu Belo Horizonte',
  13: 'Museu de Artes e Ofícios Belo Horizonte',
  17: 'Mercado Central Belo Horizonte',
  20: 'Savassi Belo Horizonte',
  21: 'Viaduto Santa Tereza Belo Horizonte',
  25: 'Zoológico Belo Horizonte',
  28: 'BH Shopping Belo Horizonte',
  29: 'Inhotim Brumadinho',
  30: 'Centro Histórico Sabará',
  32: 'Praça da Estação Belo Horizonte',
}

const ehJunk = (t) => /\b(map|mapa|plant|brasão|brasao|coat of arms|logo|svg|seal|flag|bandeira|diagram|gpx)\b/i.test(t)

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

async function buscar(termo) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*',
    generator: 'search', gsrsearch: termo, gsrnamespace: '6', gsrlimit: '12',
    prop: 'imageinfo', iiprop: 'url|mime|size', iiurlwidth: '1280',
  })
  // backoff em 429 (rate limit do Commons)
  let r
  for (let tent = 0; tent < 5; tent++) {
    r = await fetch(`${API}?${params}`, { headers: { 'User-Agent': 'SaiBH/1.0 (galeria curada; contato rafaelmoreira2001ofc@gmail.com)' } })
    if (r.status !== 429) break
    await dormir(2000 * (tent + 1))
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const j = await r.json()
  const pages = j?.query?.pages ? Object.values(j.query.pages) : []
  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0]
      if (!ii) return null
      return { title: p.title, mime: ii.mime, width: ii.width, thumburl: ii.thumburl, url: ii.url }
    })
    .filter(Boolean)
    .filter((c) => /image\/(jpeg|png)/.test(c.mime) && (c.width || 0) >= 900 && !ehJunk(c.title))
    .slice(0, 8)
}

// resumível: aproveita candidatos já obtidos numa execução anterior
const out = existsSync(SAIDA) ? JSON.parse(readFileSync(SAIDA, 'utf8')) : {}
for (const [id, termo] of Object.entries(TERMOS)) {
  if (out[id]?.candidatos?.length) { console.log(`#${id} já ok (${out[id].candidatos.length}) — pulando`); continue }
  try {
    const cands = await buscar(termo)
    out[id] = { termo, candidatos: cands }
    console.log(`#${id} ${termo} -> ${cands.length} candidatos`)
  } catch (e) {
    out[id] = { termo, erro: String(e), candidatos: [] }
    console.error(`#${id} FALHOU: ${e}`)
  }
  writeFileSync(SAIDA, JSON.stringify(out, null, 2)) // grava incremental (não perde progresso)
  await dormir(1500) // gentil com a API
}

writeFileSync(SAIDA, JSON.stringify(out, null, 2))
console.log(`\nGravado em ${SAIDA}`)
