/**
 * DestaqueHoje.jsx — Hero "Hoje para você" (Identidade Visual quente).
 * -----------------------------------------------------------------------------
 * Junta o clima ao vivo de BH com uma leitura do dia + o ranking dos melhores
 * lugares de hoje (já pontuados pela HomePage).
 *
 * A frase-resumo REAGE ao toggle "considerar clima":
 *   - ligado  -> narrativa muda conforme o tempo (chuva/nublado/limpo) e período
 *   - desligado -> ranking puro pelos filtros (lugares ao ar livre voltam à disputa)
 *
 * Sem emoji: usa o set próprio de ícones (Icone / CategoriaIcone).
 * CTA "Me Surpreenda" (terracota) dispara o sorteio na HomePage.
 *
 * Props:
 *   clima            objeto do clima.js ({ ok, temp, icone, ... }) ou null
 *   lugaresHoje      ranking estável do dia (lugares já pontuados)
 *   considerarClima  bool — espelha o filtro; controla a narrativa
 *   onSurpresa       () => void — botão "Me Surpreenda"
 *   ativaResp        true em telas <=767px
 */
import GlobalVar from './GlobalVar.jsx'
import { Icone, CategoriaIcone } from './Icones.jsx'
import '../../assets/css/DestaqueHoje.css'

// clima.icone ('sol'|'nublado'|'chuva'|'tempestade') -> chave do nosso set de ícones
const ICONE_CLIMA = { sol: 'sol', nublado: 'nuvem', chuva: 'chuva', tempestade: 'tempestade' }

const LABEL_PERIODO = { manha: 'a manhã', tarde: 'a tarde', noite: 'a noite' }

/** Frase-resumo do dia: reage ao toggle de clima, ao tempo e ao período. */
function fraseDoDia(clima, considerarClima) {
    const periodo = GlobalVar.periodoAtual()
    const lp = LABEL_PERIODO[periodo] || 'o dia'

    // clima desligado -> narrativa de "ranking puro"
    if (considerarClima === false) {
        return 'Clima desligado — ranking puro pelos seus filtros. Lugares ao ar livre voltam pra disputa.'
    }

    if (!clima || !clima.ok) {
        return `Selecionei lugares baratos e gratuitos pra curtir ${lp} em BH com a família.`
    }
    if (clima.categoria === 'chuva') {
        return `Tempo de chuva (${clima.temp}°C): priorizei lugares cobertos — cafés, bares e mercados — pra curtir ${lp} sem se preocupar com o tempo.`
    }
    if (clima.categoria === 'nublado') {
        return `Céu nublado e ${clima.temp}°C: dá pra arriscar o ar livre, mas deixei opções cobertas no topo caso a chuva chegue.`
    }
    return `Tempo aberto e ${clima.temp}°C: dia perfeito pra parques, praças e mirantes. Aproveite ${lp}!`
}

function DestaqueHoje({ clima, lugaresHoje, considerarClima = true, onSurpresa, ativaResp }) {
    const dia = GlobalVar.diasSemana[GlobalVar.diaAtual()]
    const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    const temClima = clima && clima.ok
    const ranking = Array.isArray(lugaresHoje) ? lugaresHoje.slice(0, ativaResp ? 3 : 5) : []

    return (
        <section className="destaqueHoje">
            <div className="conteudoWrapper destaqueInner">

                <div className="destaqueTexto">
                    <span className="destaqueTag">
                        <Icone nome="raio" size={13} /> Hoje para você
                    </span>
                    <h1>{dia}, {data}</h1>
                    <p className="destaqueFrase">{fraseDoDia(clima, considerarClima)}</p>

                    <div className="destaqueAcoes">
                        {onSurpresa && (
                            <button type="button" className="btnSurpresa" onClick={onSurpresa}>
                                <Icone nome="dado" size={18} /> Me surpreenda
                            </button>
                        )}
                    </div>

                    {temClima && (
                        <div className="destaqueClima">
                            <span className="climaIcone">
                                <Icone nome={ICONE_CLIMA[clima.icone] || 'sol'} size={26} />
                            </span>
                            <div className="climaInfo">
                                <strong>{clima.temp}°C</strong>
                                <span className="climaDesc">{clima.descricao}</span>
                                <small>
                                    Máx {clima.maxHoje}° · Mín {clima.minHoje}° · {clima.probChuva}% de chuva
                                    {clima.porSol ? ` · pôr do sol ${clima.porSol}` : ''}
                                </small>
                            </div>
                        </div>
                    )}
                </div>

                {ranking.length > 0 && (
                    <div className="destaqueTopo">
                        <span className="destaqueTopoTitulo">
                            <Icone nome="estrela" size={16} /> Top de hoje
                        </span>
                        <ol className="destaqueRank">
                            {ranking.map((l, i) => (
                                <li key={l.id}>
                                    <span className="rankPos">{i + 1}</span>
                                    <span className="rankThumb">
                                        <CategoriaIcone categoria={l.categoria} size={36} className="rankThumbIcone" />
                                        {l.foto && (
                                            <img
                                                className="rankThumbFoto"
                                                src={l.foto}
                                                alt={l.nome}
                                                loading="lazy"
                                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                                            />
                                        )}
                                    </span>
                                    <span className="rankNome">{l.nome}</span>
                                    <span className="rankScore">{l.score}%</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </section>
    )
}

export default DestaqueHoje
