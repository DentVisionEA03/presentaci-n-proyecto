import { useNavigate } from 'react-router-dom'
import { services } from '../data/clinicData'
import AppLayout from './AppLayout'

function ServicesPage() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <main className="page-shell page-background services-page-bg">
        <section className="page-hero compact services-hero">
          <span className="section-kicker">Servicios</span>
          <h1>Soluciones dentales y visuales en una sola plataforma</h1>
          <p>
            Consulta el servicio que necesitas y agenda una cita con el especialista adecuado.
          </p>
        </section>

        <section className="service-grid page-grid">
          {services.map((service) => (
            <article className="service-card" key={service.id}>
              <span>{service.category}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <small>Duracion estimada: {service.duration}</small>
              <button onClick={() => navigate('/citas')}>Agendar servicio</button>
            </article>
          ))}
        </section>
      </main>
    </AppLayout>
  )
}

export default ServicesPage
