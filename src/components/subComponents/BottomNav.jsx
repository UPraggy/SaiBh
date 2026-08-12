/**
 * BottomNav.jsx
 * -----------------------------------------------------------------------------
 * Menu inferior fixo (mobile-first) com as acoes principais do SaiBH. Substitui
 * os botoes que antes ficavam apertados no topo (e vazavam do layout) e abre
 * MAIS opcoes num so lugar, sempre ao alcance do polegar:
 *   Inicio · Filtros · Me Surpreenda (destaque central) · Salvos · Ja fui.
 *
 * E "burro" de proposito: so dispara callbacks vindos da HomePage, que e quem
 * detem o estado (salvos, visitados, meSurpreenda, paineis).
 */
import { Icone } from './Icones.jsx'
import '../../assets/css/BottomNav.css'

function BottomNav({
  salvosCount = 0,
  visitadosCount = 0,
  onInicio,
  onFiltros,
  onSurpresa,
  onAbrirSalvos,
  onAbrirVisitados,
}) {
  return (
    <nav className="bottomNav" aria-label="Navegação principal">
      <button type="button" className="bnItem" onClick={onInicio}>
        <Icone nome="home" size={22} />
        <span>Início</span>
      </button>

      <button type="button" className="bnItem" onClick={onFiltros}>
        <Icone nome="filtros" size={22} />
        <span>Filtros</span>
      </button>

      <button
        type="button"
        className="bnItem bnSurpresa"
        onClick={onSurpresa}
        aria-label="Me surpreenda com um lugar"
      >
        <span className="bnSurpresaBolha"><Icone nome="dado" size={24} /></span>
        <span>Surpresa</span>
      </button>

      <button type="button" className="bnItem" onClick={onAbrirSalvos}>
        <span className="bnIconeBadge">
          <Icone nome={salvosCount > 0 ? 'coracaoCheio' : 'coracao'} size={22} />
          {salvosCount > 0 && <em className="bnBadge">{salvosCount > 99 ? '99+' : salvosCount}</em>}
        </span>
        <span>Salvos</span>
      </button>

      <button type="button" className="bnItem" onClick={onAbrirVisitados}>
        <span className="bnIconeBadge">
          <Icone nome="check" size={22} />
          {visitadosCount > 0 && <em className="bnBadge">{visitadosCount > 99 ? '99+' : visitadosCount}</em>}
        </span>
        <span>Já fui</span>
      </button>
    </nav>
  )
}

export default BottomNav
