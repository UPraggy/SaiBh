# SaiBH — Raciocínio de Design (Identidade + Redesign)

> Registro completo das decisões por trás do dossiê `SaiBH Identidade e Redesign.dc.html`.
> Data: jun/2026. Autor: design AI. Base: brief `PROMPT_IA_DESIGN.md` + 2 prints do app atual + paleta quente fornecida.

---

## 1. O problema

O SaiBH responde a **uma** pergunta: *"onde eu saio hoje em BH?"*. Ele não é mais um
diretório — é um **motor de recomendação** que dá a cada lugar uma nota de 0–100% com
base em 9 fatores do mundo real (clima ao vivo, dia, horário, período, bebê+idade,
pessoas, custo, comida, categoria/região), sobre ~2.126 lugares de BH e região.

O app atual (navy + verde) é limpo e confiável, mas **genérico** — parece um SaaS
qualquer. A pedido: dar a ele **identidade própria, quente e mineira**, sem perder a
confiabilidade, e adicionar o **toggle de clima** ("Considerar o clima de hoje").

## 2. Decisão de cor — por que virar pro quente

A direção escolhida (resposta do brief) foi **warm-dominante + um toque de navy**, com
**verde reservado só ao match**. Raciocínio:

- **Vinho `#8a1f3f`** vira a cor de comando (header, botões ativos). É sofisticado,
  apetitoso (vinho/gastronomia) e tem cara de Minas — bem diferente do navy genérico.
- **Terracota `#d06a3c`** é a secundária quente: ações de destaque ("Me Surpreenda"),
  ícones de categoria, realces. Conecta com tijolo, barro, comida.
- **Cremes e bege (`#f7efe4`, `#fffaf3`) + rosa suave `#f2d7cd`** dão o respiro e a
  sensação acolhedora. Substituem o cinza frio `#f4f6f9` do app atual.
- **Navy `#15405c`** sobrevive como **contraste escuro pontual** (info, categoria
  Cultura) — honra o pedido de "um toque do navy" sem deixá-lo mandar.
- **Verde `#1f9d6e` fica trancado no score de match.** Essa é a decisão mais importante:
  numa paleta 100% quente, o verde é **a única cor fria**, então ele *salta* — vira
  sinal inequívoco de "positivo / recomendado". É semântica, não decoração.
- **Estrela `#f5a623`** (mantida do original) e **alerta `#c8402f`** (fechado/erro)
  completam, ambos quentes, coerentes com o sistema.

Resultado: a tela inteira "respira gastronomia", e o número verde do match é o único
ponto que puxa o olho — exatamente onde queremos a atenção.

## 3. Tipografia — dando voz própria

O brief pedia Poppins/Inter/Montserrat. Para fugir do genérico (e do "AI slop" de
Inter/Roboto), troquei o par por:

- **Bricolage Grotesque (display, 600–800)** — wordmark, títulos, números grandes
  ("Sábado, 13 de junho", "2.126 lugares"). Tem caráter, leve imperfeição humana,
  combina com a pegada artesanal/mineira.
- **Plus Jakarta Sans (UI/corpo, 400–800)** — todo o resto. Geométrica humanista,
  quente, ótima legibilidade em tamanhos pequenos.

Poppins/Inter ficam documentados como **fallback** no `:root` para paridade com o que
você já tem no projeto, então nada quebra se a fonte não carregar.

## 4. Logo — 3 caminhos (você escolhe)

Mantive o nome **Sai`BH`** com o "BH" destacado. Três símbolos vetoriais (SVG, reprodutíveis):

1. **Sol da Serra** — pôr do sol mineiro sobre montanhas. Conecta direto com o fator
   *clima* (o diferencial do app) e com acolhimento. *Minha recomendação.*
2. **Boa Mesa** — taça de vinho + xícara de café num símbolo só. A alma gastronômica.
3. **Pin do Pôr do Sol** — híbrido: pin de mapa com um pôr do sol dentro (local + momento).

Os três têm versão **colorida** e **monocromática** (para header, favicon, watermark).
Clique em cada card no dossiê para ver aplicado no header do app.

## 5. Iconografia própria

Em vez de depender de emoji, criei um set **SVG** com traço único de 1.8px e cantos
arredondados:
- **Categorias** (garfo/faca, taça, xícara, árvore, ingresso, cesta) num quadradinho de
  cor por categoria — viram o *fallback elegante* quando o lugar não tem foto.
- **UI** (sol, chuva, pin, estrela, relógio, bebê, pessoas, dado, coração, troféu,
  agenda, filtros) em traço puro que herda a cor do contexto.

Emoji ficou só nos botões de período (☀️🌤️🌙) por continuidade com o app atual — o
resto é vetor reproduzível, como você pediu.

## 6. O toggle de clima (requisito novo)

Bloco dedicado no topo do filtro:
- **Switch "Considerar o clima de hoje"** (ligado por padrão).
- **Ligado** → vinho/verde + ícone de sol; subtítulo "Chuva hoje — favorecendo lugares
  cobertos". O clima entra no score (cobertos sobem na chuva).
- **Desligado** → cinza + ícone de nuvem; subtítulo "O tempo não influencia o ranking".
  O score recalcula **sem** o fator clima → o ranking **reordena ao vivo** e a narrativa
  do topo muda ("ranking puro pelos seus filtros").
- O **clima atual ("17°C · 88% chuva")** aparece colado ao toggle, pra deixar claro
  *por que* ligar/desligar faz diferença.

No dossiê isso é **interativo de verdade** — o `score()` no protótipo só soma o termo
de clima quando `considerarClima` é true.

## 7. Filtro — 3 tratamentos

- **A · Faixa cremosa agrupada** (usada na home) — clima em destaque, blocos arejados,
  segment controls em pílula, selects estilizados, contador tátil, bloco do bebê que
  expande suave, chips de filtros ativos + "limpar tudo", e o toggle de clima no topo.
- **B · Barra escura "café noturno"** — fundo café `#3b2419`, alto contraste, premium,
  compacta — ótima pro mobile.
- **C · Resumo + "abrir filtros"** — só um botão "Filtros" + chips de resumo; abre um
  bottom-sheet. Mínimo na tela, ideal pro mobile.

## 8. Card — 3 tratamentos

- **A · Foto, match e checklist** (usado na home) — capa (foto ou ícone de categoria),
  selo de match, status, estrelas reais, badges e o checklist de motivos.
- **B · Lista densa horizontal** — miniatura + texto, pra listas longas / mobile.
- **C · Editorial foto-cheia** — imagem dominante com overlay, pra destaques.

> Imagens: foto grande quando existe; **ícone de categoria** (SVG, gradiente quente)
> como fallback bonito quando não há foto — exatamente como você pediu.

## 9. Features-estrela

- **Me Surpreenda** — botão terracota na home; sorteia um lugar entre os top-ranqueados
  e destaca o card (anel terracota). Sorteio "inteligente" (puxa do topo, não aleatório puro).
- **Meus Lugares (checklist)** — colecionar experiências: marque o que já visitou,
  veja contador, barra de progresso, mensagem motivacional e quebra por categoria.
  Interativo no dossiê (clique nos itens).
- Coadjuvantes desenhadas: **Conquistas** (gamificação por categoria), **Planejador de
  Encontros** (roteiro em timeline) e **Modo Família & Bebê** (idade + checklist baby-friendly).

## 10. Tokens (reproduzíveis em CSS)

Todos no `:root` do arquivo. Resumo:

```
--vinho:#8a1f3f  --vinho-d:#6b1530  --terracota:#d06a3c  --terracota-cl:#e8956a
--rosa:#f2d7cd   --rosa-bg:#faeee7   --cafe:#3b2419  --cafe-2:#6b5345  --cafe-3:#9a8675
--bege:#f7efe4   --bege-card:#fffaf3 --bege-borda:#ece0d2 --areia:#e9dccb
--verde:#1f9d6e (SÓ match)  --verde-cl:#2ecc8f  --navy:#15405c (toque)
--estrela:#f5a623  --alerta:#c8402f
--r:18px  --r-sm:11px  --sh:0 8px 26px rgba(59,36,25,.09)  --sh-h:0 18px 42px rgba(59,36,25,.16)
--t:0.25s ease  --f-disp:'Bricolage Grotesque'  --f-ui:'Plus Jakarta Sans'
```

## 11. O que decidi NÃO fazer

- Não inventei fotos falsas de lugares — usei ícones de categoria como fallback (a pedido).
- Não enchi de números/stats decorativos — só o que tem função (match, nota, progresso).
- Não mexi na lógica dos 9 fatores além de expor o toggle de clima — a inteligência
  do score continua a mesma; só dei controle ao usuário sobre o fator clima.

## 12. Decisões travadas + próximos passos

**Cliente escolheu:** Logo **Pin do Pôr do Sol** · Filtro **A** (faixa cremosa) · Card **A** (foto + checklist).
Esses já estão aplicados como padrão no dossiê (Pin em versão "light" sobre o header escuro).

- Gerar favicon + variações a partir do Pin (colorida sobre claro, light sobre escuro, mono).
- Trocar os ícones-fallback por **fotos reais** dos lugares quando disponíveis.
- Implementar o `considerarClima` no código (ver `PROMPT_IA_DEV_SaiBH.md`).
