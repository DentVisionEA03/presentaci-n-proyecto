import { useState } from 'react'
import Layout from './Layout'
import { useAuth } from './context/AuthContext'

function AppLayout({ children }) {
  const [fontSize, setFontSize] = useState(16)
  const [contrastMode, setContrastMode] = useState(false)
  const { logout, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isDentist = user?.role === 'dentist'
  const isSecretary = user?.role === 'secretary'

  const changeFontSize = (action) => {
    setFontSize((prev) => Math.min(22, Math.max(14, prev + action * 2)))
  }

  const rootStyles = {
    fontSize: `${fontSize}px`,
    backgroundColor: contrastMode ? '#000' : 'var(--light)',
    color: contrastMode ? '#fff' : 'var(--dark)',
    '--primary': contrastMode ? '#ffff00' : '#00a8b5',
    '--secondary': contrastMode ? '#ffffff' : '#004d84',
    '--dark': contrastMode ? '#000000' : '#333',
    '--light': contrastMode ? '#000000' : '#f4f7f6',
    '--white': contrastMode ? '#000000' : '#ffffff',
    '--header-bg': contrastMode ? '#000000' : 'rgba(255, 255, 255, 0.95)',
  }

  return (
    <div style={rootStyles}>
      <Layout
        isAdmin={isAdmin}
        isDentist={isDentist}
        isSecretary={isSecretary}
        onLogout={logout}
        onToggleContrast={() => setContrastMode((current) => !current)}
        onChangeFontSize={changeFontSize}
      >
        {children}
      </Layout>
    </div>
  )
}

export default AppLayout
