/**
 * TopMenu.jsx
 * Cabecalho fixo (faixa vinho): marca "Pin do Por do Sol" + clima ao vivo de BH
 * + botao "Meus Lugares" com contador. Sticky no topo.
 */
import Logo from './Logo.jsx'
import ClimaWidget from './ClimaWidget.jsx'
import { Icone } from './Icones.jsx'
import GlobalVar from './GlobalVar.jsx'
import '../../assets/css/TopMenu.css'

function TopMenu({ clima, ativaResp, salvosCount = 0, onAbrirSalvos }) {
    const hoje = GlobalVar.diasSemana[GlobalVar.diaAtual()]
    const agora = GlobalVar.horaAgoraTexto()

    return (
        <header className="topMenu">
            <div className="conteudoWrapper topMenuInner">
                <Logo
                    variante="clara"
                    size={ativaResp ? 28 : 34}
                    subtitulo={!ativaResp ? 'Onde sair em Belo Horizonte e região' : undefined}
                />

                <div className="topDireita">
                    {!ativaResp && (
                        <span className="topAgora">
                            <Icone nome="calendario" size={15} /> {hoje}, {agora}
                        </span>
                    )}

                    <ClimaWidget clima={clima} ativaResp={ativaResp} />

                    <button
                        type="button"
                        className="topSalvos"
                        onClick={onAbrirSalvos}
                        aria-label={`Meus lugares (${salvosCount} salvos)`}
                    >
                        <Icone nome={salvosCount > 0 ? 'coracaoCheio' : 'coracao'} size={19} />
                        {!ativaResp && <span>Meus lugares</span>}
                        {salvosCount > 0 && <span className="topSalvosBadge">{salvosCount}</span>}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default TopMenu
