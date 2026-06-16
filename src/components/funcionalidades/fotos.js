/**
 * fotos.js
 * -----------------------------------------------------------------------------
 * Capa de cada lugar.
 *
 * As bases OSM (~3146) e Google (232) vieram SEM foto (`foto:null`) — só os 32
 * curados têm imagem própria. Para que TODO card mostre uma capa bonita (e não
 * só o ícone da categoria), atribuímos a cada lugar uma foto topical por
 * categoria, hospedada no CDN do Unsplash (uso livre, sem chave/API, hotlink ok).
 *
 * Pedido do usuário: "use fotos do google fotos, não precisa ser apenas do
 * wikipedia" → ou seja, não restringir a fonte; o que importa é ter fotos boas.
 *
 * Como funciona:
 *  - POOLS: pools de IDs por categoria, TODOS verificados (HTTP 200) pelo script
 *    scripts/verificarFotos.mjs → scripts/fotos-verificadas.json (74/75 vivas).
 *  - fotoDe(lugar): se o lugar já tem `foto` (curados), mantém. Senão escolhe
 *    DETERMINISTICAMENTE pelo `id` (`id % tamanho`) — assim a mesma loja sempre
 *    recebe a mesma imagem (sem "piscar" entre renders) e a grade ganha variedade.
 *  - Se a categoria não tiver pool, usa POOLS.familia como padrão neutro.
 *  - Se mesmo assim a URL falhar no navegador, o CardLugar já cai no ícone da
 *    categoria via onError — degradação graciosa garantida.
 */

const BASE = 'https://images.unsplash.com/'
const PARAMS = '?w=800&h=520&auto=format&fit=crop&q=70'

// IDs verificados (200 OK) — fonte: scripts/fotos-verificadas.json
const POOLS = {
    cafe: [
        'photo-1501339847302-ac426a4a7cbb', 'photo-1554118811-1e0d58224f24',
        'photo-1453614512568-c4024d13c247', 'photo-1521017432531-fbd92d768814',
        'photo-1559496417-e7f25cb247f3', 'photo-1442512595331-e89e73853f31',
        'photo-1559925393-8be0ec4767c8', 'photo-1495474472287-4d71bcdd2085',
        'photo-1509042239860-f550ce710b93', 'photo-1447933601403-0c6688de566e',
    ],
    restaurante: [
        'photo-1517248135467-4c7edcad34c4', 'photo-1555396273-367ea4eb4db5',
        'photo-1414235077428-338989a2e8c0', 'photo-1552566626-52f8b828add9',
        'photo-1466978913421-dad2ebd01d17', 'photo-1559339352-11d035aa65de',
        'photo-1504674900247-0877df9cc836', 'photo-1540189549336-e6e99c3679fe',
        'photo-1565299624946-b28f40a0ae38', 'photo-1424847651672-bf20a4b0982b',
    ],
    bar: [
        'photo-1514933651103-005eec06c04b', 'photo-1551024709-8f23befc6f87',
        'photo-1470337458703-46ad1756a187', 'photo-1538488881038-e252a119ace7',
        'photo-1572116469696-31de0f17cc34', 'photo-1543007630-9710e4a00a20',
        'photo-1517732306149-e8f829eb588a', 'photo-1436076863939-06870fe779c2',
    ],
    parque: [
        'photo-1441974231531-c6227db76b6e', 'photo-1502082553048-f009c37129b9',
        'photo-1500382017468-9049fed747ef', 'photo-1473448912268-2022ce9509d8',
        'photo-1416879595882-3373a0480b5b', 'photo-1426604966848-d7adac402bff',
        'photo-1509316975850-ff9c5deb0cd9', 'photo-1497250681960-ef046c08a56e',
    ],
    praca: [
        'photo-1519677100203-a0e668c92439', 'photo-1517457373958-b7bdd4587205',
        'photo-1444723121867-7a241cacace9', 'photo-1486325212027-8081e485255e',
        'photo-1480714378408-67cf0d13bc1b', 'photo-1449824913935-59a10b8d2000',
    ],
    mirante: [
        'photo-1506905925346-21bda4d32df4', 'photo-1464822759023-fed622ff2c3b',
        'photo-1470071459604-3b5ec3a7fe05', 'photo-1454496522488-7a8e488e8606',
        'photo-1501785888041-af3ef285b470', 'photo-1426604966848-d7adac402bff',
        'photo-1444930694458-01babf71870c',
    ],
    cultura: [
        'photo-1518998053901-5348d3961a04', 'photo-1503095396549-807759245b35',
        'photo-1554907984-15263bfd63bd', 'photo-1561214115-f2f134cc4912',
        'photo-1460661419201-fd4cecdf8a8b', 'photo-1568667256549-094345857637',
        'photo-1497005367839-6e852de72767',
    ],
    shopping: [
        'photo-1441986300917-64674bd600d8', 'photo-1567958451986-2de427a4a0be',
        'photo-1481437156560-3205f6a55735', 'photo-1567401893414-76b7b1e5a7a5',
        'photo-1555529669-e69e7aa0ba9a', 'photo-1519415510236-718bdfcd89c8',
    ],
    feira: [
        'photo-1488459716781-31db52582fe9', 'photo-1542838132-92c53300491e',
        'photo-1506617420156-8e4536971650', 'photo-1524594152303-9fd13543fe6e',
        'photo-1452251889946-8ff5ea7b27ab', 'photo-1473093295043-cdd812d0e601',
    ],
    familia: [
        'photo-1530103862676-de8c9debad1d', 'photo-1542178243-bc20204b769f',
        'photo-1503454537195-1dcabb73ffb9', 'photo-1597466599360-3b9775841aec',
        'photo-1472162072942-cd5147eb3902', 'photo-1560969184-10fe8719e047',
    ],
}

/** Monta a URL final do Unsplash a partir de um id de foto. */
function urlFoto(idFoto) {
    return `${BASE}${idFoto}${PARAMS}`
}

/**
 * fotoDe(lugar) → string (URL da capa)
 * Respeita foto própria (curados). Para OSM/Google, escolhe determinístico
 * pelo id dentro do pool da categoria (fallback: pool de família).
 */
function fotoDe(lugar) {
    if (lugar.foto) return lugar.foto
    const pool = POOLS[lugar.categoria] || POOLS.familia
    const i = Math.abs(Number(lugar.id) || 0) % pool.length
    return urlFoto(pool[i])
}

export { fotoDe, urlFoto, POOLS }
export default fotoDe
