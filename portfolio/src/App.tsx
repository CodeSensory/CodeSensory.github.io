import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LabMetaStrip } from './components/layout/LabMetaStrip'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { SkipLink } from './components/layout/SkipLink'
import { SwissBackdrop } from './components/layout/SwissBackdrop'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { PublicationDetailPage } from './pages/PublicationDetailPage'
import { PublicationsPage } from './pages/PublicationsPage'
import { ResearchPage } from './pages/ResearchPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="relative min-h-[100dvh]">
      <SwissBackdrop />
      <div className="relative z-[2] mx-auto min-h-[100dvh] w-full min-w-0 max-w-7xl overflow-x-clip border-x border-ink bg-paper">
        <ScrollToTop />
        <SkipLink />
        <LabMetaStrip />
        <SiteHeader />
        <main id="main" className="min-w-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/publications" element={<PublicationsPage />} />
            <Route path="/publications/:publicationId" element={<PublicationDetailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
