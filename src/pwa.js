/* pwa.js
 * -----------------------------------------------------------------------------
 * Camada PWA do SaiBH: registra o service worker e captura o evento de instalacao
 * (beforeinstallprompt) para que o PROPRIO app possa sugerir a instalacao na hora
 * certa (em vez do mini-infobar padrao do Chrome).
 *
 * Expoe um mini-store para a UI (InstallPrompt / BottomNav):
 *  - assinarPWA(fn)     -> avisa {podeInstalar, instalado} e retorna unsubscribe
 *  - podeInstalar()     -> ha um prompt disponivel?
 *  - estaInstalado()    -> ja rodando como app instalado?
 *  - pedirInstalacao()  -> dispara o prompt nativo e resolve com 'accepted'|'dismissed'
 */

let deferredPrompt = null
let instalado = (typeof window !== 'undefined')
  && ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    || window.navigator.standalone === true)

const ouvintes = new Set()

function avisar() {
  const estado = { podeInstalar: !!deferredPrompt, instalado }
  ouvintes.forEach((fn) => { try { fn(estado) } catch { /* ignora ouvinte quebrado */ } })
}

export function assinarPWA(fn) {
  ouvintes.add(fn)
  fn({ podeInstalar: !!deferredPrompt, instalado })
  return () => ouvintes.delete(fn)
}

export function podeInstalar() { return !!deferredPrompt }
export function estaInstalado() { return instalado }

export async function pedirInstalacao() {
  if (!deferredPrompt) return 'indisponivel'
  const evt = deferredPrompt
  deferredPrompt = null // o evento so pode ser usado uma vez
  avisar()
  evt.prompt()
  const escolha = await evt.userChoice.catch(() => ({ outcome: 'dismissed' }))
  return (escolha && escolha.outcome) || 'dismissed'
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // segura o prompt; a UI decide a hora de oferecer
    deferredPrompt = e
    avisar()
  })

  window.addEventListener('appinstalled', () => {
    instalado = true
    deferredPrompt = null
    avisar()
  })

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* sem SW (ex.: dev/http) — o app funciona normal, so nao instala offline */
      })
    })
  }
}
