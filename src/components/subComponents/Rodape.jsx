/**
 * Rodape.jsx
 * Rodape com a marca (Pin do Por do Sol) + creditos e fontes dos dados.
 */
import Logo from './Logo.jsx'
import { Icone } from './Icones.jsx'
import '../../assets/css/Rodape.css'

function Rodape() {
    const ano = new Date().getFullYear()
    return (
        <footer className="rodape">
            <div className="conteudoWrapper rodapeInner">
                <div className="rodapeMarca">
                    <Logo variante="clara" size={30} />
                    <small>Os melhores lugares para sair em Belo Horizonte e região, no momento certo.</small>
                </div>

                <div className="rodapeInfo">
                    <span className="rodapeFonte">
                        <Icone nome="sol" size={14} /> Clima ao vivo por Open-Meteo
                    </span>
                    <span className="rodapeFonte">
                        <Icone nome="mapa" size={14} /> Locais: curadoria + OpenStreetMap + Google
                    </span>
                    <small>© {ano} · SaiBH · feito por Rafael MR</small>
                </div>
            </div>
        </footer>
    )
}

export default Rodape
