import AppLayout from './AppLayout'

function ContactPage() {
  return (
    <AppLayout>
      <main className="page-shell page-background contact-page-bg">
        <section className="page-hero compact contact-hero">
          <span className="section-kicker">Contacto</span>
          <h1>Estamos listos para ayudarte</h1>
          <p>
            Comunicate con DentVision para resolver dudas, confirmar citas o recibir orientacion sobre nuestros servicios.
          </p>
        </section>

        <section className="contact-grid">
          <article>
            <h3>Canales de atencion</h3>
            <p>Email: Admin@DentVision.com</p>
            <p>Telefono: +57 (601) 123 4567</p>
            <p>Horario: lunes a sabado, 8:00 a. m. - 6:00 p. m.</p>
          </article>

          <form className="contact-form">
            <label>
              Nombre
              <input placeholder="Tu nombre" />
            </label>
            <label>
              Correo
              <input type="email" placeholder="correo@ejemplo.com" />
            </label>
            <label>
              Mensaje
              <textarea placeholder="Escribe tu mensaje" />
            </label>
            <button type="button">Enviar mensaje</button>
          </form>
        </section>
      </main>
    </AppLayout>
  )
}

export default ContactPage
