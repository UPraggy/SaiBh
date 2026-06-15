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
}
