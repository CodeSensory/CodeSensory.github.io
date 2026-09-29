import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { pageCopy } from '../../content/pageCopy'
import { NAV_LINK, NAV_LINK_ACTIVE, NAV_LINK_IDLE } from '../../styles/swissClasses'
import { LAB_NAME, NAV_ITEMS } from './navItems'
import { MobileNavOverlay } from './MobileNavOverlay'
import { SiteHeaderMenuToggle } from './SiteHeaderMenuToggle'

function desktopNavClass(isActive: boolean) {
  return isActive ? `${NAV_LINK} ${NAV_LINK_ACTIVE}` : `${NAV_LINK} ${NAV_LINK_IDLE}`
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="border-b border-ink bg-paper-elevated">
        <div className="grid min-h-[56px] grid-cols-[1fr_auto] md:grid-cols-[minmax(0,1fr)_auto]">
          <NavLink
            to="/"
            lang="en"
            className="font-macro flex items-center border-ink px-4 text-[13px] uppercase leading-none tracking-[-0.03em] text-ink md:border-r md:px-6"
            end
          >
            {LAB_NAME}
          </NavLink>
          <nav className="hidden h-full items-stretch md:flex" aria-label={pageCopy.site.menuLabel}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => desktopNavClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center justify-end border-l border-ink md:hidden">
            <SiteHeaderMenuToggle
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen((open) => !open)}
            />
          </div>
        </div>
      </header>
      <MobileNavOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
