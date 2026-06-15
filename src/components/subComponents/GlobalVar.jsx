export default class GlobalVar {
    // Belo Horizonte (centro de referencia p/ clima e distancias)
    static BH_LAT = -19.9208
    static BH_LNG = -43.9378

    static diasSemana = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
    static diasSemanaCurto = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

    static getLocalStorage(chave) {
        try { return JSON.parse(sessionStorage.getItem(chave)) } catch { return null }
    }
    static setLocalStorage(chave, valor) {
        return sessionStorage.setItem(chave, JSON.stringify(valor));
    }

    // ---- localStorage REAL (persiste entre sessoes) — usado por "Meus Lugares" ----
    static getLocal(chave) {
        try { return JSON.parse(localStorage.getItem(chave)) } catch { return null }
    }
    static setLocal(chave, valor) {
        try { localStorage.setItem(chave, JSON.stringify(valor)) } catch { /* quota/privado */ }
    }

    // ---- Datas / horas ----
    static diaAtual() { return new Date().getDay() }          // 0=Dom ... 6=Sab
    static horaAtual() {                                       // hora decimal: 13.5 = 13h30
        const d = new Date();
        return d.getHours() + d.getMinutes() / 60;
    }
    static horaAgoraTexto() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    static minutosParaDecimal(hhmm) {
        if (!hhmm) return null;
        const [h, m] = hhmm.split(':').map(Number);
        return h + m / 60;
    }
    static periodoAtual() {                                    // manha / tarde / noite
        const h = new Date().getHours();
        if (h < 12) return 'manha';
        if (h < 18) return 'tarde';
        return 'noite';
    }

    // ---- Formatadores BR ----
    static converteReais = (valor) => `R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    static labelCusto(custo) {
        return ({ gratis: 'Gratis', barato: 'Barato', medio: 'Medio', caro: 'Caro' })[custo] || custo;
    }
    static simboloCusto(custo) {
        return ({ gratis: 'Free', barato: '$', medio: '$$', caro: '$$$' })[custo] || '$';
    }
    static labelPeriodo(p) {
        return ({ manha: 'Manha', tarde: 'Tarde', noite: 'Noite', qualquer: 'Qualquer horario' })[p] || p;
    }

    // ---- Google Maps ----
    /**
     * mapsUrl(lugar) — link p/ abrir o lugar no Google Maps (onde estão a rota,
     * o endereço completo e a galeria de fotos reais). Busca por nome+endereço+
     * região + "Belo Horizonte, MG", que cai direto na ficha do lugar. Quando há
     * coordenadas (OSM), elas entram como âncora extra de precisão.
     */
    static mapsUrl(lugar) {
        if (!lugar) return 'https://www.google.com/maps'
        const partes = [lugar.nome, lugar.endereco, lugar.regiao, 'Belo Horizonte, MG']
            .filter((p) => p && String(p).trim())
        const temCoord = typeof lugar.lat === 'number' && typeof lugar.lng === 'number'
        const query = temCoord
            ? `${partes.join(', ')} @${lugar.lat},${lugar.lng}`
            : partes.join(', ')
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    }
}
