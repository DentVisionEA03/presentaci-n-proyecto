import { useNavigate } from 'react-router-dom'
import { services, specialists } from '../data/clinicData'
import AppLayout from './AppLayout'

function Home() {
  const navigate = useNavigate()

  const goToAppointment = () => {
    navigate('/citas')
  }

  return (
    <AppLayout>
      <section className="home-hero" id="inicio">
        <div className="home-hero-content">
          <span className="section-kicker">Salud integral</span>
          <h1>Cuida tu sonrisa y tu vision en un solo lugar</h1>
          <p>
            DentVision conecta pacientes con especialistas dentales y visuales para agendar citas, consultar servicios y recibir atencion oportuna.
          </p>
          <div className="hero-actions">
            <button className="primary-action" onClick={goToAppointment}>
              Agenda tu cita
            </button>
            <button className="secondary-action" onClick={() => navigate('/especialistas')}>
              Ver especialistas
            </button>
          </div>
        </div>
        <div className="hero-panel">
          <div>
            <strong>Hoy disponible</strong>
            <span>12 cupos</span>
          </div>
          <div>
            <strong>Especialidades</strong>
            <span>Dental y visual</span>
          </div>
          <div>
            <strong>Confirmacion</strong>
            <span>Por correo o telefono</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span className="section-kicker">Servicios principales</span>
          <h2>Atencion para cada etapa de tu cuidado</h2>
          <button className="text-action" onClick={() => navigate('/servicios')}>
            Ver todos
          </button>
        </div>
        <div className="service-grid">
          {services.slice(0, 3).map((service) => (
            <article className="service-card" key={service.id}>
              <span>{service.category}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <small>{service.duration}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section-alt">
        <div className="section-heading">
          <span className="section-kicker">Equipo medico</span>
          <h2>Especialistas listos para atenderte</h2>
          <button className="text-action" onClick={() => navigate('/especialistas')}>
            Ver directorio
          </button>
        </div>
        <div className="specialist-grid">
          {specialists.slice(0, 3).map((specialist) => (
            <article className="specialist-card" key={specialist.id}>
              <div className="specialist-avatar">{specialist.name.charAt(4)}</div>
              <h3>{specialist.name}</h3>
              <p>{specialist.specialty}</p>
              <span>{specialist.location}</span>
              <button onClick={() => navigate('/citas')}>Agendar</button>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-band">
        <div>
          <strong>+50K</strong>
          <span>Pacientes atendidos</span>
        </div>
        <div>
          <strong>+120</strong>
          <span>Especialistas aliados</span>
        </div>
        <div>
          <strong>15</strong>
          <span>Sedes a nivel nacional</span>
        </div>
      </section>
    </AppLayout>
  )
}

export default Home
