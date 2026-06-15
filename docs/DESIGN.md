# Identidade Visual — SaiBH

> Tokens, tipografia, logo e iconografia. O raciocínio completo por trás de cada
> decisão está em [`design/RACIOCINIO_DESIGN_SaiBH.md`](../design/RACIOCINIO_DESIGN_SaiBH.md).
> Os SVGs-fonte ficam em [`design/SaiBh/svg/`](../design/SaiBh/svg/).

---

## 1. Conceito

Warm-dominante, **quente e mineira**, com um toque de navy. A tela inteira "respira
gastronomia"; o **verde** é a única cor fria e fica **trancado no score de match** —
por contraste, ele salta e vira sinal inequívoco de "recomendado".

## 2. Paleta (`src/assets/css/colors.css`)

| Token | Hex | Uso |
|---|---|---|
| `--vinho` | `#8a1f3f` | Cor de comando: header, botões ativos |
| `--vinho-d` | `#6b1530` | Vinho escuro (hover/sombra) |
| `--terracota` | `#d06a3c` | Secundária quente: "Me Surpreenda", ícones de categoria |
| `--terracota-cl` | `#e8956a` | Terracota clara (realces sobre fundo escuro) |
| `--rosa` / `--rosa-bg` | `#f2d7cd` / `#faeee7` | Respiro acolhedor, estados leves |
| `--cafe` / `--cafe-2` / `--cafe-3` | `#3b2419` / `#6b5345` / `#9a8675` | Textos (forte→suave), rodapé |
| `--bege` / `--bege-card` | `#f7efe4` / `#fffaf3` | Fundos; substituem o cinza frio do app antigo |
| `--bege-borda` / `--areia` | `#ece0d2` / `#e9dccb` | Bordas e trilhos |
| `--navy` | `#15405c` | Contraste escuro pontual (info, categoria Cultura) |
| **`--verde` / `--verde-cl`** | `#1f9d6e` / `#2ecc8f` | **Exclusivo do match-score** (ver abaixo) |
| `--estrela` | `#f5a623` | Estrelas (só com nota real) |
| `--alerta` | `#c8402f` | Fechado / erro |

Gradientes: `--grad-vinho`, `--grad-terracota`, `--grad-por-do-sol`.
Forma: `--r:18px`, `--r-sm:11px`. Sombra: `--sh`. Transição: `--t:.25s ease`.

### Regra do verde (não negociável)

`--verde` / `--verde-cl` aparecem **apenas** em:
1. o número/anel do **match-score** (0–100%);
2. o **dot de "aberto agora"**;
3. o tile da categoria **Parques**;
4. o selo/score do **1º colocado** no `DestaqueHoje`.

Em nenhum outro lugar. É semântica, não decoração.

## 3. Tipografia (`src/assets/css/fonts.css`)

- **Bricolage Grotesque** (`--f-disp`, 600–800) — wordmark, títulos, números grandes.
  Caráter artesanal, combina com a pegada mineira.
- **Plus Jakarta Sans** (`--f-ui`, 400–800) — todo o resto. Geométrica humanista,
  ótima em tamanhos pequenos.

Poppins/Inter ficam como **fallback** no `:root` para paridade com o projeto base.

## 4. Logo (`Logo.jsx` + `Logo.css`)

Wordmark **Sai`BH`** (o "BH" destacado em terracota) ao lado do **Pin do Pôr do Sol**
— pin de mapa com um pôr do sol dentro (local + momento). Geometria fiel ao kit
[`design/SaiBh/svg/logo/saibh-pin-cor.svg`](../design/SaiBh/svg/logo/).

- `variante="clara"` → sobre fundo escuro (header vinho, rodapé café).
- `variante="colorida"` → sobre fundo claro.
- `subtitulo` opcional ("Onde sair em Belo Horizonte e região").

## 5. Iconografia (`Icones.jsx`)

**Sem emoji na UI.** Set SVG próprio, traço único de 1.8px e cantos arredondados, que
**herda a cor do contexto** (`currentColor`). Uso: `<Icone nome="..." size={N} />`.

- **UI**: `sol`, `chuva`, `nuvem`, `lua`, `pin`, `estrela`, `relogio`, `bebe`,
  `pessoas`, `dado`, `coracao`/`coracao-cheio`, `trofeu`, `agenda`, `filtros`,
  `chevronBaixo`, `x`, `check`, `dinheiro`.
- **Categorias**: `garfo`, `taca`, `cafe`, `arvore`, `ingresso`, `cesta` — exibidos
  num quadradinho com gradiente quente por categoria; servem de **fallback elegante**
  quando o lugar não tem foto.

Os SVGs-fonte estão em [`design/SaiBh/svg/icones/`](../design/SaiBh/svg/icones/) e
[`design/SaiBh/svg/categorias/`](../design/SaiBh/svg/categorias/).

## 6. Componentes-chave de UI

| Componente | Tratamento |
|---|---|
| **FiltrosBar** | A · faixa creme agrupada (desktop) / bottom-sheet (mobile); toggle de clima no topo |
| **CardLugar** | A · capa (foto ou ícone de categoria), selo de match, status, estrelas reais, checklist de motivos |
| **DestaqueHoje** | herói do 1º colocado, com badge/score em verde |

## 7. Features-estrela

- **Me Surpreenda** — botão terracota; sorteia entre os top-ranqueados (sorteio
  "inteligente", puxa do topo) e destaca o card com anel terracota.
- **Meus Lugares** — checklist de experiências em `localStorage`: marca visitados,
  contador, barra de progresso e quebra por categoria.
