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

/**
 * Calcula o score de UM lugar dado o clima e os filtros.
 * Retorna { score, motivos[], abertoAgora, abreNoPeriodo }.
 */
function pontuar(lugar, clima, f) {
    let score = 50
    const motivos = []

    const abertoAgora = bancoGet.estaAberto(lugar, f.dia, f.hora)
    const okPeriodo = bancoGet.abreNoPeriodo(lugar, f.dia, f.periodo || 'qualquer')

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

    // ---- 3) Bebe (peso alto quando marcado) ----
    if (f.comBebe) {
        if (lugar.bebe) {
            score += 16
            motivos.push('Tranquilo pra ir com o bebê')
        } else {
            score -= 30
            motivos.push('Pouco indicado pra bebê neste horário')
        }
        // bebe pequeno (< 12 meses) prefere ambiente calmo/fechado e periodo dia
        if (f.idadeBebe && f.idadeBebe < 12) {
            if (lugar.ambiente === 'fechado') score += 4
            if (f.periodo === 'noite') { score -= 6; motivos.push('Bebê pequeno + noite pede atenção') }
        }
    }

    // ---- 4) Pessoas vs tamanho ideal ----
    if (f.pessoas) {
        const { min, max } = lugar.idealPessoas || { min: 1, max: 99 }
        if (f.pessoas >= min && f.pessoas <= max) {
            score += 8
            motivos.push(`Bom pra grupo de ${f.pessoas}`)
        } else if (f.pessoas > max) {
            score -= 8
            motivos.push('Pode ficar apertado pro tamanho do grupo')
        }
    }

    // ---- 5) Custo vs teto ----
    if (f.custoMax) {
        if (ORDEM_CUSTO[lugar.custo] <= ORDEM_CUSTO[f.custoMax]) {
            score += 10
            if (lugar.custo === 'gratis') motivos.push('De graça 🎉')
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
    return { score, motivos, abertoAgora, okPeriodo }
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
        periodo: filtros.periodo || 'qualquer',
        comBebe: !!filtros.comBebe,
        idadeBebe: Number(filtros.idadeBebe) || 0,
        pessoas: Number(filtros.pessoas) || 0,
        custoMax: filtros.custoMax || '',
        categoria: filtros.categoria || '',
        regiao: filtros.regiao || '',
        comida: filtros.comida || 'tanto',
        soAbertoAgora: !!filtros.soAbertoAgora,
        // default true: se nao vier no objeto de filtros, o clima conta.
        considerarClima: filtros.considerarClima !== false,
    }

    return lugares
        // filtros duros
        .filter((l) => !f.categoria || l.categoria === f.categoria)
        .filter((l) => !f.regiao || l.regiao === f.regiao)
        .filter((l) => (f.comida === 'com' ? l.temComida : f.comida === 'sem' ? !l.temComida : true))
        .filter((l) => !f.custoMax || ORDEM_CUSTO[l.custo] <= ORDEM_CUSTO[f.custoMax])
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
function labelCusto(c) {
    return ({ gratis: 'Grátis', barato: 'Barato', medio: 'Médio', caro: 'Caro' })[c] || c
}

const recomendarFunc = { recomendar, pontuar }
export default recomendarFunc
export { recomendar }
