import { Link } from 'react-router-dom'
import AppLayout from './AppLayout'
import { useAuth } from './context/AuthContext'

const ROLE_CONFIG = {
  admin: {
    label: 'Administrador',
    color: '#7c3aed',
    bg: '#ede9fe',
    icon: '🛡️',
    homeLink: '/admin',
    homeLinkLabel: 'Panel de administración',
  },
  dentist: {
    label: 'Odontólogo',
    color: '#0891b2',
    bg: '#e0f2fe',
    icon: '🦷',
    homeLink: '/agenda',
    homeLinkLabel: 'Ver mi agenda',
  },
  secretary: {
    label: 'Secretaria',
    color: '#059669',
    bg: '#d1fae5',
    icon: '📋',
    homeLink: '/facturacion',
    homeLinkLabel: 'Panel de facturación',
  },
  patient: {
    label: 'Paciente',
    color: '#004d84',
    bg: '#dbeafe',
    icon: '👤',
    homeLink: '/citas',
    homeLinkLabel: 'Ver mis citas',
  },
}

function ProfilePage() {
  const { user, logout } = useAuth()
  const displayName = user?.name || 'Usuario'
  const displayEmail = user?.email || 'correo no registrado'
  const roleKey = user?.role === 'admin' ? 'admin'
      : user?.role === 'dentist' ? 'dentist'
          : user?.role === 'secretary' ? 'secretary'
              : 'patient'
  const roleConfig = ROLE_CONFIG[roleKey]
  const initials = displayName
      .split(' ')
      .slice(0, 2)
      .map((n) => n.charAt(0).toUpperCase())
      .join('')

  return (
      <AppLayout>
        <main style={styles.page}>
          {/* Hero */}
          <section style={styles.hero}>
            <div style={styles.avatarWrap}>
              <div style={styles.avatar}>{initials}</div>
              <span style={{ ...styles.roleBadge, color: roleConfig.color, background: roleConfig.bg }}>
              {roleConfig.icon} {roleConfig.label}
            </span>
            </div>
            <div style={styles.heroText}>
              <span style={styles.kicker}>Mi cuenta</span>
              <h1 style={styles.heroName}>{displayName}</h1>
              <p style={styles.heroEmail}>{displayEmail}</p>
            </div>
          </section>

          <div style={styles.grid}>
            {/* Info Card */}
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>Información personal</h2>
              <dl style={styles.dl}>
                <div style={styles.dlRow}>
                  <dt style={styles.dt}>Nombre</dt>
                  <dd style={styles.dd}>{displayName}</dd>
                </div>
                <div style={styles.dlRow}>
                  <dt style={styles.dt}>Correo</dt>
                  <dd style={styles.dd}>{displayEmail}</dd>
                </div>
                <div style={styles.dlRow}>
                  <dt style={styles.dt}>Rol</dt>
                  <dd style={styles.dd}>
                  <span style={{ ...styles.roleInline, color: roleConfig.color, background: roleConfig.bg }}>
                    {roleConfig.icon} {roleConfig.label}
                  </span>
                  </dd>
                </div>
                {user?.role === 'dentist' && user?.specialty && (
                    <div style={styles.dlRow}>
                      <dt style={styles.dt}>Especialidad</dt>
                      <dd style={styles.dd}>{user.specialty}</dd>
                    </div>
                )}
              </dl>
            </article>

            {/* Quick access */}
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>Accesos rápidos</h2>
              <div style={styles.actions}>
                <Link to={roleConfig.homeLink} style={styles.actionBtn}>
                  {roleConfig.homeLinkLabel}
                </Link>
                {roleKey === 'patient' && (
                    <Link to="/servicios" style={styles.actionBtnSecondary}>
                      Explorar servicios
                    </Link>
                )}
                <Link to="/contacto" style={styles.actionBtnSecondary}>
                  Contactar soporte
                </Link>
                <button onClick={logout} style={styles.logoutBtn}>
                  Cerrar sesión
                </button>
              </div>
            </article>
          </div>
        </main>
      </AppLayout>
  )
}

const styles = {
  page: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '40px 24px 80px',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: 28,
    marginBottom: 40,
    padding: '32px',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  },
  avatarWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00a8b5, #004d84)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: 1,
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 14px',
    borderRadius: 999,
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  heroText: {
    flex: 1,
  },
  kicker: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#00a8b5',
    marginBottom: 6,
  },
  heroName: {
    fontSize: '1.9rem',
    fontWeight: 800,
    margin: '0 0 4px',
    color: '#111827',
  },
  heroEmail: {
    color: '#6b7280',
    margin: 0,
    fontSize: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    padding: '28px 32px',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#004d84',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '2px solid #f0f4f8',
  },
  dl: { margin: 0, display: 'grid', gap: 14 },
  dlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  dt: {
    color: '#6b7280',
    fontSize: '0.9rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  dd: {
    margin: 0,
    color: '#111827',
    fontWeight: 600,
    textAlign: 'right',
  },
  roleInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 12px',
    borderRadius: 999,
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  actionBtn: {
    display: 'block',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #00a8b5, #004d84)',
    color: '#fff',
    borderRadius: 10,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.92rem',
    textAlign: 'center',
    transition: 'opacity 0.15s',
  },
  actionBtnSecondary: {
    display: 'block',
    padding: '11px 20px',
    background: '#f0f4f8',
    color: '#004d84',
    borderRadius: 10,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.92rem',
    textAlign: 'center',
    border: '1.5px solid #e2e8f0',
  },
  logoutBtn: {
    padding: '11px 20px',
    background: 'transparent',
    color: '#dc2626',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: '0.92rem',
    border: '1.5px solid #fecaca',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
}

export default ProfilePage