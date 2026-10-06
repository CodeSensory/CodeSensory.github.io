import { NavLink } from 'react-router-dom'
import { pageCopy } from '../../content/pageCopy'
import { NAV_ITEMS } from './navItems'

type MobileNavOverlayProps = {
  isOpen: boolean
  onClose: () => void
}

function mobileNavClass(isActive: boolean) {
  const base =
    'block border-b border-ink py-4 text-xl font-semibold tracking-[-0.02em] transition-colors duration-300'
  return isActive ? `${base} text-accent` : `${base} text-ink hover:text-accent`
}

export function MobileNavOverlay({ isOpen, onClose }: MobileNavOverlayProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-paper-elevated/98"
        aria-label={pageCopy.site.menuClose}
        onClick={onClose}
      />
      <nav
        className="relative border-x border-ink bg-paper-elevated px-6 pt-24"
        aria-label={pageCopy.site.menuMobile}
      >
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => mobileNavClass(isActive)}
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
