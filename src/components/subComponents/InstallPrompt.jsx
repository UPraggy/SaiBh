/**
 * InstallPrompt.jsx
 * -----------------------------------------------------------------------------
 * Faixa discreta em que o PROPRIO SaiBH sugere ser instalado (PWA) quando o
 * navegador sinaliza que da pra instalar. Fica acima do menu inferior. O usuario
 * pode instalar na hora ou dispensar (nao volta a incomodar durante a sessao).
 * Some sozinho quando o app ja esta instalado.
 */
import { useEffect, useState } from 'react'
import { assinarPWA, pedirInstalacao } from '../../pwa.js'
import Logo from './Logo.jsx'
import { Icone } from './Icones.jsx'
import '../../assets/css/InstallPrompt.css'

const CHAVE_DISPENSADO = 'saibh-install-dispensado'

function InstallPrompt() {
  const [estado, setEstado] = useState({ podeInstalar: false, instalado: false })
  const [dispensado, setDispensado] = useState(() => {
    try { return sessionStorage.getItem(CHAVE_DISPENSADO) === '1' } catch { return false }
  })

  useEffect(() => assinarPWA(setEstado), [])

  if (estado.instalado || !estado.podeInstalar || dispensado) return null

  const dispensar = () => {
    setDispensado(true)
    try { sessionStorage.setItem(CHAVE_DISPENSADO, '1') } catch { /* modo privado */ }
  }

  const instalar = async () => {
    const resultado = await pedirInstalacao()
    // aceitou -> some via evento appinstalled; recusou/indisponivel -> guarda o "não"
    if (resultado !== 'accepted') dispensar()
  }

  return (
    <div className="instalarBanner" role="dialog" aria-label="Instalar o SaiBH">
      <span className="instalarIcone"><Logo variante="colorida" comTexto={false} size={30} /></span>

      <div className="instalarTexto">
        <strong>Instale o SaiBH</strong>
        <small>Abra direto da tela inicial, sem navegador — igual a um app.</small>
      </div>

      <div className="instalarAcoes">
        <button type="button" className="instalarAgora" onClick={instalar}>
          <Icone nome="check" size={16} /> Instalar
        </button>
        <button type="button" className="instalarDepois" onClick={dispensar} aria-label="Agora não">
          <Icone nome="x" size={18} />
        </button>
      </div>
    </div>
  )
}

export default InstallPrompt
