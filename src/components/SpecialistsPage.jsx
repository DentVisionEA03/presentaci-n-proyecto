import { useNavigate } from 'react-router-dom'
import { specialists } from '../data/clinicData'
import AppLayout from './AppLayout'

function SpecialistsPage() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <main className="page-shell page-background specialists-page-bg">
        <section className="page-hero compact specialists-hero">
          <span className="section-kicker">Especialistas</span>
          <h1>Directorio de odontologos y optometras</h1>
          <p>
            Revisa especialidad, sede y disponibilidad antes de solicitar tu cita.
          </p>
        </section>

        <section className="specialist-grid page-grid">
          {specialists.map((specialist) => (
            <article className="specialist-card specialist-card-large" key={specialist.id}>
              <div className="specialist-avatar">{specialist.name.charAt(4)}</div>
              <h3>{specialist.name}</h3>
              <p>{specialist.specialty}</p>
              <span>{specialist.location}</span>
              <small>{specialist.experience}</small>
              <small>{specialist.availability}</small>
              <button onClick={() => navigate('/citas')}>Agendar con especialista</button>
            </article>
          ))}
        </section>
      </main>
    </AppLayout>
  )
}

export default SpecialistsPage
