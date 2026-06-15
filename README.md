<div align="center">

# SaiBH

**Onde sair hoje em Belo Horizonte e região.**

Um app que responde a uma pergunta só — *"pra onde eu vou agora?"* — e responde
**pro momento atual**: clima ao vivo, dia da semana, horário, se você leva bebê,
quantas pessoas, quanto quer gastar e o que tem vontade de fazer.

</div>

---

## O que ele faz

Cada lugar recebe uma nota de **0 a 100%** calculada por 9 fatores do mundo real, e a
lista aparece **ordenada do melhor para o pior agora** — não uma lista alfabética
qualquer, mas "o que faz sentido neste exato momento".

- ☔ **Está chovendo?** Lugares cobertos sobem, parques descem — ao vivo, via Open-Meteo.
- 🕗 **Tá fechado?** Cai no ranking (ou some, se você marcar "só aberto agora").
- 👶 **Vai com bebê?** Lugares tranquilos pra criança ganham pontos.
- 💸 **Filtro por custo:** de graça, barato, médio ou caro — com teto.
- 🍽️ **Com ou sem comida**, e por **categoria** (cafés, parques, restaurantes, bares,
  cultura, mirantes…) e **região** da Grande BH.
- ✨ **Me Surpreenda** — sorteia entre os mais bem ranqueados quando você não sabe decidir.
- ❤️ **Meus Lugares** — marca o que já visitou e acompanha o progresso.

> **Escopo:** só **Belo Horizonte e região metropolitana**. Estrela ⭐ **apenas** em
> lugares com nota real — nada é inventado.

## Como rodar

```bash
npm install
npm run dev      # Vite em http://localhost:5173
npm run build    # build estático em dist/
```

Requer Node 18+. Sem variáveis de ambiente: o clima usa a API pública Open-Meteo e os
dados de lugares já vêm empacotados.

## Stack

React 18 + Vite · react-router-dom · framer-motion · sem TypeScript (padrão DevProfile:
JSX em `.js`/`.jsx`). Sem backend — a camada de dados devolve `Promise`, então trocar
por uma API real depois não mexe em nenhuma tela.

## Os dados

A base reúne **três fontes** numa lista só — **3.410 lugares** em BH e na Região
Metropolitana:

| Fonte | Lugares | Origem | Estrela |
|---|---:|---|---|
| **Curados** | 32 | escritos à mão, com nota real | ⭐ |
| **OpenStreetMap** | 3.146 | cadastro aberto (licença ODbL), 20 municípios da RMBH | — (usa proxy de qualidade) |
| **Google** | 232 | raspagem leve por bairro, com nota real | ⭐ |

A camada OSM cobre 20 municípios (Belo Horizonte, Contagem, Betim, Nova Lima, Sabará,
Santa Luzia, Brumadinho e mais) nas categorias cafés, restaurantes, bares, cultura,
parques, mirantes, shoppings, família e feiras. Dados do OpenStreetMap estão sob
**ODbL** — a atribuição aparece no rodapé do app.

## Documentação

- 🏗️ [**Arquitetura**](docs/ARQUITETURA.md) — camadas, fluxo de dados, o algoritmo de recomendação.
- 🎨 [**Identidade visual**](docs/DESIGN.md) — paleta, tipografia, logo, iconografia.
- 🧠 [**Raciocínio de design**](design/RACIOCINIO_DESIGN_SaiBH.md) — o porquê de cada decisão.

## Estrutura

```
SaiBH/
├── src/
│   ├── components/
│   │   ├── funcionalidades/   # dados + clima + algoritmo (sem JSX de tela)
│   │   ├── subComponents/     # UI reutilizável (cards, filtros, ícones)
│   │   └── HomePage.js        # orquestra estado e recomendação
│   └── assets/css/            # um CSS por componente + tokens
├── scripts/                   # geradores de dataset (Node, rodam offline)
├── design/                    # kit de identidade: SVGs e dossiês
└── docs/                      # arquitetura + design
```
