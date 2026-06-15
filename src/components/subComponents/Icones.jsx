/**
 * Icones.jsx
 * -----------------------------------------------------------------------------
 * Sistema de icones do SaiBH — nada de emoji na UI. Os traços abaixo sao os
 * MESMOS dos SVGs entregues no kit de design (design/SaiBh/svg/icones e
 * /categorias). Tudo inline, traço 1.8px, cantos arredondados, herdando
 * `currentColor` para acompanhar a cor do contexto (vinho no header,
 * terracota nas acoes, gold nas estrelas, etc.).
 *
 * Dois componentes:
 *  - <Icone nome="sol" size={20} />        -> icone de linha generico
 *  - <CategoriaIcone categoria="cafe" />   -> icone da categoria num quadrado
 *                                             com gradiente quente (cards/filtros)
 *
 * Convencao: viewBox 0 0 24 24, fill="none", stroke="currentColor".
 * Fonte fiel: design/SaiBh/svg/.
 */

// --------- biblioteca de traços (miolo de cada <svg>, fiel ao kit) ----------
const TRACOS = {
    // ---- clima ----
    sol: (
        <>
            <circle cx="12" cy="12" r="3.7" />
            <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7" />
        </>
    ),
    nuvem: (
        <path d="M7 17a4 4 0 01.4-8 5.2 5.2 0 0110-1.2A3.7 3.7 0 0117.5 17H7z" />
    ),
    chuva: (
        <>
            <path d="M7.2 15.2a3.7 3.7 0 01.3-7.4 5 5 0 019.4-1A3.4 3.4 0 0117 15.2H7.2z" />
            <path d="M8.5 18l-.8 2M12 18l-.8 2M15.5 18l-.8 2" />
        </>
    ),
    tempestade: (
        <>
            <path d="M7.2 14.6a3.7 3.7 0 01.3-7.4 5 5 0 019.4-1A3.4 3.4 0 0117 14.6H7.2z" />
            <path d="M12.6 15.4l-2.2 3.2h2.5l-1.9 3.3" />
        </>
    ),
    // sol espiando entre nuvens (parcialmente nublado / tarde amena)
    solNuvem: (
        <>
            <circle cx="8.2" cy="7.8" r="2.2" />
            <path d="M8.2 3.3v1.3M3.8 7.8h1.3M5.1 4.7l.9.9M11.3 4.7l-.9.9" />
            <path d="M8.6 19a3.3 3.3 0 01.3-6.6 4.3 4.3 0 018.1-1 3 3 0 01.4 7.6H8.6z" />
        </>
    ),
    lua: (
        <path d="M20.5 14.6A8.5 8.5 0 119.4 3.5a6.7 6.7 0 1011.1 11.1z" />
    ),

    // ---- lugar / avaliacao / tempo ----
    pin: (
        <>
            <path d="M12 21.5s6.5-5.4 6.5-10.5a6.5 6.5 0 10-13 0c0 5.1 6.5 10.5 6.5 10.5z" />
            <circle cx="12" cy="11" r="2.4" />
        </>
    ),
    estrela: (
        <path d="M12 2.3l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.96 6.1 20.47l1.13-6.57L2.45 9.24l6.6-.96z" fill="currentColor" stroke="none" />
    ),
    relogio: (
        <>
            <circle cx="12" cy="12" r="8.6" />
            <path d="M12 7.2V12l3.4 2" />
        </>
    ),
    // calendario / agenda (mesmo traço do kit: agenda.svg)
    calendario: (
        <>
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.6" />
            <path d="M3.5 9.5h17M8 3.2v3.6M16 3.2v3.6" />
        </>
    ),
    bebe: (
        <>
            <circle cx="12" cy="12" r="8.4" />
            <circle cx="9.4" cy="10.8" r="1" fill="currentColor" stroke="none" />
            <circle cx="14.6" cy="10.8" r="1" fill="currentColor" stroke="none" />
            <path d="M9 14.5a3.2 3.2 0 006 0" />
            <path d="M12 3.6c1.8-1.4 3.6.2 2 1.8" />
        </>
    ),
    pessoas: (
        <>
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 20a5.5 5.5 0 0111 0" />
            <circle cx="16.5" cy="8.5" r="2.3" />
            <path d="M16 13.5a4.6 4.6 0 014.5 5.5" />
        </>
    ),
    dado: (
        <>
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <circle cx="9" cy="9" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="15" cy="9" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="9" cy="15" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="15" cy="15" r="1.25" fill="currentColor" stroke="none" />
        </>
    ),
    coracao: (
        <path d="M12 20.5S4.5 15.5 4.5 9.8A3.8 3.8 0 0112 8a3.8 3.8 0 017.5 1.8c0 5.7-7.5 10.7-7.5 10.7z" />
    ),
    coracaoCheio: (
        <path d="M12 20.5S4.5 15.5 4.5 9.8A3.8 3.8 0 0112 8a3.8 3.8 0 017.5 1.8c0 5.7-7.5 10.7-7.5 10.7z" fill="currentColor" stroke="none" />
    ),
    trofeu: (
        <>
            <path d="M7 4h10v3.5a5 5 0 01-10 0V4z" />
            <path d="M7 5.5H4.5a2.5 2.5 0 002.7 2.5" />
            <path d="M17 5.5h2.5a2.5 2.5 0 01-2.7 2.5" />
            <path d="M12 12.5v3.5M9 20h6M10 20l.5-4M14 20l-.5-4" />
        </>
    ),
    home: (
        <>
            <path d="M4 11.5L12 4l8 7.5M6 10.5V20h12v-9.5" />
            <path d="M10 20v-5h4v5" />
        </>
    ),

    // ---- acoes / UI ----
    filtros: (
        <>
            <path d="M4 8h9M19 8h1.5" />
            <circle cx="15.5" cy="8" r="2.4" />
            <path d="M4 16h1.5M11 16h9.5" />
            <circle cx="8" cy="16" r="2.4" />
        </>
    ),
    chevron: (
        <path d="M9 6l6 6-6 6" />
    ),
    chevronBaixo: (
        <path d="M6 9.5l6 6 6-6" />
    ),
    x: (
        <path d="M6 6l12 12M18 6 6 18" />
    ),
    check: (
        <path d="M5 12.5l4.4 4.5L19 7.2" />
    ),
    dinheiro: (
        <>
            <rect x="2.8" y="6" width="18.4" height="12" rx="2.4" />
            <circle cx="12" cy="12" r="2.7" />
            <path d="M6 9.4v5.2M18 9.4v5.2" />
        </>
    ),
    mapa: (
        <>
            <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" />
            <path d="M9 4v14M15 6v14" />
        </>
    ),
    busca: (
        <>
            <circle cx="10.5" cy="10.5" r="6" />
            <path d="m20 20-4.7-4.7" />
        </>
    ),
    raio: (
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    ),
    sino: (
        <>
            <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
        </>
    ),
    // info / aviso (circulo com i) — mesmo peso de traco do kit
    info: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
        </>
    ),

    // ---- categorias (traços fieis ao kit) ----
    // restaurante -> garfo.svg
    garfo: (
        <>
            <path d="M8 3v8M6 3v3.4M10 3v3.4M8 11v10" />
            <path d="M16 3c-1.7.6-2.4 4-2.4 6.6 0 1.7.9 2.4 2.4 2.4v9" />
        </>
    ),
    // bar -> taca.svg
    taca: (
        <>
            <path d="M8 4h8l-.9 5.4a3.1 3.1 0 01-6.2 0L8 4z" />
            <path d="M12 14v5.5M9 20h6" />
        </>
    ),
    // cafe -> cafe.svg
    cafe: (
        <>
            <path d="M5 9h11v3.5a5 5 0 01-10 0V9z" />
            <path d="M16 10h2a2.2 2.2 0 010 4.4h-1" />
            <path d="M8 5.5c0-1 1-1 1-2M11.5 5.5c0-1 1-1 1-2M4 19.5h13" />
        </>
    ),
    // parque -> arvore.svg
    arvore: (
        <path d="M12 3.5l4.2 6H7.8L12 3.5zM9 9.5l3 4.5 3-4.5M12 14v6.5M9 20.5h6" />
    ),
    // cultura -> ingresso.svg
    ingresso: (
        <>
            <path d="M4 8.5A1.8 1.8 0 015.8 6.7h12.4A1.8 1.8 0 0120 8.5v1.8a1.7 1.7 0 000 3.4v1.8a1.8 1.8 0 01-1.8 1.8H5.8A1.8 1.8 0 014 15.5v-1.8a1.7 1.7 0 000-3.4V8.5z" />
            <path d="M13.5 6.7v10.6" strokeDasharray="2 2" />
        </>
    ),
    // feira / mercado / shopping -> cesta.svg
    cesta: (
        <>
            <path d="M5 9.5h14l-1.4 9a2 2 0 01-2 1.7H8.4a2 2 0 01-2-1.7L5 9.5z" />
            <path d="M9 9.5V6.5a3 3 0 016 0v3" />
        </>
    ),
    // compartilhar (tres nos ligados) — mesmo peso de traco do kit
    compartilhar: (
        <>
            <circle cx="6" cy="12" r="2.4" />
            <circle cx="17" cy="6" r="2.4" />
            <circle cx="17" cy="18" r="2.4" />
            <path d="M8.2 10.9l6.7-3.7M8.2 13.1l6.7 3.7" />
        </>
    ),
}

// aliases p/ chaves antigas usadas em outros componentes (compat retro)
TRACOS.agenda = TRACOS.calendario
TRACOS['coracao-cheio'] = TRACOS.coracaoCheio
TRACOS['sol-nuvem'] = TRACOS.solNuvem
TRACOS.parque = TRACOS.arvore
TRACOS.praca = TRACOS.arvore
TRACOS.mirante = TRACOS.arvore
TRACOS.cultura = TRACOS.ingresso
TRACOS.restaurante = TRACOS.garfo
TRACOS.bar = TRACOS.taca
TRACOS.feira = TRACOS.cesta
TRACOS.mercado = TRACOS.cesta
TRACOS.shopping = TRACOS.cesta
TRACOS.familia = TRACOS.pessoas
TRACOS.regiao = TRACOS.pin

/**
 * Icone de linha generico.
 * @param {string} nome   chave em TRACOS
 * @param {number} size   tamanho (px)
 * @param {number} traco  largura do traço (default 1.8)
 */
export function Icone({ nome, size = 20, traco = 1.8, className = '', style }) {
    const conteudo = TRACOS[nome]
    if (!conteudo) return null
    // O kit é desenhado em viewBox 24 com traço 1.8 → a ~1.1px a 15px o
    // traço fica fino e "spindly". Compensamos o peso aparente em tamanhos
    // pequenos para manter a espessura na tela perto de ~1.4px (sem mexer na
    // geometria dos paths, então continua fiel ao kit).
    const tracoEfetivo = size < 22 ? Math.min(traco + (22 - size) * 0.055, 2.6) : traco
    return (
        <svg
            className={`icone ${className}`}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={tracoEfetivo}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={style}
        >
            {conteudo}
        </svg>
    )
}

/**
 * Metadados de categoria — gradiente + traço FIEIS ao kit de design.
 * Os 5 baldes canonicos (categorias/*.svg):
 *   restaurantes g0 #c4502f->#e8956a (garfo)
 *   bares        g1 #8a1f3f->#b8472f (taca)
 *   cafes        g2 #a05a2c->#d08a4a (cafe)
 *   parques      g3 #1f9d6e->#34b98a (arvore)
 *   cultura      g4 #15405c->#3a6e8c (ingresso)
 * As demais categorias do dataset reaproveitam o balde mais proximo.
 */
const GRAD = {
    restaurantes: 'linear-gradient(135deg,#c4502f,#e8956a)',
    bares: 'linear-gradient(135deg,#8a1f3f,#b8472f)',
    cafes: 'linear-gradient(135deg,#a05a2c,#d08a4a)',
    parques: 'linear-gradient(135deg,#1f9d6e,#34b98a)',
    cultura: 'linear-gradient(135deg,#15405c,#3a6e8c)',
}

const CAT = {
    restaurante: { grad: GRAD.restaurantes, icone: 'garfo' },
    bar: { grad: GRAD.bares, icone: 'taca' },
    cafe: { grad: GRAD.cafes, icone: 'cafe' },
    parque: { grad: GRAD.parques, icone: 'arvore' },
    praca: { grad: GRAD.parques, icone: 'arvore' },
    mirante: { grad: GRAD.parques, icone: 'arvore' },
    cultura: { grad: GRAD.cultura, icone: 'ingresso' },
    feira: { grad: GRAD.restaurantes, icone: 'cesta' },
    mercado: { grad: GRAD.cafes, icone: 'cesta' },
    shopping: { grad: GRAD.restaurantes, icone: 'cesta' },
    familia: { grad: GRAD.parques, icone: 'pessoas' },
    regiao: { grad: 'linear-gradient(135deg,#9a8675,#6b5345)', icone: 'pin' },
}

/**
 * Icone de categoria dentro de um quadrado com gradiente quente.
 * Fiel ao kit: quadrado rx ~0.3, traço branco centralizado.
 * @param {string} categoria
 * @param {number} size   lado do quadrado (px)
 */
export function CategoriaIcone({ categoria, size = 44, className = '' }) {
    const meta = CAT[categoria] || { grad: GRAD.restaurantes, icone: 'pin' }
    return (
        <span
            className={`categoriaIcone ${className}`}
            style={{
                width: size,
                height: size,
                background: meta.grad,
                borderRadius: Math.round(size * 0.3),
            }}
            aria-hidden="true"
        >
            <Icone nome={meta.icone} size={Math.round(size * 0.55)} traco={1.8} style={{ color: '#fff' }} />
        </span>
    )
}

export default Icone
