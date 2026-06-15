import fetchFunc from './fetchFunc.js'
import GlobalVar from '../subComponents/GlobalVar.jsx'

// Traduz o WMO weather_code da Open-Meteo para algo amigavel + categoria simples
const WMO = {
    0: { txt: 'Ceu limpo', icone: 'sol' },
    1: { txt: 'Predomina sol', icone: 'sol' },
    2: { txt: 'Parcialmente nublado', icone: 'nublado' },
    3: { txt: 'Nublado', icone: 'nublado' },
    45: { txt: 'Neblina', icone: 'nublado' },
    48: { txt: 'Neblina com geada', icone: 'nublado' },
    51: { txt: 'Garoa fraca', icone: 'chuva' },
    53: { txt: 'Garoa', icone: 'chuva' },
    55: { txt: 'Garoa forte', icone: 'chuva' },
    61: { txt: 'Chuva fraca', icone: 'chuva' },
    63: { txt: 'Chuva', icone: 'chuva' },
    65: { txt: 'Chuva forte', icone: 'chuva' },
    71: { txt: 'Neve', icone: 'chuva' },
    80: { txt: 'Pancadas de chuva', icone: 'chuva' },
    81: { txt: 'Pancadas de chuva', icone: 'chuva' },
    82: { txt: 'Pancadas fortes', icone: 'chuva' },
    95: { txt: 'Tempestade', icone: 'tempestade' },
    96: { txt: 'Tempestade com granizo', icone: 'tempestade' },
    99: { txt: 'Tempestade com granizo', icone: 'tempestade' },
}

// categoria de clima usada pelo recomendador: 'limpo' | 'nublado' | 'chuva'
function categoriaClima(code, probChuva) {
    const info = WMO[code] || { icone: 'nublado' }
    if (info.icone === 'chuva' || info.icone === 'tempestade') return 'chuva'
    if (probChuva >= 60) return 'chuva'
    if (info.icone === 'nublado') return 'nublado'
    return 'limpo'
}

export async function getClimaBH() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${GlobalVar.BH_LAT}&longitude=${GlobalVar.BH_LNG}`
        + `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day`
        + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset`
        + `&timezone=America%2FSao_Paulo&forecast_days=7`

    const resp = await fetchFunc.fetchGet(url)
    if (!resp || resp['ERROR SERVER'] || !resp.current) {
        return { ok: false }
    }

    const c = resp.current
    const d = resp.daily
    const info = WMO[c.weather_code] || { txt: 'Tempo instavel', icone: 'nublado' }
    const probChuva = d?.precipitation_probability_max?.[0] ?? 0

    return {
        ok: true,
        temp: Math.round(c.temperature_2m),
        sensacao: Math.round(c.apparent_temperature),
        umidade: c.relative_humidity_2m,
        vento: Math.round(c.wind_speed_10m),
        ehDia: c.is_day === 1,
        descricao: info.txt,
        icone: info.icone,
        categoria: categoriaClima(c.weather_code, probChuva),
        probChuva,
        maxHoje: Math.round(d?.temperature_2m_max?.[0]),
        minHoje: Math.round(d?.temperature_2m_min?.[0]),
        nascerSol: d?.sunrise?.[0]?.slice(11),
        porSol: d?.sunset?.[0]?.slice(11),
        proximosDias: (d?.time || []).slice(1).map((dia, i) => {
            const code = d.weather_code[i + 1]
            const prob = d.precipitation_probability_max[i + 1]
            const wmo = WMO[code] || { txt: '-', icone: 'nublado' }
            return {
                data: dia,
                max: Math.round(d.temperature_2m_max[i + 1]),
                min: Math.round(d.temperature_2m_min[i + 1]),
                probChuva: prob,
                descricao: wmo.txt,
                icone: wmo.icone,
                categoria: categoriaClima(code, prob),
            }
        }),
    }
}

/**
 * climaDoDia(clima, offset)
 * -----------------------------------------------------------------------------
 * Devolve um objeto de clima compatível com o recomendador (precisa de
 * `ok`, `categoria`, `temp`, `probChuva`) para o dia `offset` à frente:
 *  - offset 0  → o clima de AGORA (objeto original);
 *  - offset>0  → o dia correspondente de `proximosDias` (previsão diária).
 * Assim o ranking pode considerar o tempo do dia escolhido, não só o de hoje.
 * `confiavel:false` sinaliza previsão além de ~5 dias (precisão cai).
 */
export function climaDoDia(clima, offset = 0) {
    if (!clima?.ok) return clima || { ok: false }
    if (!offset) return clima
    const dia = clima.proximosDias?.[offset - 1]
    if (!dia) return { ...clima, confiavel: offset <= 5 }
    return {
        ok: true,
        categoria: dia.categoria,
        temp: Math.round((dia.max + dia.min) / 2),
        probChuva: dia.probChuva,
        descricao: dia.descricao,
        icone: dia.icone,
        maxHoje: dia.max,
        minHoje: dia.min,
        confiavel: offset <= 5,
        previsao: true,
    }
}
