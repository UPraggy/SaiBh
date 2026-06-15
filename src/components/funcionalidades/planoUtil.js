/**
 * planoUtil.js
 * -----------------------------------------------------------------------------
 * Plano portátil: serializa uma lista de lugares (+ alguns filtros) num link
 * curto que pode ser compartilhado e reaberto DENTRO do próprio app. A pessoa
 * que recebe o link cai na home com a lista já montada no painel "Meus lugares".
 *
 * Formato: ?plano=<base64url(JSON)>   →   { v:1, ids:[...], f:{...} }
 * Usa base64url (sem +,/,=) pra não quebrar em URL/WhatsApp.
 */

// ---- base64url <-> string (com suporte a acento via encode/decode URI) ----
function paraBase64Url(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)))
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function deBase64Url(b64u) {
    const b64 = b64u.replace(/-/g, '+').replace(/_/g, '/')
    return decodeURIComponent(escape(atob(b64)))
}

/**
 * codificarPlano({ ids, filtros }) → string base64url
 * Guarda só o essencial dos filtros (pra não inflar o link).
 */
export function codificarPlano({ ids = [], filtros = {} } = {}) {
    const f = {}
    if (filtros.periodo && filtros.periodo !== 'qualquer') f.p = filtros.periodo
    if (filtros.comBebe) { f.b = 1; if (filtros.idadeBebe) f.bi = filtros.idadeBebe }
    if (filtros.pessoas && filtros.pessoas !== 2) f.pe = filtros.pessoas
    if (filtros.custoMax) f.c = filtros.custoMax
    if (filtros.categoria) f.cat = filtros.categoria
    if (filtros.regiao) f.r = filtros.regiao
    if (filtros.comida && filtros.comida !== 'tanto') f.co = filtros.comida
    const payload = { v: 1, ids: ids.map(Number).filter(Boolean), f }
    return paraBase64Url(JSON.stringify(payload))
}

/** Reconstrói os filtros completos a partir da forma curta `f`. */
function expandirFiltros(f = {}) {
    const out = {}
    if (f.p) out.periodo = f.p
    if (f.b) { out.comBebe = true; if (f.bi) out.idadeBebe = Number(f.bi) }
    if (f.pe) out.pessoas = Number(f.pe)
    if (f.c) out.custoMax = f.c
    if (f.cat) out.categoria = f.cat
    if (f.r) out.regiao = f.r
    if (f.co) out.comida = f.co
    return out
}

/**
 * decodificarPlano(str) → { ids:number[], filtros:object } | null
 */
export function decodificarPlano(str) {
    if (!str) return null
    try {
        const obj = JSON.parse(deBase64Url(str))
        if (!obj || !Array.isArray(obj.ids)) return null
        return { ids: obj.ids.map(Number).filter(Boolean), filtros: expandirFiltros(obj.f) }
    } catch {
        return null
    }
}

/** Monta a URL completa do plano (base atual da app + ?plano=...). */
export function montarLinkPlano({ ids, filtros } = {}) {
    const codigo = codificarPlano({ ids, filtros })
    const base = `${window.location.origin}${window.location.pathname}`
    return `${base}?plano=${codigo}`
}

/** Lê (e devolve) o plano da URL atual, se houver. Não altera a URL. */
export function lerPlanoDaUrl() {
    const params = new URLSearchParams(window.location.search)
    const codigo = params.get('plano')
    return codigo ? decodificarPlano(codigo) : null
}

/** Remove o ?plano= da barra de endereço sem recarregar a página. */
export function limparPlanoDaUrl() {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('plano')) return
    url.searchParams.delete('plano')
    window.history.replaceState({}, '', url.pathname + url.search + url.hash)
}

const planoUtil = { codificarPlano, decodificarPlano, montarLinkPlano, lerPlanoDaUrl, limparPlanoDaUrl }
export default planoUtil
