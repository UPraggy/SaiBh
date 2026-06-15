/**
 * Logo.jsx
 * -----------------------------------------------------------------------------
 * Marca do SaiBH = "Pin do Por do Sol": um pin de mapa (gota) com uma cena de
 * por do sol dentro (sol + montanhas). Mesmo desenho do favicon, em React.
 *
 * Variantes:
 *  - variante="colorida" (default) -> pin vinho com cena quente; usar em fundo claro.
 *  - variante="clara"               -> versao p/ fundo escuro (header vinho): o pin
 *                                      fica creme e a cena ganha contornos suaves.
 *
 * O wordmark "SaiBH" fica ao lado (Bricolage Grotesque, via CSS .logoTexto).
 */
import '../../assets/css/Logo.css'

// geometria FIEL ao kit (design/SaiBh/svg/logo/saibh-pin-cor.svg, viewBox 0 0 64 64)
const PIN_PATH = 'M32 4c-11 0-19 8-19 19 0 14 19 33 19 33s19-19 19-33C51 12 43 4 32 4z'
const MONT_FRENTE = 'M8 40 L20 32 L30 38 L40 30 L56 40 L56 60 L8 60 Z'
const MONT_FUNDO = 'M8 46 L22 40 L32 45 L44 39 L56 46 L56 60 L8 60 Z'

function PinSVG({ size = 34, variante = 'colorida' }) {
    const idClip = `pinClip-${variante}`
    const clara = variante === 'clara'
    const mono = variante === 'mono'

    // paleta por variante (fiel aos 3 SVGs de pin do kit)
    const corPin = clara ? 'none' : mono ? '#8a1f3f' : '#fdf3e2'
    const corAro = clara ? '#ffffff' : '#8a1f3f'
    const corSol = clara ? '#f5c46b' : mono ? '#8a1f3f' : '#f5a623'
    const corMontF = clara ? 'rgba(255,255,255,.5)' : mono ? '#8a1f3f' : '#d06a3c'
    const corMontB = clara ? '#ffffff' : mono ? '#8a1f3f' : '#8a1f3f'

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
            className="logoPin"
        >
            <defs>
                <clipPath id={idClip}>
                    <path d={PIN_PATH} />
                </clipPath>
            </defs>

            {/* corpo do pin */}
            <path d={PIN_PATH} fill={corPin} stroke={corAro} strokeWidth="3" />

            {/* cena de por do sol (sol + montanhas), recortada pelo pin */}
            <g clipPath={`url(#${idClip})`}>
                <circle cx="32" cy="21" r="8" fill={corSol} />
                <path d={MONT_FRENTE} fill={corMontF} />
                <path d={MONT_FUNDO} fill={corMontB} />
            </g>
        </svg>
    )
}

/**
 * Logo completa: pin + wordmark.
 * @param {('colorida'|'clara')} variante
 * @param {boolean} comTexto  exibir o wordmark "SaiBH" (default true)
 * @param {string}  subtitulo texto pequeno sob o wordmark (opcional)
 * @param {number}  size      tamanho do pin
 */
function Logo({ variante = 'colorida', comTexto = true, subtitulo, size = 34 }) {
    return (
        <span className={`logo logo-${variante}`}>
            <PinSVG size={size} variante={variante} />
            {comTexto && (
                <span className="logoTextoWrap">
                    <span className="logoTexto">
                        Sai<b>BH</b>
                    </span>
                    {subtitulo && <small className="logoSub">{subtitulo}</small>}
                </span>
            )}
        </span>
    )
}

export { PinSVG }
export default Logo
