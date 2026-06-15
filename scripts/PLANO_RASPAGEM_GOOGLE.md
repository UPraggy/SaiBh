# Plano de raspagem leve do Google Maps — SaiBH

Documento de apoio à coleta de lugares do Google Maps para o dataset do SaiBH.
Atende ao pedido: *"acessar o Google Maps e fazer uma pequena raspagem, começando
por Santa Cruz, depois Barreiro, depois Centro, depois os outros, menos os bairros
perigosos em BH (pesquisar antes), depois região de BH porém próxima."*

## Regras da coleta

- **Escopo:** Belo Horizonte e região metropolitana **próxima** apenas.
- **Tamanho:** raspagem **pequena** — uma amostra dos lugares mais bem avaliados por
  categoria/bairro, não a base inteira (a base bruta já vem do OpenStreetMap, ~1.862).
- **O que coletamos:** nome, categoria, **nota real (estrelas) do Google**, nº de
  avaliações, bairro/endereço. A nota é o principal ganho — o usuário pediu
  explicitamente "pegue as estrelas desse lugar".
- **Fonte:** marcados como `fonte: 'google'`. Por terem **nota real**, exibem estrelas
  no card (igual aos curados). Isso é coerente com a regra "só nota real vira estrela"
  — o Google fornece nota real; o OSM não fornecia.
- **Segurança:** não insiro credenciais nem faço login; não resolvo CAPTCHA. Se o
  Google pedir verificação humana, a coleta para e o usuário é avisado.
- **Privacidade:** em banners de consentimento, escolho a opção que preserva
  privacidade (recusar não-essenciais).

## Ordem dos bairros (pedido do usuário)

1. **Santa Cruz** (Regional Nordeste)
2. **Barreiro** (foco nas áreas comerciais/seguras da regional)
3. **Centro**
4. Demais bairros **seguros** (ver lista de exclusão abaixo)
5. Região metropolitana **próxima** (ex.: Nova Lima/Vale do Sereno, Contagem comercial)

## Bairros / áreas EVITADOS (pesquisa de criminalidade)

Pesquisa feita antes da coleta (WebSearch estava fora do ar; pesquisei via Google).
Fontes: **Estado de Minas / Sejusp-MG** (reportagem citando dados oficiais),
**O Tempo** e **PUC Minas / UFMG** (sobre aglomerados), e levantamentos por regional.

Áreas com maiores índices de violência (roubo, tráfico, homicídio) — **excluídas**:

- **Aglomerado da Serra** e suas vilas (maior aglomerado de MG)
- **Morro das Pedras** / Vila Pantanal / Vila Antena
- **Cabana do Pai Tomás**
- **Pedreira Prado Lopes**
- **Taquaril**
- **Jaqueline, Floramar, Vila Clóris** (Regional Norte — alta incidência)
- **Vila Pinho, Vila Itaipu, Conjunto Felicidade**
- **Ribeiro de Abreu**
- **Céu Azul** (assaltos a ônibus / tráfico)
- **Cachoeirinha** (apontado como área de risco)
- **Carlos Prates, Santa Efigênia, Floresta** (alto volume de ocorrências segundo
  Sejusp — tratados com cautela; não priorizados)

> Observação: o **Centro** aparece no topo de *volume* de ocorrências por ser a área
> de maior fluxo comercial da cidade, mas foi **mantido** porque o usuário o pediu
> explicitamente (item 3) e é onde se concentram cafés, restaurantes e cultura.

## Esquema de cada lugar coletado

Mesmo schema de `lugaresBH.js` / `lugaresOSM.json`. IDs do Google começam em **3000**
(curados 1–32, OSM 1000–2861). `nota` e `avaliacoes` reais; `qualidade = nota*20`
para o desempate de ordenação; `foto: null` (usa o gradiente da categoria).

## Resultado da coleta (concluída)

Saída final: `src/components/funcionalidades/lugaresGoogle.json` — **232 lugares**
(ids 3000–3231), todos com **nota real do Google**. Mesclado em `bancoGet.js`:
`TODOS = [...CURADOS, ...lugaresOSM, ...lugaresGoogle]`.

- **Bruto coletado:** 286 registros → **232 únicos** após dedupe (chave `nome|endereço`).
- **Categorias:** restaurante 90 · bar 93 · cafe 38 · cultura 8 · parque 3.
- **Bairros (na ordem pedida):** Santa Cruz 23 · Barreiro 20 · Centro 31 · Savassi 15 ·
  Lourdes 13 · Funcionários 9 · Santa Tereza 16 · Pampulha 16 · Buritis 16 ·
  Belvedere 10 · Sion 7 · Cidade Nova 10 · Anchieta 8 · Cruzeiro 4 · Mangabeiras 5 ·
  Nova Lima 13 · Contagem 16.
- **Sem CAPTCHA / sem banner de consentimento / sem login** em nenhum momento.

### Base final do SaiBH

| Fonte    | Qtde  | Estrela real? |
|----------|-------|---------------|
| Curados  | 32    | sim           |
| OSM      | 1.862 | não (qualidade estimada) |
| Google   | 232   | sim           |
| **Total**| **2.126** | 264 com estrela |
