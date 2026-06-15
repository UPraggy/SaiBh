# Arquitetura — SaiBH

> Como o app está organizado por dentro. Para a visão de produto e como rodar,
> veja o [README](../README.md). Para a identidade visual, veja
> [DESIGN.md](./DESIGN.md).

---

## 1. Visão geral

SaiBH é uma SPA **React 18 + Vite**, sem TypeScript (JSX dentro de `.js`/`.jsx`,
padrão do DevProfile). Não há backend: os dados são estáticos e empacotados no
bundle, mas a camada de acesso (`bancoGet.js`) sempre devolve `Promise`, então
trocar por uma API real depois é trivial — nenhuma tela precisa mudar.

O app responde a **uma** pergunta: *"onde eu saio hoje em BH?"*. Cada lugar recebe
uma nota de **0–100%** calculada por 9 fatores do mundo real, e a lista aparece
ordenada do melhor para o pior **para o momento atual**.

```
índice → routes → HomePage
                     ├── TopMenu (logo + clima ao vivo + Meus Lugares)
                     ├── FiltrosBar (desktop: faixa creme | mobile: bottom-sheet)
                     ├── DestaqueHoje (herói: 1º colocado)
                     ├── grade de CardLugar (restante, ordenado por score)
                     └── Rodape (marca + atribuição de fontes)
```

## 2. Camadas de pasta

| Pasta | Papel |
|---|---|
| `src/components/funcionalidades/` | **Lógica e dados** — sem JSX de tela. Banco, clima, algoritmo, fetch. |
| `src/components/subComponents/` | **Componentes de UI** reutilizáveis (cards, barra, widgets, ícones). |
| `src/components/HomePage.js` | Orquestra estado, chama o recomendador, distribui props. |
| `src/assets/css/` | **Um CSS por componente** + tokens (`colors.css`, `fonts.css`). |
| `scripts/` | Geradores de dataset offline (Node puro, rodam fora do app). |
| `design/` | Kit de identidade: SVGs, dossiês e raciocínio de design. |

## 3. Fluxo de dados (runtime)

1. `HomePage` monta → pede o **clima** (`clima.js`, Open-Meteo, lat/lng de BH) e a
   **lista** (`bancoGet.getLugares()`).
2. O usuário mexe nos **filtros** → `HomePage` guarda o objeto `filtros` em estado.
3. A cada mudança, `recomendar(lugares, clima, filtros)` recalcula score + motivos e
   devolve a lista ordenada. O 1º vira `DestaqueHoje`; o resto vira a grade.
4. **Meus Lugares** (visitados) fica em `localStorage` via helpers do `GlobalVar`.

> O **toggle "Considerar o clima"** só adiciona o termo de clima ao score quando
> ligado (padrão). Ao desligar, o ranking **reordena ao vivo** — é a mesma função
> `recomendar`, só sem o fator clima.

## 4. A camada de dados — 3 fontes em uma base

`bancoGet.js` concatena três origens numa lista única (`TODOS`):

| Fonte | Origem | Estrela? | Campo de qualidade |
|---|---|---|---|
| **Curados** | `lugaresBH.js` (escritos à mão) | ✅ `nota` real | `nota` (0–5) |
| **OSM** | `lugaresOSM.json` (OpenStreetMap) | ❌ | `qualidade` (completude estimada) |
| **Google** | `lugaresGoogle.json` (raspagem leve por bairro) | ✅ `nota` real | `nota` + nº de avaliações |

Regra de ouro: **estrela só quando existe `nota` real.** Lugares de OSM nunca
inventam nota — usam `qualidade` (proxy de completude do cadastro) apenas para
desempate interno, nunca exibido como estrela.

Cada lugar carrega `fonte` (`curado`/`osm`/`google`). Dados do OSM estão sob licença
**ODbL** → atribuição obrigatória no `Rodape`.

### Esquema de um lugar (campos relevantes)

```js
{
  id, nome, categoria, regiao, municipio,
  custo: 'gratis'|'barato'|'medio'|'caro',
  ambiente: 'aberto'|'fechado'|'misto',
  periodos: ['manha'|'tarde'|'noite'],
  horarios: { 0..6: { abre:'HH:MM', fecha:'HH:MM' } }, // 0=Dom
  temComida: boolean,
  bebe: boolean,                  // tranquilo pra ir com bebê?
  idealPessoas: { min, max },
  nota?: number,                  // só curados/google → vira estrela
  qualidade?: number,             // só OSM → desempate interno
  foto?: string, lat, lng, fonte
}
```

## 5. O algoritmo (`recomendar.js`)

Parte de **score 50** e ajusta por 7 blocos. Resumo dos pesos:

| Fator | Efeito no score |
|---|---|
| Funciona no período pedido | **+16** / fora: **−26** |
| Aberto agora | +8 |
| Clima × ambiente (chuva→coberto) | até **+22** / ao ar livre na chuva: **−24** |
| Bebê (lugar adequado) | **+16** / inadequado: **−30** |
| Tamanho do grupo | +8 / apertado: −8 |
| Custo dentro do teto | +10 / acima: **−16** |
| Qualidade (`nota` ou `qualidade`) | nota 4.8 → +8 |

Filtros **duros** (removem da lista, não só pontuam): categoria, região, comida
(com/sem), teto de custo, e "só aberto agora". Empate de score → desempata por
qualidade (curado usa `nota`, OSM usa `qualidade/20`).

## 6. Responsividade

Padrão DevProfile: `ativaResp` (matchMedia `max-width: 767px`) nasce nas rotas e
desce por props. Cada componente decide seu layout:

- **FiltrosBar**: desktop = faixa creme em coluna; mobile = barra compacta
  "Filtros (N)" que abre um **bottom-sheet**.
- CSS mobile vive em blocos `@media (max-width: 767px)` no fim de cada arquivo.

## 7. Build & deploy

- `npm run dev` → Vite na porta **5173**.
- `npm run build` → `dist/` estático.
- **gh-pages**: o conteúdo de `dist/` é publicado; precisa de `base` no
  `vite.config.js` apontando para o nome do repositório.
