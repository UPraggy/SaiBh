/**
 * recomendar.js
 * -----------------------------------------------------------------------------
 * Algoritmo de recomendacao do SaiBH. Recebe a lista de lugares, o clima atual
 * (clima.js) e os filtros escolhidos pelo usuario, e devolve uma lista ordenada
 * por "score" (0-100) com os motivos de cada nota.
 *
 * Filtros aceitos (todos opcionais):
 * @typedef {Object} Filtros
 * @property {number}  dia        0=Dom..6=Sab (default: hoje)
 * @property {number}  hora       hora decimal (default: agora)
 * @property {string}  periodo    'manha'|'tarde'|'noite'|'qualquer'
 * @property {boolean} comBebe    vai levar bebe?
 * @property {number}  idadeBebe  idade do bebe em meses
 * @property {number}  pessoas    quantidade de pessoas no grupo
 * @property {string}  custoMax   teto de gasto: 'gratis'|'barato'|'medio'|'caro'
 * @property {string}  categoria  categoria desejada ('' = todas)
 * @property {string}  regiao     filtro de regiao ('' = todas)
 * @property {string}  comida     'tanto'|'com'|'sem'
 * @property {boolean} soAbertoAgora  mostrar so o que esta aberto no horario
 * @property {boolean} considerarClima  usar o clima ao vivo no ranking (default true)
 */
import bancoGet from './bancoGet.js'

// ordem de custo p/ comparar com o teto escolhido
const ORDEM_CUSTO = { gratis: 0, barato: 1, medio: 2, caro: 3 }

// categorias que, no "chute", costumam acomodar bem crianças
const CATS_CRIANCA = new Set([
    'parque', 'praca', 'mirante', 'familia', 'feira',
    'cafe', 'shopping', 'cultura', 'restaurante', 'mercado',
])

/**
 * indicadoParaCrianca(lugar, idadeMeses)
 * -----------------------------------------------------------------------------
 * Decide se um lugar entra quando "Vou com criança" está ligado. Além do campo
 * `bebe` curado, fazemos um "chute" educado a partir da categoria/ambiente —
 * assim cobrimos os milhares de pontos do OSM que não têm o campo preenchido.
 * É sensível à idade (0–120 meses): bebê pequeno evita lugar só-de-noite.
 */
function indicadoParaCrianca(l, idadeMeses) {
    if (l.categoria === 'bar') return false
    if (l.bebe) return true
    const soNoite = Array.isArray(l.periodos) && l.periodos.length === 1 && l.periodos[0] === 'noite'
    if (idadeMeses < 18 && soNoite) return false
    if (CATS_CRIANCA.has(l.categoria)) return true
    // espaço aberto costuma acomodar criança mesmo sem categoria "óbvia"
    if (l.ambiente === 'aberto') return true
    return false
}

/**
 * Calcula o score de UM lugar dado o clima e os filtros.
 * Retorna { score, motivos[], abertoAgora, abreNoPeriodo }.
 */
function pontuar(lugar, clima, f) {
    let score = 50
    const motivos = []

    const abertoAgora = bancoGet.estaAberto(lugar, f.dia, f.hora)
    const okPeriodo = bancoGet.abreNoPeriodo(lugar, f.dia, f.periodo || 'qualquer')

    // ---- Status de funcionamento RELATIVO ao que o usuario escolheu ----
    // O card mostrava sempre "Aberto/Fechado agora" (hora atual), ignorando o dia
    // e o período escolhidos. Aqui derivamos um rótulo coerente com o contexto:
    //  - hoje + qualquer horário  -> "Aberto agora" / "Fechado agora" (hora real)
    //  - período específico        -> "Abre · <Período>" / "Fechado · <Período>"
    //  - dia futuro + qualquer     -> "Abre nesse dia" / "Fechado nesse dia"
    const ehHoje = (f.diaOffset || 0) === 0
    const periodoEsp = f.periodo && f.periodo !== 'qualquer'
    let statusTipo, statusLabel
    if (ehHoje && !periodoEsp) {
        statusTipo = abertoAgora ? 'aberto' : 'fechado'
        statusLabel = abertoAgora ? 'Aberto agora' : 'Fechado agora'
    } else if (periodoEsp) {
        const lp = labelPeriodoCap(f.periodo)
        statusTipo = okPeriodo ? 'aberto' : 'fechado'
        statusLabel = okPeriodo ? `Abre · ${lp}` : `Fechado · ${lp}`
    } else {
        const abreNoDia = !!lugar.horarios?.[f.dia]
        statusTipo = abreNoDia ? 'aberto' : 'fechado'
        statusLabel = abreNoDia ? 'Abre nesse dia' : 'Fechado nesse dia'
    }

    // ---- 1) Funcionamento (peso alto) ----
    if (okPeriodo) {
        score += 16
        motivos.push(`Funciona no período de ${labelPeriodo(f.periodo)}`)
    } else {
        score -= 26
        motivos.push('Fora do período/horário que você quer')
    }
    if (abertoAgora) {
        score += 8
        motivos.push('Aberto agora')
    }

    // ---- 2) Clima x ambiente (peso alto) ----
    // So entra se o usuario deixou o "considerar clima" ligado (default true).
    if (f.considerarClima && clima?.ok) {
        if (clima.categoria === 'chuva') {
            if (lugar.ambiente === 'fechado') { score += 22; motivos.push('Coberto — seguro pra chuva de hoje') }
            else if (lugar.ambiente === 'misto') { score += 6; motivos.push('Tem área coberta caso chova') }
            else { score -= 24; motivos.push('Ao ar livre — chuva pode atrapalhar') }
        } else if (clima.categoria === 'limpo') {
            if (lugar.ambiente === 'aberto') { score += 18; motivos.push('Tempo aberto — dia perfeito pra área livre') }
            else if (lugar.ambiente === 'misto') { score += 8 }
        } else { // nublado
            if (lugar.ambiente !== 'fechado') { score += 6; motivos.push('Tempo firme o suficiente pra ficar fora') }
        }
        // calorzao favorece sombra/cobertura
        if (clima.temp >= 30 && lugar.ambiente === 'fechado') { score += 4 }
    }

    // ---- 3) Criança (quando marcado) ----
    // O DROP de lugares nao-indicados acontece no filtro duro (recomendar()).
    // Aqui afinamos o ranking entre os lugares que JA passaram, cuidando da
    // idade (0–120 meses): bebê pede calmo; criança maior pede espaço/atividade.
    if (f.comBebe) {
        const idade = f.idadeBebe || 0
        // base: lugar curado como tranquilo pra criança vale mais que o "chute"
        if (lugar.bebe) { score += 12; motivos.push('Tranquilo pra ir com criança') }
        else { score += 6; motivos.push('Costuma receber bem quem vai com criança') }

        const soNoite = lugar.periodos?.length === 1 && lugar.periodos[0] === 'noite'

        if (idade < 18) {
            // bebê: ambiente calmo/coberto, longe da noite e da muvuca
            if (lugar.ambiente === 'fechado') { score += 5; motivos.push('Ambiente calmo pra bebê') }
            else if (lugar.ambiente === 'misto') { score += 2 }
            if (f.periodo === 'noite' || soNoite) { score -= 8; motivos.push('Bebê + noite pede atenção') }
        } else if (idade < 48) {
            // 1–4 anos: começa a andar/correr — espaço aberto ajuda muito
            if (lugar.ambiente === 'aberto') { score += 5; motivos.push('Espaço aberto pra criança gastar energia') }
            if (['parque', 'praca', 'familia'].includes(lugar.categoria)) { score += 4 }
            if (soNoite) score -= 4
        } else {
            // 4–10 anos: parque, cultura e atividade rendem mais
            if (lugar.ambiente === 'aberto') { score += 4; motivos.push('Lugar pra criança brincar à vontade') }
            if (['parque', 'praca', 'mirante', 'cultura', 'familia', 'feira'].includes(lugar.categoria)) {
                score += 5; motivos.push('Programa que prende a atenção da criançada')
            }
        }
    }

    // ---- 4) Pessoas vs tamanho ideal (discrimina de verdade + ranqueia o melhor) ----
    // Peso forte (comparável ao clima) com gradiente de ENCAIXE: o lugar cujo
    // tamanho ideal mais "abraça" o grupo sobe pro topo. Antes era um +8 fixo,
    // então o melhor encaixe não se destacava dos demais.
    if (f.pessoas) {
        const { min = 1, max = 99 } = lugar.idealPessoas || {}
        const p = f.pessoas
        if (p > max) {
            // quanto mais estoura a capacidade, maior a penalidade
            score -= Math.min(28, 12 + (p - max) * 4)
            motivos.push('Pode ficar apertado pro tamanho do grupo')
        } else if (p < min) {
            score -= Math.min(16, 6 + (min - p) * 3)
            motivos.push('Rende mais com um grupo um pouco maior')
        } else {
            // dentro da faixa ideal: bônus base + gradiente de encaixe (até +10).
            // O "ponto ideal" fica a ~60% da faixa (lugares respiram melhor com
            // um pouco de folga); quanto mais perto dele, maior o bônus.
            score += 14
            const span = Math.max(1, max - min)
            const pos = (p - min) / span          // 0 = no mínimo, 1 = no máximo
            const encaixe = 1 - Math.abs(pos - 0.6)
            score += Math.round(Math.max(0, encaixe) * 10)
            motivos.push(`Tamanho de grupo ideal pra esse lugar (${p})`)
            // encaixe forte: grupo grande num lugar que comporta grupos grandes
            if (p >= 6 && max >= 12) score += 3
            // casal/solo num lugar intimista
            if (p <= 2 && max <= 6) score += 3
        }
    }

    // ---- 5) Custo vs teto ----
    if (f.custoMax) {
        if (ORDEM_CUSTO[lugar.custo] <= ORDEM_CUSTO[f.custoMax]) {
            score += 10
            if (lugar.custo === 'gratis') motivos.push('De graça')
            else motivos.push(`Cabe no orçamento (${labelCusto(lugar.custo)})`)
        } else {
            score -= 16
            motivos.push('Acima do orçamento escolhido')
        }
    } else if (lugar.custo === 'gratis') {
        score += 4
    }

    // ---- 6) Qualidade do lugar ----
    // Curados tem estrela real; lugares do OSM usam `qualidade` (completude estimada).
    if (typeof lugar.nota === 'number') {
        score += (lugar.nota - 4) * 10 // nota 4.8 => +8 ; nota 4.4 => +4
    } else if (typeof lugar.qualidade === 'number') {
        score += Math.round((lugar.qualidade - 70) / 6) // OSM: ~ -3 a +5
    }

    // ---- 7) reforco final ----
    if (f.considerarClima && lugar.destaqueHoje && clima?.ok && clima.categoria !== 'chuva') score += 4

    score = Math.max(0, Math.min(100, Math.round(score)))
    return { score, motivos, abertoAgora, okPeriodo, statusTipo, statusLabel }
}

/**
 * Aplica filtros "duros" (categoria, regiao, comida, custo, aberto agora) e
 * devolve a lista ordenada por score.
 * @param {object[]} lugares
 * @param {object}   clima
 * @param {Filtros}  filtros
 */
function recomendar(lugares, clima, filtros = {}) {
    const f = {
        dia: filtros.dia, hora: filtros.hora,
        diaOffset: Number(filtros.diaOffset) || 0,
        periodo: filtros.periodo || 'qualquer',
        comBebe: !!filtros.comBebe,
        idadeBebe: Number(filtros.idadeBebe) || 0,
        pessoas: Number(filtros.pessoas) || 0,
        custoMax: filtros.custoMax || '',
        categoria: filtros.categoria || '',
        cidade: filtros.cidade || '',
        bairro: filtros.bairro || '',
        comida: filtros.comida || 'tanto',
        soAbertoAgora: !!filtros.soAbertoAgora,
        // default true: se nao vier no objeto de filtros, o clima conta.
        considerarClima: filtros.considerarClima !== false,
    }

    // dia escolhido (0-6). Quando válido, vira filtro duro de "abre nesse dia".
    const diaValido = typeof f.dia === 'number' && f.dia >= 0 && f.dia <= 6

    return lugares
        // filtros duros
        .filter((l) => !f.categoria || l.categoria === f.categoria)
        .filter((l) => !f.cidade || l.cidade === f.cidade)
        .filter((l) => !f.bairro || l.bairro === f.bairro)
        .filter((l) => (f.comida === 'com' ? l.temComida : f.comida === 'sem' ? !l.temComida : true))
        .filter((l) => !f.custoMax || ORDEM_CUSTO[l.custo] <= ORDEM_CUSTO[f.custoMax])
        // levar criança é filtro DURO, mas "chutamos" além do campo `bebe`:
        // categoria/ambiente típicos de criança entram, sensível à idade.
        .filter((l) => !f.comBebe || indicadoParaCrianca(l, f.idadeBebe))
        // DIA: se há um dia escolhido, mantém só o que realmente abre nesse dia
        // (antes o dia da semana não filtrava nada — sábado/domingo mostravam tudo).
        .filter((l) => !diaValido || !!l.horarios?.[f.dia])
        // PERÍODO: manhã/tarde/noite vira filtro duro de verdade (antes só pontuava,
        // então a lista não mudava ao trocar o período).
        .filter((l) => f.periodo === 'qualquer' || bancoGet.abreNoPeriodo(l, f.dia, f.periodo))
        // score
        .map((l) => ({ ...l, ...pontuar(l, clima, f) }))
        // se pediu so aberto agora, remove fechados
        .filter((l) => !f.soAbertoAgora || l.abertoAgora)
        // ordena: maior score; desempate por qualidade (curado=nota, OSM=qualidade/20)
        .sort((a, b) => b.score - a.score || rankQualidade(b) - rankQualidade(a))
}

// proxy numerico de qualidade p/ desempate: curado usa nota (0-5), OSM usa qualidade/20
function rankQualidade(l) {
    return typeof l.nota === 'number' ? l.nota : (l.qualidade || 0) / 20
}

function labelPeriodo(p) {
    return ({ manha: 'manhã', tarde: 'tarde', noite: 'noite', qualquer: 'qualquer horário' })[p] || p
}
function labelPeriodoCap(p) {
    return ({ manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' })[p] || p
}
function labelCusto(c) {
    return ({ gratis: 'Grátis', barato: 'Barato', medio: 'Médio', caro: 'Caro' })[c] || c
}

const recomendarFunc = { recomendar, pontuar }
export default recomendarFunc
export { recomendar }
