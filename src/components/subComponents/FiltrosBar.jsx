/**
 * FiltrosBar.jsx
 * -----------------------------------------------------------------------------
 * Barra de filtros do recomendador (componente controlado).
 *
 * Recebe da HomePage:
 *   - filtros          objeto de estado
 *   - setFiltro(c, v)  atualiza um campo
 *   - limparTudo()     reseta para o padrao (opcional; ha fallback interno)
 *   - regioes          lista de regioes disponiveis
 *   - clima            clima ao vivo (para o switch "considerar clima")
 *   - ativaResp        true em telas <=767px -> vira bottom-sheet
 *
 * Layout:
 *   - Desktop: faixa creme (Treatment A) com grupos em linha + chips ativos.
 *   - Mobile : barra compacta "Filtros (N)" que abre um bottom-sheet.
 */
import { useState } from 'react'
import LugaresBH from '../funcionalidades/lugaresBH.js'
import GlobalVar from './GlobalVar.jsx'
import { Icone } from './Icones.jsx'
import '../../assets/css/FiltrosBar.css'

const PERIODOS = [
    { v: 'qualquer', t: 'Tanto faz' },
    { v: 'manha', t: 'Manhã' },
    { v: 'tarde', t: 'Tarde' },
    { v: 'noite', t: 'Noite' },
]

const CUSTOS = [
    { v: '', t: 'Qualquer' },
    { v: 'gratis', t: 'Grátis' },
    { v: 'barato', t: 'Até barato' },
    { v: 'medio', t: 'Até médio' },
    { v: 'caro', t: 'Tudo' },
]

// valores padrao — base para "limpar" e para detectar filtros ativos
const PADRAO = {
    periodo: 'qualquer',
    custoMax: '',
    comida: 'tanto',
    categoria: '',
    regiao: '',
    pessoas: 2,
    comBebe: false,
    soAbertoAgora: false,
}

function FiltrosBar({ filtros, setFiltro, limparTudo, regioes = [], clima, ativaResp }) {
    const [aberto, setAberto] = useState(false)

    // ---- chips ativos -------------------------------------------------------
    const chips = []
    if (filtros.periodo !== PADRAO.periodo)
        chips.push({ k: 'periodo', t: PERIODOS.find((p) => p.v === filtros.periodo)?.t, reset: PADRAO.periodo })
    if (filtros.custoMax !== PADRAO.custoMax)
        chips.push({ k: 'custoMax', t: CUSTOS.find((c) => c.v === filtros.custoMax)?.t, reset: PADRAO.custoMax })
    if (filtros.comida !== PADRAO.comida)
        chips.push({ k: 'comida', t: LugaresBH.comidaOpcoes[filtros.comida], reset: PADRAO.comida })
    if (filtros.categoria)
        chips.push({ k: 'categoria', t: LugaresBH.categorias[filtros.categoria]?.label, reset: PADRAO.categoria })
    if (filtros.regiao) chips.push({ k: 'regiao', t: filtros.regiao, reset: PADRAO.regiao })
    if (filtros.pessoas !== PADRAO.pessoas)
        chips.push({ k: 'pessoas', t: `${filtros.pessoas} ${filtros.pessoas === 1 ? 'pessoa' : 'pessoas'}`, reset: PADRAO.pessoas })
    if (filtros.comBebe)
        chips.push({ k: 'comBebe', t: `Com bebê (${filtros.idadeBebe}m)`, reset: PADRAO.comBebe })
    if (filtros.soAbertoAgora) chips.push({ k: 'soAbertoAgora', t: 'Aberto agora', reset: PADRAO.soAbertoAgora })

    const totalAtivos = chips.length

    function limpar() {
        if (limparTudo) return limparTudo()
        Object.entries(PADRAO).forEach(([c, v]) => setFiltro(c, v))
    }

    const climaTxt = clima?.ok ? `${clima.temp}°C · ${clima.probChuva}% chuva` : 'clima indisponível'

    // ---- conteudo dos grupos (reaproveitado em desktop e no sheet) ----------
    const grupos = (
        <>
            {/* Periodo */}
            <div className="filtroGrupo">
                <label className="filtroLabel">
                    <Icone nome="relogio" size={16} /> Quando quer ficar?
                </label>
                <div className="segmentos">
                    {PERIODOS.map((p) => (
                        <button
                            key={p.v}
                            type="button"
                            className={`segBtn ${filtros.periodo === p.v ? 'ativo' : ''}`}
                            onClick={() => setFiltro('periodo', p.v)}
                        >
                            {p.t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custo */}
            <div className="filtroGrupo">
                <label className="filtroLabel">
                    <Icone nome="dinheiro" size={16} /> Quanto pode gastar?
                </label>
                <div className="segmentos">
                    {CUSTOS.map((c) => (
                        <button
                            key={c.v || 'todos'}
                            type="button"
                            className={`segBtn ${filtros.custoMax === c.v ? 'ativo' : ''}`}
                            onClick={() => setFiltro('custoMax', c.v)}
                        >
                            {c.t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selects: comida / categoria / regiao + pessoas */}
            <div className="filtroLinha">
                <div className="filtroGrupo">
                    <label className="filtroLabel">Comida</label>
                    <div className="selectWrap">
                        <select value={filtros.comida} onChange={(e) => setFiltro('comida', e.target.value)}>
                            {Object.entries(LugaresBH.comidaOpcoes).map(([v, t]) => (
                                <option key={v} value={v}>{t}</option>
                            ))}
                        </select>
                        <Icone nome="chevronBaixo" size={16} className="selectSeta" />
                    </div>
                </div>

                <div className="filtroGrupo">
                    <label className="filtroLabel">Categoria</label>
                    <div className="selectWrap">
                        <select value={filtros.categoria} onChange={(e) => setFiltro('categoria', e.target.value)}>
                            <option value="">Todas as categorias</option>
                            {Object.entries(LugaresBH.categorias).map(([v, c]) => (
                                <option key={v} value={v}>{c.label}</option>
                            ))}
                        </select>
                        <Icone nome="chevronBaixo" size={16} className="selectSeta" />
                    </div>
                </div>

                <div className="filtroGrupo">
                    <label className="filtroLabel">Região</label>
                    <div className="selectWrap">
                        <select value={filtros.regiao} onChange={(e) => setFiltro('regiao', e.target.value)}>
                            <option value="">Toda a região</option>
                            {regioes.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <Icone nome="chevronBaixo" size={16} className="selectSeta" />
                    </div>
                </div>

                <div className="filtroGrupo filtroPessoas">
                    <label className="filtroLabel">
                        <Icone nome="pessoas" size={16} /> Pessoas
                    </label>
                    <div className="contador">
                        <button
                            type="button"
                            aria-label="Menos uma pessoa"
                            disabled={filtros.pessoas <= 1}
                            onClick={() => setFiltro('pessoas', Math.max(1, filtros.pessoas - 1))}
                        >
                            −
                        </button>
                        <span>{filtros.pessoas}</span>
                        <button
                            type="button"
                            aria-label="Mais uma pessoa"
                            onClick={() => setFiltro('pessoas', filtros.pessoas + 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* Bebe + aberto agora */}
            <div className="filtroLinha filtroLinhaBaixo">
                <button
                    type="button"
                    className={`togglePill ${filtros.comBebe ? 'on' : ''}`}
                    aria-pressed={filtros.comBebe}
                    onClick={() => setFiltro('comBebe', !filtros.comBebe)}
                >
                    <Icone nome="bebe" size={17} /> Vou com bebê
                </button>

                <div className={`bebeBox ${filtros.comBebe ? 'aberto' : ''}`}>
                    <div className="bebeBoxInner">
                        <label className="filtroLabel">Idade do bebê</label>
                        <div className="bebeIdade">
                            <input
                                type="range" min="0" max="48" step="1"
                                value={filtros.idadeBebe}
                                onChange={(e) => setFiltro('idadeBebe', Number(e.target.value))}
                            />
                            <strong>{filtros.idadeBebe} <small>meses</small></strong>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className={`togglePill ${filtros.soAbertoAgora ? 'on' : ''}`}
                    aria-pressed={filtros.soAbertoAgora}
                    onClick={() => setFiltro('soAbertoAgora', !filtros.soAbertoAgora)}
                >
                    <Icone nome="relogio" size={16} /> Aberto agora ({GlobalVar.horaAgoraTexto()})
                </button>
            </div>

            {/* Switch: considerar clima */}
            <button
                type="button"
                role="switch"
                aria-checked={filtros.considerarClima !== false}
                className={`climaSwitch ${filtros.considerarClima !== false ? 'on' : ''} cat-${clima?.categoria || 'na'}`}
                onClick={() => setFiltro('considerarClima', filtros.considerarClima === false)}
            >
                <span className="climaSwitchTrilho"><span className="climaSwitchBola" /></span>
                <span className="climaSwitchTxt">
                    <strong>Considerar o clima no ranking</strong>
                    <small>
                        {filtros.considerarClima !== false
                            ? `Usando o tempo de agora — ${climaTxt}`
                            : 'Desligado — ranking puro pelos seus filtros'}
                    </small>
                </span>
                <Icone nome={clima?.icone === 'chuva' || clima?.icone === 'tempestade' ? 'chuva' : 'sol'} size={20} className="climaSwitchIcone" />
            </button>
        </>
    )

    // ---- chips (linha de filtros ativos) ------------------------------------
    const linhaChips = totalAtivos > 0 && (
        <div className="filtroChips">
            {chips.map((c) => (
                <button key={c.k} type="button" className="chipAtivo" onClick={() => setFiltro(c.k, c.reset)}>
                    {c.t} <Icone nome="x" size={13} />
                </button>
            ))}
            <button type="button" className="chipLimpar" onClick={limpar}>Limpar tudo</button>
        </div>
    )

    // =========================== MOBILE: bottom-sheet =========================
    if (ativaResp) {
        return (
            <>
                <div className="filtrosMobileBar">
                    <button type="button" className="abrirFiltros" onClick={() => setAberto(true)}>
                        <Icone nome="filtros" size={18} /> Filtros
                        {totalAtivos > 0 && <span className="abrirFiltrosBadge">{totalAtivos}</span>}
                    </button>
                    {linhaChips}
                </div>

                {aberto && (
                    <div className="sheetOverlay" onClick={() => setAberto(false)}>
                        <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Filtros">
                            <div className="sheetTopo">
                                <span className="sheetPuxador" />
                                <h3>Filtros</h3>
                                <button type="button" className="sheetFechar" onClick={() => setAberto(false)} aria-label="Fechar">
                                    <Icone nome="x" size={20} />
                                </button>
                            </div>
                            <div className="sheetCorpo">{grupos}</div>
                            <div className="sheetRodape">
                                <button type="button" className="sheetLimpar" onClick={limpar} disabled={totalAtivos === 0}>
                                    Limpar
                                </button>
                                <button type="button" className="sheetAplicar" onClick={() => setAberto(false)}>
                                    Ver lugares
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    // ============================== DESKTOP ==================================
    return (
        <section className="filtrosBar">
            <div className="conteudoWrapper filtrosBarInner">
                {grupos}
                {linhaChips}
            </div>
        </section>
    )
}

export default FiltrosBar
