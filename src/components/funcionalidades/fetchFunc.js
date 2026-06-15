// Wrapper fetch nativo (padrao do DevProfile). Aqui aponta para APIs publicas
// (ex.: Open-Meteo) ja com URL completa, entao usamos a url crua.
function fetchGet(url) {
    return new Promise((resolve) => {
        resolve(fetch(url, {
            method: 'GET', mode: 'cors', keepalive: true,
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
        })
            .then(resp => resp.json())
            .catch(resp => ({ "ERROR SERVER": resp })))
    })
}

function fetchPost(url, body) {
    return new Promise((resolve) => {
        resolve(fetch(url, {
            method: 'POST', mode: 'cors', keepalive: true,
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
            .then(resp => resp.json())
            .catch(resp => ({ "ERROR SERVER": resp })))
    })
}

const fetchFunc = { fetchPost, fetchGet }
export default fetchFunc;
