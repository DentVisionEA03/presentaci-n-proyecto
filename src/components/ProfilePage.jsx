import { Link } from 'react-router-dom'
import AppLayout from './AppLayout'
import { useAuth } from './context/AuthContext'

function ProfilePage() {
  const { user } = useAuth()
  const displayName = user?.name || 'Usuario'
  const displayEmail = user?.email || 'correo no registrado'
  const isDentist = user?.role === 'dentist'
  const roleLabel =
    user?.role === 'admin' ? 'Administrador' : isDentist ? 'Odontologo' : user?.role === 'secretary' ? 'Secretaria' : 'Paciente'

  return (
    <AppLayout>
      <main className="profile-page">
        <section className="profile-hero">
          <div className="profile-avatar" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="section-kicker">Mi cuenta</span>
            <h1>{displayName}</h1>
            <p>{displayEmail}</p>
          </div>
        </section>

        <section className="profile-grid">
          <article className="profile-card">
            <h2>Informacion personal</h2>
            <dl className="profile-details">
              <div>
                <dt>Nombre</dt>
                <dd>{displayName}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{displayEmail}</dd>
              </div>
              <div>
                <dt>Rol</dt>
                <dd>{roleLabel}</dd>
              </div>
              {isDentist && user?.specialty && (
                <div>
                  <dt>Especialidad</dt>
                  <dd>{user.specialty}</dd>
                </div>
              )}
            </dl>
          </article>

          <article className="profile-card">
            <h2>Accesos rapidos</h2>
            <div className="profile-actions">
              {isDentist ? <Link to="/agenda">Ver mi agenda</Link> : <Link to="/citas">Ver mis citas</Link>}
              <Link to="/servicios">Explorar servicios</Link>
              <Link to="/contacto">Contactar soporte</Link>
            </div>
          </article>
        </section>
      </main>
    </AppLayout>
  )
}

export default ProfilePage
