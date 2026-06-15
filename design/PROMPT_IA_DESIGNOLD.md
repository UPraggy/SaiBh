# Prompt para IA de Design — Redesign do filtro do SaiBH

> Cole o texto abaixo na IA de design (Figma AI, v0, Claude Design, Galileo, etc.)
> **junto com**: (1) o arquivo da minha Identidade Visual e (2) os 3 prints do app
> que estão anexados. O foco do pedido é **redesenhar a barra de filtros** —
> deixá-la mais detalhada e bonita — e **adicionar um novo controle para ligar/desligar
> a influência do clima** na recomendação.

---

## 1. O que é o SaiBH (contexto do produto)

SaiBH é um app web (React) que responde a uma pergunta só: **"onde eu saio hoje em
Belo Horizonte e região?"**. É um TripAdvisor enxuto e local — em vez de só listar
lugares, ele **ranqueia** os melhores para o momento atual do usuário.

O diferencial é o **score de recomendação**: cada lugar recebe uma nota de 0–100%
calculada a partir de fatores do mundo real, e a lista vem ordenada do melhor para o pior.

**Base de dados:** ~2.126 lugares de BH e região metropolitana próxima
(restaurantes, bares, cafés, parques e cultura), com nota real (estrelas) quando
disponível. Bairros perigosos foram excluídos de propósito.

## 2. Como funciona o score (a "inteligência" do app)

O app começa cada lugar em 50% e soma/subtrai pontos conforme:

1. **Clima de hoje (ao vivo)** — se está chovendo, lugares **cobertos/fechados**
   sobem (+); se o tempo está limpo, lugares **abertos/ao ar livre** sobem (+).
   *Hoje isso é sempre aplicado — o pedido principal deste redesign é dar ao usuário
   um botão para ligar/desligar esse fator (ver seção 5).*
2. **Dia da semana** — fim de semana favorece lazer/bares; dia útil favorece cafés etc.
3. **Horário de funcionamento** — lugar aberto agora ganha pontos; fechado perde.
4. **Período escolhido** (manhã / tarde / noite) cruzado com o horário real do lugar.
5. **Vou com bebê** — quando ligado, prioriza lugares "baby-friendly"; há um campo
   extra de **idade do bebê (em meses)** que refina a recomendação.
6. **Número de pessoas** — ajusta para lugares que comportam o tamanho do grupo.
7. **Custo** — filtro por faixa: grátis / até barato / até médio / tudo.
8. **Comida** — com comida / sem comida / tanto faz.
9. **Categoria** e **região (bairro)**.

Cada card mostra: nome, **estrelas reais** (só quando o lugar tem nota real),
categoria, bairro, descrição curta, **selo de % de match**, badges (faixa de preço,
"Tem comida", "Pode ir com bebê", períodos) e checklist de motivos
("Aberto agora", "Coberto — seguro pra chuva de hoje" etc.).

## 3. Identidade visual (use exatamente estes tokens)

> Estes valores vêm do meu arquivo de identidade (anexo). Mantenha-os fielmente.

**Cores**
```
--white-color:        #ffffff   /* fundo de cards */
--black-color:        #14181f   /* texto forte    */
--escuro-azul-color:  #0f2c4c   /* PRIMÁRIA (navy) — header, botões ativos */
--escuro-azul2-color: #14385f   /* navy 2 — gradientes */
--claro-verde-color:  #2ecc8f   /* SECUNDÁRIA (verde) — destaques, $$ , match alto */
--verde-escuro-color: #1f9d6e   /* verde escuro — hover/realce */
--azul-claro-color:   #2f6fb0   /* azul de apoio — links, badges de período */
--cinza-bg-color:     #f4f6f9   /* fundo da página */
--cinza-card-color:   #ffffff   /* superfícies */
--cinza-borda-color:  #e4e8ee   /* bordas */
--cinza-texto-color:  #5b6573   /* texto secundário */
--cinza-texto2-color: #8a93a1   /* texto terciário/placeholder */
--amarelo-nota-color: #f5a623   /* estrelas */
--vermelho-color:     #e0564b   /* alerta / fechado */
```

**Sombras, raios e transição**
```
--sombra-card:        0 6px 22px rgba(15,44,76,0.08)
--sombra-card-hover:  0 14px 34px rgba(15,44,76,0.16)
--raio:               16px      /* cards e blocos */
--raio-pequeno:       10px      /* inputs, chips */
--transicao:          0.25s ease
```

**Tipografia (Google Fonts)**
```
Títulos:   Poppins (fallback Montserrat) — peso 600/700
Texto:     Inter   (fallback Poppins)
Destaque:  Montserrat (fallback Poppins)
```

**Tom visual:** limpo, claro, arredondado, com bastante respiro. Navy como cor de
comando, verde como cor de "positivo/recomendado". Nada de roxo, gradientes
chamativos ou neon — é um app utilitário e confiável, não um app de festa.

## 4. O que eu preciso de você (escopo)

**Redesenhar a barra de filtros** que aparece logo abaixo do header (ver prints 1 e 3).
Quero que ela fique **mais detalhada, mais bonita e mais agradável de usar**, sem fugir
da identidade acima. Pode repensar layout, hierarquia, agrupamentos, ícones,
microinterações e estados — desde que continue clara e rápida de preencher.

Hoje a barra tem (ver print): seletor de **período** (Tanto faz/Manhã/Tarde/Noite em
botões-segmento), **custo** (botões-segmento), e selects de **comida**, **categoria**,
**região**, um contador de **pessoas** (− N +), o checkbox **"Vou com bebê"** (que
revela o campo *idade do bebê*) e o checkbox **"Só o que está aberto agora"**.

## 5. Requisito NOVO e obrigatório — controle de clima no filtro

Adicione um **controle dedicado ao clima** dentro do filtro:

- Um **toggle/switch** rotulado **"Considerar o clima de hoje"** (ligado por padrão).
- Quando **ligado**: o app usa a previsão atual para favorecer lugares cobertos em dia
  de chuva e abertos em dia de sol (comportamento atual).
- Quando **desligado**: o clima **não** influencia o score — o usuário vê o ranking
  "puro" pelos outros fatores.
- Mostre, junto do toggle, o **clima atual de forma elegante** (ex.: ícone + "17°C,
  88% chuva" — esses dados já existem e aparecem hoje no header). A ideia é o usuário
  entender *por que* ligar/desligar faz diferença.
- Estado visual claro para ligado (navy/verde) vs. desligado (cinza).

## 6. Detalhes de UX que quero ver no novo filtro

- **Agrupamento com títulos curtos** em caixa-alta discreta (já uso esse padrão:
  "QUANDO QUER FICAR?", "QUANTO PODE GASTAR?"). Mantenha esse tom de microcopy.
- **Segment controls** bonitos para período e custo (pílulas com ícone + label,
  estado ativo em navy preenchido).
- **Selects estilizados** (não o select cru do navegador) para comida/categoria/região.
- **Contador de pessoas** redondo e tátil.
- **Bloco do bebê**: o checkbox "Vou com bebê" revela suavemente o campo de idade
  (meses, 0–60). Capriche na transição de expandir.
- **Chips de filtros ativos** (opcional, mas desejável): um resumo do que está
  selecionado, com "limpar tudo".
- **Sticky no scroll** (desejável): a barra pode encolher e grudar no topo ao rolar.
- **Microinterações** sutis (hover, foco acessível, 0.25s ease) — sem exageros.

## 7. Responsividade

- **Desktop:** filtro em uma faixa horizontal organizada (como nos prints).
- **Mobile (≤767px):** os controles empilham; considere um botão "Filtros" que abre
  um painel/bottom-sheet, mantendo período e clima sempre à mão. Layout em coluna única.

## 8. Sobre os prints anexados

1. **Print 1 — topo do app:** header navy com logo "SaiBH", clima ao vivo no canto, e a
   barra de filtros atual + início do ranking "Top de hoje".
2. **Print 2 — grade de cards:** como os lugares aparecem (estrelas reais, selo de %,
   badges, checklist de motivos, miniatura por categoria).
3. **Print 3 — filtro com "Vou com bebê" ligado:** mostra o campo de idade do bebê
   revelado.

Use os prints como **referência do que existe hoje** — quero evoluir, não recomeçar do zero.
A identidade (cores/fontes) é inegociável; o **layout do filtro** é o que você deve
repensar e embelezar.

## 9. Entregáveis que espero

- Proposta visual da **barra de filtros redesenhada** (desktop + mobile).
- O novo **toggle "Considerar o clima de hoje"** com o clima exibido ao lado.
- Estados: padrão, hover, foco, ativo, desabilitado; bebê expandido; filtros ativos.
- Se possível, **specs** (espaçamentos, tamanhos, pesos de fonte) usando os tokens acima,
  para eu reproduzir em CSS com variáveis `:root`.
