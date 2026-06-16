/**
 * CardLugar.jsx — cartao de lugar (Treatment A da Identidade Visual).
 * -----------------------------------------------------------------------------
 * - Capa: foto real OU fallback com o icone da categoria (sem emoji).
 * - Selo de match (%) colorido por faixa: verde >=90, terracota 70-89, cafe <70.
 *   (Verde e EXCLUSIVO do match.)
 * - Estrelas reais SO quando o lugar tem `nota` (curados/Google). OSM nao tem.
 * - Badges com icones proprios (comida / bebe / gratis / periodos).
 * - Checklist de motivos (porques da nota) com icone de check.
 * - Botao de coracao p/ salvar em "Meus Lugares".
 * - Anel terracota quando vem do "Me Surpreenda" (prop surpresa/destaque).
 *
 * Props:
 *   lugar         objeto ja pontuado (score, motivos[], abertoAgora, ...)
 *   salvo         bool — esta em Meus Lugares
 *   onToggleSalvo (id) => void
 *   surpresa      bool — realce do "Me Surpreenda"
 */
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import LugaresBH from '../funcionalidades/lugaresBH.js'
import GlobalVar from './GlobalVar.jsx'
import { Icone, CategoriaIcone } from './Icones.jsx'
import '../../assets/css/CardLugar.css'

const LABEL_PERIODO = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

// faixa de cor do selo de match
function faixaScore(score) {
    if (score >= 90) return 'alto'   // verde
    if (score >= 70) return 'medio'  // terracota
    return 'baixo'                   // cafe
}

/** Estrelas reais com preenchimento proporcional (sobreposicao recortada). */
function Estrelas({ nota }) {
    const pct = Math.max(0, Math.min(100, (nota / 5) * 100))
    const cinco = [0, 1, 2, 3, 4]
    return (
        <span className="cardEstrelas" aria-label={`Nota ${nota} de 5`}>
            <span className="estBase">
                {cinco.map((i) => <Icone key={i} nome="estrela" size={14} />)}
            </span>
            <span className="estFill" style={{ width: `${pct}%` }}>
                {cinco.map((i) => <Icone key={i} nome="estrela" size={14} />)}
            </span>
        </span>
    )
}

function CardLugar({ lugar, salvo = false, onToggleSalvo, surpresa = false, destaque = false, visitado = false, onToggleVisitado }) {
    const [imgErro, setImgErro] = useState(false)
    const [zoom, setZoom] = useState(false)
    const realce = surpresa || destaque

    const cat = LugaresBH.categorias[lugar.categoria]
    const temFoto = lugar.foto && !imgErro
    // Foto REAL (curada, do próprio local) → ampliável; ILUSTRATIVA (Unsplash por
    // categoria, marcada em comFoto) → ganha o selo "Imagem ilustrativa".
    const fotoReal = temFoto && !lugar.fotoInventada
    const fotoIlustrativa = temFoto && lugar.fotoInventada

    // fecha o lightbox no Esc e trava o scroll do fundo enquanto aberto
    useEffect(() => {
        if (!zoom) return
        const onKey = (e) => { if (e.key === 'Escape') setZoom(false) }
        document.addEventListener('keydown', onKey)
        const scrollAnterior = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = scrollAnterior
        }
    }, [zoom])
    const temNota = typeof lugar.nota === 'number'
    const faixa = faixaScore(lugar.score)
    const motivos = Array.isArray(lugar.motivos) ? lugar.motivos.slice(0, 3) : []

    // status contextual (dia/período escolhido). Fallback p/ cards que não
    // passam pelo motor (ex.: DestaqueHoje) — mantém o "agora" clássico.
    const statusTipo = lugar.statusTipo || (lugar.abertoAgora ? 'aberto' : 'fechado')
    const statusLabel = lugar.statusLabel || (lugar.abertoAgora ? 'Aberto agora' : 'Fechado agora')

    return (
        <>
        <article className={`cardLugar ${realce ? 'cardSurpresa' : ''}`} data-cat={lugar.categoria}>
            {/* ---------------- Capa ---------------- */}
            <div className={`cardTopo ${fotoReal ? 'cardTopoReal' : ''}`}>
                {temFoto ? (
                    fotoReal ? (
                        // foto real → botão que abre o lightbox (ampliar)
                        <button
                            type="button"
                            className="cardFotoBtn"
                            onClick={() => setZoom(true)}
                            aria-label={`Ampliar foto de ${lugar.nome}`}
                            title="Ampliar foto"
                        >
                            <img
                                className="cardFoto cardFotoReal"
                                src={lugar.foto}
                                alt={lugar.nome}
                                loading="lazy"
                                onError={() => setImgErro(true)}
                            />
                            <span className="cardAmpliarDica">
                                <Icone nome="busca" size={15} /> Ampliar
                            </span>
                        </button>
                    ) : (
                        <img
                            className="cardFoto"
                            src={lugar.foto}
                            alt={lugar.nome}
                            loading="lazy"
                            onError={() => setImgErro(true)}
                        />
                    )
                ) : (
                    <div className="cardFallback">
                        <CategoriaIcone categoria={lugar.categoria} size={60} />
                    </div>
                )}

                {/* selo de imagem ilustrativa (OSM/Google sem foto real do local) */}
                {fotoIlustrativa && (
                    <span
                        className={`cardFotoIlustrativa ${realce ? 'acimaSurpresa' : ''}`}
                        title="Foto ilustrativa da categoria — não é a imagem real do local. Toque em “Ver no mapa” para fotos reais."
                    >
                        <Icone nome="info" size={12} /> Imagem ilustrativa
                    </span>
                )}

                {/* selo de match */}
                {typeof lugar.score === 'number' && (
                    <span className={`cardSelo score-${faixa}`} title="Compatibilidade com seus filtros">
                        <b>{lugar.score}%</b>
                        <small>match</small>
                    </span>
                )}

                {/* status: respeita o dia/período escolhido (não só a hora atual) */}
                <span className={`cardStatus ${statusTipo}`}>
                    <i /> {statusLabel}
                </span>

                {/* acoes do topo: ja fui + salvar */}
                <div className="cardAcoesTopo">
                    {onToggleVisitado && (
                        <button
                            type="button"
                            className={`cardAcaoBtn cardJaFui ${visitado ? 'ativo' : ''}`}
                            aria-pressed={visitado}
                            aria-label={visitado ? 'Marcar que ainda não foi' : 'Marcar que já foi aqui'}
                            title={visitado ? 'Você já foi aqui' : 'Marcar “Já fui”'}
                            onClick={() => onToggleVisitado(lugar.id)}
                        >
                            <Icone nome="check" size={18} />
                        </button>
                    )}
                    <button
                        type="button"
                        className={`cardAcaoBtn cardSalvar ${salvo ? 'salvo' : ''}`}
                        aria-pressed={salvo}
                        aria-label={salvo ? 'Remover dos meus lugares' : 'Salvar nos meus lugares'}
                        onClick={() => onToggleSalvo && onToggleSalvo(lugar.id)}
                    >
                        <Icone nome={salvo ? 'coracaoCheio' : 'coracao'} size={19} />
                    </button>
                </div>

                {realce && (
                    <span className="cardSurpresaTag">
                        <Icone nome="dado" size={13} /> Sua surpresa
                    </span>
                )}
            </div>

            {/* ---------------- Corpo ---------------- */}
            <div className="cardCorpo">
                <div className="cardCabecalho">
                    <h3>{lugar.nome}</h3>
                    <span className="cardCusto" title={GlobalVar.labelCusto(lugar.custo)}>
                        {GlobalVar.simboloCusto(lugar.custo)}
                    </span>
                </div>

                <div className="cardLinhaMeta">
                    {temNota ? (
                        <span className="cardNota">
                            <Estrelas nota={lugar.nota} />
                            <strong>{lugar.nota.toFixed(1)}</strong>
                            {lugar.avaliacoes ? <small>({lugar.avaliacoes.toLocaleString('pt-BR')})</small> : null}
                        </span>
                    ) : (
                        <span className="cardSemNota">
                            <Icone nome="mapa" size={13} /> OpenStreetMap
                        </span>
                    )}
                    <span className="cardCat">{cat?.label || lugar.categoria}</span>
                </div>

                {/* localização → abre o lugar no Google Maps (rota, endereço e fotos reais) */}
                <a
                    className="cardLocal"
                    href={GlobalVar.mapsUrl(lugar)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir no Google Maps — rota, endereço e mais fotos"
                >
                    <span className="cardLocalTexto">
                        <Icone nome="pin" size={13} /> {lugar.regiao}
                        {lugar.endereco && <small className="cardEndereco">{lugar.endereco}</small>}
                    </span>
                    <span className="cardLocalMaps">
                        <Icone nome="mapa" size={13} /> Ver no mapa
                    </span>
                </a>

                {lugar.descricao && <p className="cardDescricao">{lugar.descricao}</p>}

                <div className="cardBadges">
                    {lugar.custo === 'gratis' && (
                        <span className="badge badgeGratis"><Icone nome="dinheiro" size={12} /> De graça</span>
                    )}
                    {lugar.temComida && (
                        <span className="badge"><Icone nome="restaurante" size={12} /> Tem comida</span>
                    )}
                    {lugar.bebe && (
                        <span className="badge"><Icone nome="bebe" size={12} /> Com bebê</span>
                    )}
                    {Array.isArray(lugar.periodos) && lugar.periodos.map((p) => (
                        <span key={p} className="badge badgePeriodo">{LABEL_PERIODO[p] || p}</span>
                    ))}
                </div>

                {motivos.length > 0 && (
                    <ul className="cardMotivos">
                        {motivos.map((m, i) => (
                            <li key={i}>
                                <Icone nome="check" size={13} /> <span>{m}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {lugar.bebeObs && (
                    <p className="cardBebeObs">
                        <Icone nome="bebe" size={13} /> {lugar.bebeObs}
                    </p>
                )}
            </div>
        </article>

        {/* ---------------- Lightbox (ampliar foto real) — portal p/ escapar
            do transform do card e de wrappers animados ---------------- */}
        {zoom && fotoReal && createPortal(
            <div
                className="cardLightbox"
                role="dialog"
                aria-modal="true"
                aria-label={`Foto de ${lugar.nome}`}
                onClick={() => setZoom(false)}
            >
                <button
                    type="button"
                    className="cardLightboxFechar"
                    aria-label="Fechar"
                    onClick={() => setZoom(false)}
                >
                    <Icone nome="x" size={22} />
                </button>
                <figure className="cardLightboxFig" onClick={(e) => e.stopPropagation()}>
                    <img src={lugar.foto} alt={lugar.nome} />
                    <figcaption>
                        <strong>{lugar.nome}</strong>
                        <a
                            href={GlobalVar.mapsUrl(lugar)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Icone nome="mapa" size={14} /> Ver no Google Maps
                        </a>
                    </figcaption>
                </figure>
            </div>,
            document.body,
        )}
        </>
    )
}

export default CardLugar
