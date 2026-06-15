# Prompt para a IA de Desenvolvimento — SaiBH (redesign + toggle de clima)

> Cole este texto na sua IA de dev (Cursor, Claude Code, v0, etc.) junto com o dossiê
> visual `SaiBH Identidade e Redesign.dc.html` (abra no navegador como referência viva)
> e os prints do app atual. Você é um app **React**.

---

## Contexto

SaiBH é um app web React que ranqueia ~2.126 lugares de BH e região por um **score de
0–100%** calculado de 9 fatores (clima ao vivo, dia, horário, período, bebê+idade,
pessoas, custo, comida, categoria/região). A lista vem ordenada do melhor pro pior.
Estrela só aparece quando o lugar tem **nota real**.

Estamos fazendo **dois trabalhos**: (1) um **redesign de identidade** (paleta quente,
fontes, logo, ícones, componentes) e (2) uma **feature nova obrigatória**: o usuário
poder **ligar/desligar a influência do clima** no ranking.

---

## PARTE A — Feature nova: toggle "Considerar o clima de hoje"

Hoje o clima é **sempre** aplicado no score. Precisamos torná-lo opcional.

### A1. `recomendar.js` (motor de score)

Adicione um parâmetro/flag `considerarClima` (default `true`) e só aplique o termo do
clima quando ele for `true`.

```js
// ANTES (pseudocódigo do que existe hoje)
function calcularScore(lugar, ctx) {
  let s = 50;
  // ... outros fatores ...
  s += termoClima(lugar, ctx.clima);   // <- sempre aplicado
  return clamp(s, 0, 100);
}

// DEPOIS
function calcularScore(lugar, ctx, opts = {}) {
  const { considerarClima = true } = opts;
  let s = 50;
  // ... outros fatores (dia, horário, período, bebê, pessoas, custo, comida) ...
  if (considerarClima) {
    s += termoClima(lugar, ctx.clima); // cobertos sobem na chuva; ao ar livre sobe no sol
  }
  return clamp(s, 0, 100);
}

// e na função que ranqueia a lista:
function recomendar(lugares, ctx, filtros) {
  return lugares
    .map(l => ({ ...l, score: calcularScore(l, ctx, { considerarClima: filtros.considerarClima }) }))
    .filter(/* soAberto etc. */)
    .sort((a, b) => b.score - a.score);
}
```

> Importante: quando `considerarClima === false`, os "motivos" do card que falam de
> clima ("Coberto — seguro pra chuva de hoje" / "Ao ar livre — exposto à chuva")
> **não devem ser exibidos**. Condicione a geração desses motivos ao flag também.

### A2. Estado / contexto do filtro

No estado dos filtros (Context, Redux, Zustand — o que você usa), adicione:

```js
considerarClima: true,   // default ligado
```

E exponha um setter `setConsiderarClima(bool)`. Ao mudar, **recalcule o ranking** e
atualize a **narrativa do topo** (texto "Hoje para você").

### A3. `FiltrosBar.jsx` — o controle visual

Adicione um bloco no topo do filtro:

- Switch acessível (`role="switch"`, `aria-checked`, navegável por teclado) rotulado
  **"Considerar o clima de hoje"**.
- Ligado: cor `--verde` no trilho + ícone sol; subtítulo "Chuva hoje — favorecendo
  lugares cobertos". Desligado: `--cafe-3` + ícone nuvem; subtítulo "O tempo não
  influencia o ranking agora".
- Ao lado, mostrar o **clima atual** que já existe no header: `17°C · 88% chuva`.

```jsx
<button
  role="switch"
  aria-checked={considerarClima}
  aria-label="Considerar o clima de hoje"
  onClick={() => setConsiderarClima(!considerarClima)}
  className="toggle-clima">
  <span className="toggle-thumb" />
</button>
```

### A4. Narrativa do topo

```js
const narrativa = considerarClima
  ? `Tempo de chuva (${temp}°C): priorizei lugares cobertos, cafés e bares pra curtir a noite sem se preocupar com o tempo.`
  : `Clima desligado — ranking puro pelos seus filtros. Lugares ao ar livre voltam pra disputa.`;
```

---

## PARTE B — Sistema visual (tokens em `:root`)

Substitua a paleta navy/verde pela paleta quente. **O verde é exclusivo do score de
match** (única cor fria → sinal de positivo).

```css
:root{
  --vinho:#8a1f3f; --vinho-d:#6b1530;            /* PRIMÁRIA — header, botões ativos */
  --terracota:#d06a3c; --terracota-cl:#e8956a;   /* SECUNDÁRIA — ações, ícones */
  --rosa:#f2d7cd; --rosa-bg:#faeee7;             /* chips, blocos, fundos suaves */
  --cafe:#3b2419; --cafe-2:#6b5345; --cafe-3:#9a8675; /* textos */
  --bege:#f7efe4;                                /* fundo da página */
  --bege-card:#fffaf3; --bege-borda:#ece0d2; --areia:#e9dccb; /* superfícies/bordas */
  --verde:#1f9d6e; --verde-cl:#2ecc8f;           /* SÓ score de match positivo */
  --navy:#15405c;                                /* toque de contraste / info */
  --estrela:#f5a623;                             /* notas/avaliações */
  --alerta:#c8402f;                              /* fechado / erro */
  --r:18px; --r-sm:11px;
  --sh:0 8px 26px rgba(59,36,25,.09);
  --sh-h:0 18px 42px rgba(59,36,25,.16);
  --t:.25s ease;
  --f-disp:'Bricolage Grotesque',Poppins,sans-serif; /* títulos, números, wordmark */
  --f-ui:'Plus Jakarta Sans',Inter,sans-serif;       /* UI e corpo */
}
```

Fontes (Google Fonts):
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Mapa de uso de cor
| Elemento | Cor |
|---|---|
| Header, botão de segmento ATIVO, contador "+" | `--vinho` |
| Botão "Me Surpreenda", ícones de categoria, realces | `--terracota` |
| Chips de filtro ativo, blocos do bebê | `--rosa-bg` + texto `--vinho` |
| Fundo da página / cards | `--bege` / `--bege-card` |
| Texto forte / secundário / terciário | `--cafe` / `--cafe-2` / `--cafe-3` |
| **% de match (selo, Top de hoje)** | **`--verde` (≥90%), `--terracota` (70–89%), `--cafe-2` (<70%)** |
| Estrelas | `--estrela` |
| "Fechado agora" / erro | `--alerta` |
| Categoria Cultura / badges de info | `--navy` |

---

## PARTE C — Componentes do redesign

1. **Logo** — **ESCOLHIDO: "Pin do Pôr do Sol"** (pin de mapa com um pôr do sol dentro).
   Usar SVG. Wordmark "Sai**BH**" com BH em `#f5c46b` sobre header vinho. No header (fundo
   escuro) usar a **versão "light"**: contorno do pin e montanhas em creme/branco + sol
   em `#f5c46b` (alto contraste). Gerar também versão colorida (sobre claro) + favicon.
2. **Ícones** — set SVG próprio (traço 1.8px, cantos arredondados). Categorias num
   quadrado com gradiente quente por tipo; UI em traço que herda `currentColor`.
   Use os ícones de categoria como **fallback** quando o lugar não tiver foto.
3. **Segment controls** (período, custo) — pílulas; ativo = `--vinho` preenchido +
   sombra; inativo = branco com borda `--bege-borda`.
4. **Selects estilizados** (comida/categoria/região) — caixa branca, borda
   `--bege-borda`, raio 12px, chevron SVG. Não usar `<select>` cru.
5. **Contador de pessoas** — "−" em `--rosa-bg`/`--vinho`, "+" em `--vinho`/branco,
   número em fonte display.
6. **Bloco do bebê** — checkbox revela o slider de idade (0–60 meses) com transição
   suave de `max-height`/`opacity` (~0.3s). Bloco fica `--rosa-bg` quando ativo.
7. **Chips de filtros ativos** + botão "Limpar tudo".
8. **Card de lugar** — capa (foto ou ícone de categoria), selo de match (cor por faixa),
   badge de status, estrelas reais, badges (preço, "Tem comida", "Pode ir com bebê",
   períodos), checklist de motivos. Três layouts no dossiê (A foto+checklist / B lista /
   C editorial); **ESCOLHIDO: A (foto + match + checklist)**.

> **Decisões travadas pelo cliente:** Logo = **Pin do Pôr do Sol** · Barra de filtros =
> **Tratamento A** (faixa cremosa) · Card = **Tratamento A** (foto + match + checklist).

---

## PARTE D — Features novas a implementar

- **Me Surpreenda** — botão terracota; sorteia entre os top-N do ranking atual e dá
  foco/scroll suave ao card sorteado (anel terracota). Não usar `scrollIntoView` que
  quebre layout; preferir scroll controlado.
- **Meus Lugares (checklist)** — persistir em `localStorage` a lista de IDs visitados;
  tela com contador, barra de progresso, mensagem motivacional e quebra por categoria.
- (Roadmap) Conquistas, Planejador de Encontros, Modo Família & Bebê — ver telas no dossiê.

---

## Responsividade

- **Desktop:** filtro em faixa horizontal (tratamento A do dossiê).
- **Mobile (≤767px):** botão "Filtros" abre bottom-sheet (tratamento C); período e
  toggle de clima sempre à mão; cards em coluna única (pode usar layout B).

## Aceite

- [ ] `considerarClima` (default true) liga/desliga o termo de clima no `calcularScore`.
- [ ] Desligar reordena o ranking e troca a narrativa do topo ao vivo.
- [ ] Motivos de clima somem quando o toggle está desligado.
- [ ] Toggle acessível (teclado + aria), com clima atual exibido ao lado.
- [ ] Paleta quente aplicada; verde só no match.
- [ ] Fontes Bricolage + Jakarta carregando.
- [ ] "Me Surpreenda" e "Meus Lugares" funcionando (este último persistente).
