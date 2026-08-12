/**
 * TopMenu.jsx
 * Cabecalho fixo (faixa vinho), enxuto: a MARCA em destaque no topo (esquerda)
 * + dia/hora e o clima ao vivo de BH (direita). As acoes (Meus lugares, Ja fui,
 * Me Surpreenda...) vivem agora no menu inferior (BottomNav) — antes elas
 * apertavam o topo e vazavam do layout no mobile.
 */
import Logo from './Logo.jsx'
import ClimaWidget from './ClimaWidget.jsx'
import { Icone } from './Icones.jsx'
import GlobalVar from './GlobalVar.jsx'
import '../../assets/css/TopMenu.css'

function TopMenu({ clima, ativaResp }) {
    const hoje = GlobalVar.diasSemana[GlobalVar.diaAtual()]
    const agora = GlobalVar.horaAgoraTexto()

    return (
        <header className="topMenu">
            <div className="conteudoWrapper topMenuInner">
                <Logo
                    variante="clara"
                    size={ativaResp ? 30 : 36}
                    subtitulo={!ativaResp ? 'Onde sair em Belo Horizonte e região' : undefined}
                />

                <div className="topDireita">
                    {!ativaResp && (
                        <span className="topAgora">
                            <Icone nome="calendario" size={15} /> {hoje}, {agora}
                        </span>
                    )}

                    <ClimaWidget clima={clima} ativaResp={ativaResp} />
                </div>
            </div>
        </header>
    )
}

export default TopMenu
