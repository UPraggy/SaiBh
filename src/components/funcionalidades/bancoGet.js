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
import { fotoDe } from './fotos.js'

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

/**
 * normalizarPerfil(lugar)
 * -----------------------------------------------------------------------------
 * As bases OSM/Google vieram com `bebe:true` em quase tudo (2952/3378) e
 * `idealPessoas` genérico — então os filtros de Bebê e de Pessoas não
 * discriminavam nada (todo card mostrava "Com bebê"). Aqui re-derivamos esses
 * dois campos a partir de sinais reais do lugar (categoria/ambiente/períodos),
 * de forma centralizada e testável, sem reescrever milhares de linhas de JSON.
 * Curados NÃO passam por aqui — foram ajustados à mão.
 *
 * Regra de bebê (realista p/ BH):
 *  - lugar que SÓ abre à noite (balada/bar noturno) → não indicado p/ bebê;
 *  - bar (foco em bebida/ruído) → por padrão não indicado;
 *  - parque, praça, mirante, espaço família, café, feira, shopping → indicado;
 *  - restaurante → indicado (almoço/jantar em família), com ressalva à noite;
 *  - cultura (museu/centro cultural) → indicado (ambiente calmo).
 */
function normalizarPerfil(l) {
    const cat = l.categoria
    const periodos = Array.isArray(l.periodos) ? l.periodos : []
    const soNoite = periodos.length === 1 && periodos[0] === 'noite'

    let bebe
    let bebeObs = l.bebeObs || ''
    if (soNoite) {
        bebe = false
    } else if (cat === 'bar') {
        bebe = false
    } else if (['parque', 'praca', 'mirante', 'familia', 'feira'].includes(cat)) {
        bebe = true
        bebeObs = bebeObs || 'Espaço aberto, tranquilo pra ir com criança'
    } else if (cat === 'cafe' || cat === 'shopping') {
        bebe = true
        bebeObs = bebeObs || 'Ambiente calmo, dá pra ir com bebê'
    } else if (cat === 'cultura') {
        bebe = true
    } else if (cat === 'restaurante') {
        bebe = true
        if (periodos.includes('noite') && !periodos.includes('manha')) {
            bebeObs = bebeObs || 'Melhor levar bebê no horário do almoço'
        }
    } else {
        bebe = false
    }

    // tamanho ideal de grupo coerente com a categoria (quando não veio bom)
    let ideal = l.idealPessoas
    if (!ideal || typeof ideal.max !== 'number') {
        const PORCAT = {
            bar: { min: 2, max: 8 }, cafe: { min: 1, max: 6 }, restaurante: { min: 1, max: 8 },
            parque: { min: 1, max: 20 }, praca: { min: 1, max: 20 }, mirante: { min: 1, max: 12 },
            familia: { min: 2, max: 16 }, feira: { min: 1, max: 12 }, shopping: { min: 1, max: 12 },
            cultura: { min: 1, max: 10 },
        }
        ideal = PORCAT[cat] || { min: 1, max: 8 }
    }

    return { ...l, bebe, bebeObs, idealPessoas: ideal }
}

/**
 * Municípios da Região Metropolitana de BH (+ colar metropolitano usual).
 * O campo `regiao` das bases mistura CIDADE e BAIRRO: o OSM trouxe a maioria
 * como "Belo Horizonte" (cidade), e o Google trouxe nomes de bairro (ex.:
 * "Savassi", "Santa Cruz"). Sem um campo próprio, o usuário não conseguia
 * filtrar cidade e bairro separadamente. Aqui derivamos `cidade` e `bairro`
 * a partir do `regiao`: se ele é o nome de um município conhecido, vira CIDADE;
 * caso contrário tratamos como BAIRRO de Belo Horizonte (origem dos dados).
 */
const CIDADES_RMBH = new Set([
    'Belo Horizonte', 'Betim', 'Contagem', 'Ribeirão das Neves', 'Santa Luzia',
    'Ibirité', 'Sabará', 'Vespasiano', 'Nova Lima', 'Caeté', 'Lagoa Santa',
    'Pedro Leopoldo', 'Esmeraldas', 'São José da Lapa', 'Igarapé', 'Mateus Leme',
    'Brumadinho', 'Sarzedo', 'Raposos', 'Confins', 'Rio Acima', 'Mário Campos',
    'Juatuba', 'Capim Branco', 'São Joaquim de Bicas', 'Florestal', 'Matozinhos',
    'Nova União', 'Taquaraçu de Minas', 'Baldim', 'Jaboticatubas', 'Itaguara',
    'Rio Manso', 'Itatiaiuçu', 'Sete Lagoas', 'Itabirito',
])

/**
 * derivarLocalidade(lugar)
 * Acrescenta `cidade` e `bairro` sem perder o `regiao` original (usado em telas).
 * Respeita valores já presentes (caso um curado venha com cidade/bairro à mão).
 */
function derivarLocalidade(l) {
    if (l.cidade || l.bairro) return l
    const reg = (l.regiao || '').trim()
    const ehCidade = CIDADES_RMBH.has(reg)
    return {
        ...l,
        cidade: ehCidade ? reg : (reg ? 'Belo Horizonte' : ''),
        bairro: ehCidade ? '' : reg,
    }
}

const OSM_NORM = lugaresOSM.map(normalizarPerfil)
const GOOGLE_NORM = lugaresGoogle.map(normalizarPerfil)

/**
 * comFoto(lugar): garante uma capa para TODO lugar. Curados mantêm a foto
 * própria; OSM/Google ganham uma foto topical por categoria (determinística
 * pelo id). Ver fotos.js. O CardLugar cai no ícone se a imagem falhar.
 */
function comFoto(l) {
    return l.foto ? l : { ...l, foto: fotoDe(l) }
}

const TODOS = [...CURADOS, ...OSM_NORM, ...GOOGLE_NORM]
    .map(derivarLocalidade)
    .map(comFoto)

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
