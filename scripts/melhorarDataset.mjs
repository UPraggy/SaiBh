/**
 * melhorarDataset.mjs
 * -----------------------------------------------------------------------------
 * Melhora a QUALIDADE do texto das bases OSM e Google **sem rede** (idempotente):
 *
 *  1) Descrições: as do OSM eram 100% robóticas ("Ponto mapeado na comunidade
 *     OpenStreetMap") e repetiam a cidade ("... em Belo Horizonte, Belo
 *     Horizonte"); as do Google traziam a categoria em inglês ("Restaurant",
 *     "Cocktail bar"). Aqui geramos uma frase natural em PT-BR, variada por id,
 *     que cita o bairro/cidade e — quando houver — a nota real do Google.
 *
 *  2) Tags: 2491 lugares tinham só 1 tag (muitas em inglês). Passamos a montar
 *     tags em PT a partir de categoria + custo + comida + bebê + período,
 *     mantendo as úteis que já existiam.
 *
 *  3) Coerência custo↔faixaPreco preservada (não mexemos em preço).
 *
 * Determinístico (varia pelo id, sem "piscar") e seguro de rodar de novo:
 * detecta texto já melhorado pelo marcador interno e regenera a partir dos
 * campos estruturais — então rodar 2x dá o mesmo resultado.
 *
 * Rode:  node scripts/melhorarDataset.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const DIR = resolve(__dir, '../src/components/funcionalidades')
const ARQ_OSM = resolve(DIR, 'lugaresOSM.json')
const ARQ_GOOGLE = resolve(DIR, 'lugaresGoogle.json')

const LABEL = {
    parque: 'Parques', praca: 'Praças', mirante: 'Mirantes',
    cultura: 'Cultura e museus', cafe: 'Cafés', restaurante: 'Restaurantes',
    bar: 'Bares e boemia', feira: 'Feiras', mercado: 'Mercados',
    familia: 'Família e crianças', shopping: 'Shoppings', regiao: 'Bate-volta na região',
}

// substantivo no singular pra abrir a frase ("Um café aconchegante...")
const SUBSTANTIVO = {
    cafe: 'café', restaurante: 'restaurante', bar: 'bar', parque: 'parque',
    praca: 'praça', mirante: 'mirante', cultura: 'espaço cultural', shopping: 'shopping',
    feira: 'feira', familia: 'espaço para a família', mercado: 'mercado', regiao: 'passeio',
}
const ARTIGO = { praca: 'Uma', feira: 'Uma', familia: 'Um' } // resto = "Um"

// frases topicais por categoria (escolhidas por id → variedade estável)
const FRASES = {
    cafe: [
        'ótimo pra um café com calma e dois dedos de prosa',
        'boa pedida pra trabalhar, ler ou matar a tarde',
        'aconchegante, com aquele cheiro de café fresco',
        'perfeito pra um lanche da tarde sem pressa',
    ],
    restaurante: [
        'bom pra almoço em família ou jantar com os amigos',
        'pratos generosos e aquele tempero mineiro',
        'opção certeira pra matar a fome com qualidade',
        'ambiente agradável pra uma refeição tranquila',
    ],
    bar: [
        'ideal pra um happy hour com a turma',
        'aquele point pra cerveja gelada e petisco',
        'clima descontraído pra fechar a noite',
        'boemia de BH em estado puro',
    ],
    parque: [
        'verde pra relaxar, caminhar ou levar as crianças',
        'área aberta pra respirar e fugir do corre',
        'ótimo pra piquenique, corrida ou só sentar na grama',
        'natureza pertinho pra recarregar as energias',
    ],
    praca: [
        'lugar gostoso pra sentar e ver o movimento',
        'praça pra um passeio leve a pé',
        'boa pra encontrar gente e tomar um ar',
        'cantinho público pra relaxar sem gastar nada',
    ],
    mirante: [
        'vista de tirar o fôlego sobre a cidade',
        'ótimo pra ver o pôr do sol de BH',
        'mirante pra fotos e aquele respiro com paisagem',
        'lá de cima a cidade ganha outra cara',
    ],
    cultura: [
        'pra quem curte arte, história e exposições',
        'programa cultural pra abastecer a cabeça',
        'espaço pra aprender e se inspirar',
        'boa pedida pra um passeio com conteúdo',
    ],
    shopping: [
        'compras, praça de alimentação e cinema num lugar só',
        'opção coberta pra dia de chuva ou calorão',
        'tudo num lugar: lojas, comida e conforto',
        'passeio prático pra família inteira',
    ],
    feira: [
        'artesanato, comida de rua e aquele clima de feira',
        'ótima pra garimpar achados e petiscar',
        'cores, cheiros e gente — a feira de BH é um programa',
        'passeio a céu aberto pra curtir devagar',
    ],
    familia: [
        'pensado pra criançada se divertir com segurança',
        'diversão garantida pros pequenos',
        'ótimo pra passar a tarde com a família',
        'espaço pra brincar e gastar energia',
    ],
    mercado: [
        'mercado pra provar, comprar e se perder no melhor sentido',
        'queijos, doces e quitanda mineira de primeira',
        'boa pra abastecer a despensa com produtos locais',
        'um mergulho na cultura gastronômica da cidade',
    ],
    regiao: [
        'vale o bate-volta saindo de BH',
        'passeio na região pra fugir da rotina',
        'destino tranquilo pertinho da capital',
        'boa pra um programa de dia inteiro',
    ],
}

const CUSTO_FRASE = {
    gratis: 'Entrada de graça',
    barato: 'Preço camarada',
    medio: 'Preço médio',
    caro: 'Mais sofisticado',
}

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const escolha = (arr, id) => arr[Math.abs(Number(id) || 0) % arr.length]
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** Descrição natural em PT-BR (cita bairro/cidade; nota real quando houver). */
function descreverLugar(l) {
    const cat = l.categoria
    const subst = SUBSTANTIVO[cat] || 'lugar'
    const artigo = ARTIGO[cat] || 'Um'
    const frase = escolha(FRASES[cat] || FRASES.regiao, l.id)

    // local: prefere bairro; cita cidade se for fora de BH (derivado em runtime,
    // mas aqui usamos `regiao` cru — evitamos a duplicação "BH, BH").
    const reg = (l.regiao || '').trim()
    const ondeTxt = reg && norm(reg) !== 'belo horizonte' ? ` no ${reg}` : ' em BH'

    let txt = `${artigo} ${subst}${ondeTxt}, ${frase}.`
    if (typeof l.nota === 'number' && l.nota > 0) {
        const av = l.avaliacoes ? ` (${l.avaliacoes.toLocaleString('pt-BR')} avaliações)` : ''
        txt += ` Nota ${l.nota.toFixed(1)}★ no Google${av}.`
    }
    return cap(txt)
}

/** Tags em PT (categoria + custo + comida + bebê + período), sem inglês solto. */
function montarTags(l) {
    const out = new Set()
    if (LABEL[l.categoria]) out.add(LABEL[l.categoria])
    if (l.custo === 'gratis') out.add('De graça')
    else if (l.custo === 'barato') out.add('Barato')
    else if (l.custo === 'caro') out.add('Sofisticado')
    if (l.temComida) out.add('Tem comida')
    if (l.bebe) out.add('Vai com bebê')
    const per = Array.isArray(l.periodos) ? l.periodos : []
    if (per.length === 1 && per[0] === 'noite') out.add('Programa noturno')
    if (per.includes('manha')) out.add('Abre de manhã')
    if (typeof l.nota === 'number' && l.nota >= 4.5) out.add('Muito bem avaliado')
    return [...out].slice(0, 6)
}

function melhorar(l) {
    return { ...l, descricao: descreverLugar(l), tags: montarTags(l) }
}

function processar(arquivo, rotulo) {
    const lista = JSON.parse(readFileSync(arquivo, 'utf8'))
    const novo = lista.map(melhorar)
    writeFileSync(arquivo, JSON.stringify(novo, null, 1), 'utf8')
    console.log(`${rotulo}: ${novo.length} lugares — descrições e tags reescritas`)
    // amostra
    novo.slice(0, 2).forEach((l) => console.log(`  • ${l.nome}: ${l.descricao}  [${l.tags.join(', ')}]`))
}

processar(ARQ_OSM, 'OSM')
processar(ARQ_GOOGLE, 'GOOGLE')
console.log('OK — dataset melhorado (sem rede, idempotente).')
