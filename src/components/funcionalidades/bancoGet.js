/**
 * bancoGet.js
 * -----------------------------------------------------------------------------
 * Camada de acesso aos dados (padrao "uma funcao por consulta" do DevProfile).
 * Como o projeto e estatico, aqui le da classe LugaresBH em vez de uma API,
 * mas mantem a mesma assinatura (sempre Promise) para ficar trivial trocar por
 * um backend real depois.
 */
import LugaresBH from './lugaresBH.js'
import lugaresOSM from './lugaresOSM.json'
import lugaresGoogle from './lugaresGoogle.json'
import GlobalVar from '../subComponents/GlobalVar.jsx'

/**
 * Base unica, em tres camadas:
 *  - 32 lugares CURADOS (estrela real, foto, descricao escrita a mao);
 *  - ~1860 do OpenStreetMap (sem estrela, apenas `qualidade` estimada);
 *  - 232 do Google Maps (raspagem leve por bairro, com NOTA real do Google
 *    e numero de avaliacoes) — por terem nota real tambem exibem estrela.
 * Os curados recebem `curado:true`; cada lugar carrega `fonte` (curado/osm/google).
 * Fonte OSM sob licenca ODbL — atribuicao no Rodape.
 */
const CURADOS = LugaresBH.lista.map((l) => ({ ...l, curado: true, fonte: 'curado' }))
const TODOS = [...CURADOS, ...lugaresOSM, ...lugaresGoogle]

/** Retorna a lista completa de lugares (curados + OSM + Google). */
function getLugares() {
    return Promise.resolve(TODOS)
}

/** Retorna um lugar pelo id. */
function getLugarPorId(id) {
    return Promise.resolve(TODOS.find((l) => l.id === Number(id)) || null)
}

/** Metadados das categorias (label + icone) para montar filtros. */
function getCategorias() {
    return Promise.resolve(LugaresBH.categorias)
}

/**
 * Diz se um lugar esta aberto num dia/hora especifico.
 * @param {object} lugar
 * @param {number} dia   0=Dom..6=Sab
 * @param {number} hora  hora decimal (13.5 = 13h30)
 * @returns {boolean}
 */
function estaAberto(lugar, dia, hora) {
    const h = lugar.horarios?.[dia]
    if (!h) return false
    const abre = GlobalVar.minutosParaDecimal(h.abre)
    let fecha = GlobalVar.minutosParaDecimal(h.fecha)
    // fechamento depois da meia-noite (ex.: 02:00) conta como dia seguinte
    if (fecha <= abre) fecha += 24
    return hora >= abre && hora <= fecha
}

/**
 * Diz se um lugar atende a um periodo (manha/tarde/noite) num dado dia,
 * cruzando os periodos declarados com o horario real de funcionamento.
 */
function abreNoPeriodo(lugar, dia, periodo) {
    if (periodo === 'qualquer') return true
    if (!lugar.periodos?.includes(periodo)) return false
    const faixa = { manha: [6, 12], tarde: [12, 18], noite: [18, 23.99] }[periodo]
    if (!faixa) return true
    const h = lugar.horarios?.[dia]
    if (!h) return false
    const abre = GlobalVar.minutosParaDecimal(h.abre)
    let fecha = GlobalVar.minutosParaDecimal(h.fecha)
    if (fecha <= abre) fecha += 24
    // ha sobreposicao entre o funcionamento e a faixa do periodo?
    return abre < faixa[1] && fecha > faixa[0]
}

const bancoGet = { getLugares, getLugarPorId, getCategorias, estaAberto, abreNoPeriodo }
export default bancoGet
