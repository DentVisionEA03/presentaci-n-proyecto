import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

function Layout({ children, isAdmin = false, isDentist = false, isSecretary = false, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Definir items de navegación según el rol
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { to: '/admin', label: 'Gestión de Citas' },
        { to: '/laboratorio', label: 'Laboratorio' },
        { to: '/perfil', label: 'Mi Perfil' },
      ]
    }
    if (isDentist) {
      return [
        { to: '/agenda', label: 'Mi Agenda' },
        { to: '/perfil', label: 'Mi Perfil' },
      ]
    }
    if (isSecretary) {
      return [
        { to: '/facturacion', label: 'Facturación' },
        { to: '/perfil', label: 'Mi Perfil' },
      ]
    }
    // Usuario normal
    return [
      { to: '/home', label: 'Inicio' },
      { to: '/servicios', label: 'Servicios' },
      { to: '/especialistas', label: 'Especialistas' },
      { to: '/contacto', label: 'Contacto' },
      { to: '/perfil', label: 'Mi cuenta' },
      { to: '/citas', label: 'Citas' },
    ]
  }

  const getHomeRoute = () => {
    if (isAdmin) return '/admin'
    if (isDentist) return '/agenda'
    if (isSecretary) return '/facturacion'
    return '/home'
  }

  const navItems = getNavItems()
  const homeRoute = getHomeRoute()

  const closeMenu = () => setMenuOpen(false)
  const getNavLinkStyle = ({ isActive }) => ({
    ...styles.navLink,
    ...(isActive ? styles.activeNavLink : {}),
  })

  return (
    <div>
      <div className="acc-bar">
        <button className="acc-btn acc-btn-danger" onClick={onLogout} type="button">
          Salir
        </button>
      </div>

      <header id="main-header" style={styles.header}>
        <Link to={homeRoute} className="auth-logo" style={styles.logo} onClick={closeMenu}>
          DENT<span style={{ color: 'var(--primary)' }}>VISION</span>
        </Link>

        <ul
          className={menuOpen ? 'nav-active' : ''}
          style={styles.navLinks}
          id="nav-menu"
        >
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} style={getNavLinkStyle} onClick={closeMenu}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          aria-label="Abrir menu de navegacion"
          aria-expanded={menuOpen}
          className={`burger ${menuOpen ? 'toggle' : ''}`}
          style={styles.burger}
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <span className="line1"></span>
          <span className="line2"></span>
          <span className="line3"></span>
        </button>
      </header>

      {children}

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerCol}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>DentVision</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>Nos dedicamos a cuidar de tu sonrisa y de tu vista, combinando innovación y calidad humana.</p>
          </div>
          <div style={styles.footerCol}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Enlaces rápidos</h4>
            <ul style={{ listStyle: 'none', padding: '0' }}>
              {!isAdmin && !isDentist && !isSecretary && (
                <>
                  <li style={{ marginBottom: '8px' }}>
                    <Link to="/home" style={{ color: '#ddd', textDecoration: 'none' }}>
                      Inicio
                    </Link>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Link to="/servicios" style={{ color: '#ddd', textDecoration: 'none' }}>
                      Nuestros Servicios
                    </Link>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Link to="/especialistas" style={{ color: '#ddd', textDecoration: 'none' }}>
                      Directorio de Especialistas
                    </Link>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Link to="/citas" style={{ color: '#ddd', textDecoration: 'none' }}>
                      Agendar cita
                    </Link>
                  </li>
                </>
              )}
              {isDentist && (
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/agenda" style={{ color: '#ddd', textDecoration: 'none' }}>
                    Agenda odontológica
                  </Link>
                </li>
              )}
              {isAdmin && (
                <>
                  <li style={{ marginBottom: '8px' }}>
                    <Link to="/admin" style={{ color: '#ddd', textDecoration: 'none' }}>
                      Panel administrativo
                    </Link>
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <Link to="/laboratorio" style={{ color: '#ddd', textDecoration: 'none' }}>
                      Laboratorio odontológico
                    </Link>
                  </li>
                </>
              )}
              {isSecretary && (
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/facturacion" style={{ color: '#ddd', textDecoration: 'none' }}>
                    Facturación
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div style={styles.footerCol}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Contáctanos</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>Email: Admin@DentVision.com<br />Teléfono: +57 (601) 123 4567</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>&copy; 2026 DentVision. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  header: {
    background: 'var(--header-bg)',
    padding: '15px 5%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: 'var(--secondary)',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    gap: '25px',
    listStyle: 'none',
    margin: 0,
  },
  navLink: {
    textDecoration: 'none',
    color: 'var(--dark)',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '2px solid transparent',
    paddingBottom: '4px',
  },
  activeNavLink: {
    color: 'var(--secondary)',
    borderBottomColor: 'var(--primary)',
  },
  burger: {
    display: 'none',
    cursor: 'pointer',
    flexDirection: 'column',
    gap: '5px',
  },
  footer: {
    background: '#2c3e50',
    color: 'var(--white)',
    padding: '50px 5% 20px',
  },
  footerContent: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '40px',
    marginBottom: '30px',
  },
  footerCol: {
    flex: 1,
    minWidth: '250px',
  },
  footerBottom: {
    textAlign: 'center',
    borderTop: '1px solid #444',
    paddingTop: '20px',
    fontSize: '13px',
  },
}

export default Layout
