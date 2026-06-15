/**
 * ClimaWidget.jsx
 * Clima ao vivo de BH (Open-Meteo via clima.js), em SVG proprio (sem emoji).
 * Usado inline no TopMenu e tambem no hero DestaqueHoje (modo `bloco`).
 */
import { Icone } from './Icones.jsx'
import '../../assets/css/ClimaWidget.css'

// clima.icone -> nome do icone SVG
const ICONE_SVG = { sol: 'sol', nublado: 'nuvem', chuva: 'chuva', tempestade: 'tempestade' }

function ClimaWidget({ clima, ativaResp, bloco = false }) {
    if (!clima) {
        return <div className={`climaWidget carregando ${bloco ? 'bloco' : ''}`}>Carregando clima…</div>
    }
    if (!clima.ok) {
        return (
            <div className={`climaWidget erro ${bloco ? 'bloco' : ''}`}>
                <Icone nome="nuvem" size={18} /> Clima indisponível
            </div>
        )
    }

    const nomeIcone = ICONE_SVG[clima.icone] || 'sol'

    return (
        <div className={`climaWidget cat-${clima.categoria} ${bloco ? 'bloco' : ''}`}>
            <span className="climaIcone"><Icone nome={nomeIcone} size={bloco ? 26 : 22} /></span>
            <div className="climaInfo">
                <strong className="climaTemp">{clima.temp}°C</strong>
                <span className="climaDesc">{clima.descricao}</span>
            </div>
            {(bloco || !ativaResp) && (
                <div className="climaExtra">
                    <span>máx {clima.maxHoje}° · mín {clima.minHoje}°</span>
                    <span className="climaChuva"><Icone nome="chuva" size={13} /> {clima.probChuva}%</span>
                </div>
            )}
        </div>
    )
}

export default ClimaWidget
