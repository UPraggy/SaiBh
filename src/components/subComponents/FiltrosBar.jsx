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
    diaOffset: 0,
}

// idade da criança em texto curto: "8 meses", "1 ano", "2a 3m", "10 anos"
function formatIdade(m) {
    const meses = Number(m) || 0
    if (meses < 24) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
    const anos = Math.floor(meses / 12)
    const resto = meses % 12
    if (resto === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
    return `${anos}a ${resto}m`
}

// rótulo curto de um dia à frente: "Hoje", "Amanhã" ou "Qua 18" etc.
function rotuloDia(offset, isoData) {
    if (offset === 0) return { topo: 'Hoje', base: 'agora' }
    if (offset === 1) return { topo: 'Amanhã', base: '' }
    const d = isoData ? new Date(isoData + 'T12:00:00') : new Date(Date.now() + offset * 864e5)
    const semana = GlobalVar.diasSemanaCurto[d.getDay()]
    return { topo: semana.charAt(0) + semana.slice(1).toLowerCase(), base: String(d.getDate()) }
}

function FiltrosBar({ filtros, setFiltro, limparTudo, regioes = [], clima, ativaResp, onSugerir, temVisitados = false }) {
    const [aberto, setAberto] = useState(false)

    const diaOffset = filtros.diaOffset || 0
    // monta a lista de dias selecionáveis: Hoje + os próximos da previsão (clima)
    const diasClima = clima?.ok && Array.isArray(clima.proximosDias) ? clima.proximosDias : []
    const dias = [{ offset: 0, dia: null }, ...diasClima.map((d, i) => ({ offset: i + 1, dia: d.data, info: d }))]

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
        chips.push({ k: 'comBebe', t: `Com criança (${formatIdade(filtros.idadeBebe)})`, reset: PADRAO.comBebe })
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
            {/* Qual dia? — Hoje + previsão do tempo (até 7 dias) */}
            <div className="filtroGrupo">
                <label className="filtroLabel">
                    <Icone nome="relogio" size={16} /> Qual dia você quer sair?
                </label>
                <div className="diasFita" role="group" aria-label="Escolha o dia">
                    {dias.map((d) => {
                        const r = rotuloDia(d.offset, d.dia)
                        const ativo = diaOffset === d.offset
                        return (
                            <button
                                key={d.offset}
                                type="button"
                                className={`diaPill ${ativo ? 'ativo' : ''}`}
                                onClick={() => setFiltro('diaOffset', d.offset)}
                                title={d.info ? `${d.info.descricao} · ${d.info.min}°–${d.info.max}° · ${d.info.probChuva}% chuva` : 'Agora'}
                            >
                                <strong>{r.topo}</strong>
                                {r.base ? <span>{r.base}</span> : null}
                                {d.info ? <em>{Math.round(d.info.max)}°</em> : null}
                            </button>
                        )
                    })}
                </div>
                {diaOffset > 5 && (
                    <p className="diasAviso">
                        <Icone nome="info" size={14} /> A previsão do tempo perde precisão depois de 5 dias — use como estimativa.
                    </p>
                )}
            </div>

            {/* Sugestão a partir dos lugares já visitados */}
            {onSugerir && (
                <button
                    type="button"
                    className="sugerirBtn"
                    onClick={onSugerir}
                    disabled={!temVisitados}
                    title={temVisitados ? 'Monta filtros com base nos lugares que você marcou como “Já fui”' : 'Marque alguns lugares como “Já fui” para liberar a sugestão'}
                >
                    <Icone nome="dado" size={17} />
                    <span>
                        <strong>Sugerir pelo que já curti</strong>
                        <small>{temVisitados ? 'Usa seus lugares visitados' : 'Marque lugares como “Já fui” primeiro'}</small>
                    </span>
                </button>
            )}

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
                    <Icone nome="bebe" size={17} /> Vou com criança
                </button>

                <div className={`bebeBox ${filtros.comBebe ? 'aberto' : ''}`}>
                    <div className="bebeBoxInner">
                        <label className="filtroLabel">Idade da criança</label>
                        <div className="bebeIdade">
                            <input
                                type="range" min="0" max="120" step="1"
                                value={filtros.idadeBebe}
                                onChange={(e) => setFiltro('idadeBebe', Number(e.target.value))}
                            />
                            <strong>{formatIdade(filtros.idadeBebe)}</strong>
                        </div>
                        <p className="bebeDica">
                            <Icone nome="info" size={13} /> Filtramos só lugares tranquilos pra criança e adaptamos o ranking à idade.
                        </p>
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
