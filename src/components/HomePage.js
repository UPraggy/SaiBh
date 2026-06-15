/**
 * HomePage.js
 * -----------------------------------------------------------------------------
 * Pagina principal do SaiBH e o orquestrador de tudo:
 *  1. carrega o clima ao vivo (clima.js / Open-Meteo) e a lista de lugares (bancoGet)
 *  2. mantem o estado dos filtros (periodo, custo, comida, bebe, pessoas, clima, etc.)
 *  3. roda o algoritmo de recomendacao (recomendar.js) num useMemo
 *  4. monta a tela: TopMenu -> DestaqueHoje -> FiltrosBar -> grade de CardLugar -> Rodape
 *  5. cuida do "Me Surpreenda" (sorteio + scroll + realce) e do painel "Meus Lugares"
 *     (persistencia real em localStorage via GlobalVar.getLocal/setLocal).
 *
 * O `ativaResp` (mobile) chega de routes.js e e repassado aos filhos.
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'

import { getClimaBH } from './funcionalidades/clima.js'
import bancoGet from './funcionalidades/bancoGet.js'
import { recomendar } from './funcionalidades/recomendar.js'
import GlobalVar from './subComponents/GlobalVar.jsx'

import TopMenu from './subComponents/TopMenu.jsx'
import DestaqueHoje from './subComponents/DestaqueHoje.jsx'
import FiltrosBar from './subComponents/FiltrosBar.jsx'
import CardLugar from './subComponents/CardLugar.jsx'
import Rodape from './subComponents/Rodape.jsx'
import { Icone } from './subComponents/Icones.jsx'

import '../assets/css/HomePage.css'

const CHAVE_SALVOS = 'saibh-meus-lugares'

// quantos cards renderizar por "página" (lazy-load: a base tem milhares de lugares,
// renderizar tudo de uma vez trava o navegador e estoura a altura da rolagem)
const POR_PAGINA = 24

// estado inicial dos filtros: o "agora" (hoje, hora atual, periodo atual) + clima ligado
const FILTROS_INICIAIS = () => ({
    dia: GlobalVar.diaAtual(),
    hora: GlobalVar.horaAtual(),
    periodo: 'qualquer',
    comBebe: false,
    idadeBebe: 6,
    pessoas: 2,
    custoMax: '',
    categoria: '',
    regiao: '',
    comida: 'tanto',
    soAbertoAgora: false,
    considerarClima: true,
})

function HomePage({ ativaResp }) {
    const [clima, setClima] = useState(null)
    const [carregandoClima, setCarregandoClima] = useState(true)
    const [lugares, setLugares] = useState([])

    const [filtros, setFiltros] = useState(FILTROS_INICIAIS)

    // "Meus Lugares" (persiste entre sessoes)
    const [salvos, setSalvos] = useState(() => GlobalVar.getLocal(CHAVE_SALVOS) || [])
    const [painelSalvos, setPainelSalvos] = useState(false)

    // "Me Surpreenda": id do lugar realcado
    const [destacarId, setDestacarId] = useState(null)

    // paginação infinita da grade (sentinela no fim aciona o "ver mais")
    const [visiveis, setVisiveis] = useState(POR_PAGINA)
    const { ref: sentinelaRef, inView: pertoDoFim } = useInView({ rootMargin: '700px 0px' })

    // carrega dados uma vez
    useEffect(() => {
        bancoGet.getLugares().then(setLugares)
        getClimaBH()
            .then((c) => setClima(c))
            .catch(() => setClima({ ok: false }))
            .finally(() => setCarregandoClima(false))
    }, [])

    const setFiltro = useCallback((campo, valor) => setFiltros((p) => ({ ...p, [campo]: valor })), [])
    const limparTudo = useCallback(() => setFiltros(FILTROS_INICIAIS), [])

    // ---- Meus Lugares: salvar / remover ----
    const toggleSalvo = useCallback((id) => {
        setSalvos((prev) => {
            const novo = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            GlobalVar.setLocal(CHAVE_SALVOS, novo)
            return novo
        })
    }, [])
    const estaSalvo = useCallback((id) => salvos.includes(id), [salvos])

    // regioes unicas (para o select), em ordem alfabetica
    const regioes = useMemo(
        () => [...new Set(lugares.map((l) => l.regiao).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
        [lugares],
    )

    // recomendacao filtrada (reage aos filtros do usuario, inclusive considerarClima)
    const recomendados = useMemo(
        () => recomendar(lugares, clima, filtros),
        [lugares, clima, filtros],
    )

    // ranking estavel do dia para o hero (ignora os filtros do usuario, mas respeita o clima)
    const recomendadosHoje = useMemo(
        () => recomendar(lugares, clima, {
            dia: GlobalVar.diaAtual(),
            hora: GlobalVar.horaAtual(),
            periodo: 'qualquer',
            pessoas: 2,
            considerarClima: filtros.considerarClima,
        }),
        [lugares, clima, filtros.considerarClima],
    )

    // lookup por id (para montar o painel "Meus Lugares" com lugares ja pontuados)
    const mapaHoje = useMemo(() => new Map(recomendadosHoje.map((l) => [l.id, l])), [recomendadosHoje])
    const lugaresSalvos = useMemo(
        () => salvos.map((id) => mapaHoje.get(id) || lugares.find((l) => l.id === id)).filter(Boolean),
        [salvos, mapaHoje, lugares],
    )

    // toda vez que os filtros mudam, a lista recomeça do topo
    useEffect(() => { setVisiveis(POR_PAGINA) }, [filtros])

    // sentinela visível perto do fim → revela mais um lote.
    // depende também de `visiveis`: enquanto a sentinela seguir dentro da margem
    // (pertoDoFim continua true), cada incremento re-dispara o efeito e revela o
    // próximo lote, até a sentinela ser empurrada para fora da margem ou acabar a lista.
    useEffect(() => {
        if (pertoDoFim && visiveis < recomendados.length) {
            setVisiveis((v) => Math.min(v + POR_PAGINA, recomendados.length))
        }
    }, [pertoDoFim, visiveis, recomendados.length])

    // lote atualmente visível na grade
    const recomendadosVisiveis = useMemo(
        () => recomendados.slice(0, visiveis),
        [recomendados, visiveis],
    )

    // ---- Me Surpreenda: sorteia entre os melhores, realca e rola ate o card ----
    const meSurpreenda = useCallback(() => {
        if (!recomendados.length) return
        // prioriza lugares abertos agora; se nenhum estiver aberto, cai pra lista toda
        const abertos = recomendados.filter((l) => l.abertoAgora)
        const base = abertos.length ? abertos : recomendados
        const topo = base.slice(0, Math.min(25, base.length))
        const escolha = topo[Math.floor(Math.random() * topo.length)]
        // garante que o card sorteado esteja renderizado antes de rolar até ele
        const idx = recomendados.findIndex((l) => l.id === escolha.id)
        if (idx >= 0) setVisiveis((v) => Math.max(v, idx + 1))
        setPainelSalvos(false)
        setDestacarId(escolha.id)
        setTimeout(() => {
            const el = document.getElementById(`lugar-${escolha.id}`)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 80)
        setTimeout(() => setDestacarId((atual) => (atual === escolha.id ? null : atual)), 5000)
    }, [recomendados])

    return (
        <div className="homePage">
            <TopMenu
                clima={clima}
                ativaResp={ativaResp}
                salvosCount={salvos.length}
                onAbrirSalvos={() => setPainelSalvos(true)}
            />

            <DestaqueHoje
                clima={clima}
                lugaresHoje={recomendadosHoje}
                considerarClima={filtros.considerarClima}
                onSurpresa={meSurpreenda}
                ativaResp={ativaResp}
            />

            <FiltrosBar
                filtros={filtros}
                setFiltro={setFiltro}
                limparTudo={limparTudo}
                regioes={regioes}
                clima={clima}
                ativaResp={ativaResp}
            />

            <main className="conteudoWrapper resultados">
                <header className="resultadosCabecalho">
                    <h2>
                        {recomendados.length}{' '}
                        {recomendados.length === 1 ? 'lugar encontrado' : 'lugares recomendados'}
                    </h2>
                    <p>
                        Ordenados pela combinação com seus filtros
                        {carregandoClima
                            ? ' · carregando clima…'
                            : filtros.considerarClima && clima?.ok
                                ? ' e o clima de agora'
                                : ''}.
                    </p>
                </header>

                {recomendados.length === 0 ? (
                    <div className="semResultado">
                        <span className="semResultadoIcone"><Icone nome="busca" size={34} /></span>
                        <p>Nenhum lugar bateu com esses filtros. Tente afrouxar o custo, o período ou o “só aberto agora”.</p>
                        <button type="button" className="semResultadoBtn" onClick={limparTudo}>
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grade">
                            {recomendadosVisiveis.map((l) => (
                                <div id={`lugar-${l.id}`} key={l.id}>
                                    <CardLugar
                                        lugar={l}
                                        salvo={estaSalvo(l.id)}
                                        onToggleSalvo={toggleSalvo}
                                        surpresa={destacarId === l.id}
                                        destaque={l.destaqueHoje}
                                    />
                                </div>
                            ))}
                        </div>

                        {visiveis < recomendados.length && (
                            <div ref={sentinelaRef} className="gradeSentinela" aria-hidden="true">
                                <span className="gradeSpinner" />
                                Carregando mais lugares…
                            </div>
                        )}
                    </>
                )}
            </main>

            <Rodape />

            {/* ---------------- Painel "Meus Lugares" ---------------- */}
            {painelSalvos && (
                <div className="salvosOverlay" onClick={() => setPainelSalvos(false)}>
                    <aside
                        className="salvosPainel"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-label="Meus lugares"
                    >
                        <header className="salvosTopo">
                            <span className="salvosTopoTitulo">
                                <Icone nome="coracaoCheio" size={19} /> Meus lugares
                                <small>{lugaresSalvos.length}</small>
                            </span>
                            <button
                                type="button"
                                className="salvosFechar"
                                onClick={() => setPainelSalvos(false)}
                                aria-label="Fechar"
                            >
                                <Icone nome="x" size={20} />
                            </button>
                        </header>

                        <div className="salvosCorpo">
                            {lugaresSalvos.length === 0 ? (
                                <div className="salvosVazio">
                                    <span className="salvosVazioIcone"><Icone nome="coracao" size={32} /></span>
                                    <p>Você ainda não salvou nenhum lugar.</p>
                                    <small>Toque no coração de um card para guardar aqui.</small>
                                </div>
                            ) : (
                                <div className="salvosGrade">
                                    {lugaresSalvos.map((l) => (
                                        <CardLugar
                                            key={l.id}
                                            lugar={l}
                                            salvo
                                            onToggleSalvo={toggleSalvo}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </div>
    )
}

export default HomePage
