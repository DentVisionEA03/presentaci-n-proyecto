function Valoracion() {
  return (
    <section className="valoracion">
      <h2>
        Adquiere tu valoración <span>sin costo</span>
      </h2>

      <div className="valoracion-container">
        
        {/* FORMULARIO */}
        <div className="valoracion-form">
          <h3>Llena tus datos y nosotros te contactamos</h3>

          <form>
            <div className="form-grid">
              <div>
                <label>Nombre*</label>
                <input type="text" />
              </div>

              <div>
                <label>Apellido*</label>
                <input type="text" />
              </div>

              <div>
                <label>Correo</label>
                <input type="email" />
              </div>

              <div>
                <label>Número de teléfono móvil*</label>
                <input
                  type="text"
                  placeholder="Ingresa tu número de 10 dígitos"
                />
              </div>

              <div>
                <label>Tipo de identificación*</label>
                <select>
                  <option>Selecciona</option>
                </select>
              </div>

              <div>
                <label>Número documento de identidad*</label>
                <input type="text" />
              </div>
            </div>

            <div className="full-input">
              <label>Servicio Odontológico*</label>
              <select>
                <option>Selecciona</option>
              </select>
            </div>

            <div className="full-input">
              <label>Ciudad de contacto*</label>
              <select>
                <option>Selecciona</option>
              </select>
            </div>

            <div className="full-input">
              <label>Horario de contacto*</label>
              <select>
                <option>Selecciona</option>
              </select>
            </div>

            <div className="checkbox">
              <input type="checkbox" />
              <p>He leído y acepto la política de privacidad.</p>
            </div>

            <div className="full-input">
              <label>Número de teléfono</label>
              <input type="text" />
            </div>

            <div className="full-input">
              <label>Dirección</label>
              <input type="text" />
            </div>

            <button type="submit">
              SOLICITAR VALORACIÓN SIN COSTO
            </button>
          </form>
        </div>

        {/* IMAGEN */}
        <div className="valoracion-img">
          <img
            src="https://www.dentisalud.com.co/hs-fs/hubfs/fondo-pide-tu-cita-home.jpg?width=577&height=611&name=fondo-pide-tu-cita-home.jpg"
            alt="Valoración dental"
          />
        </div>
      </div>

      <p className="terminos">
        *Aplican términos y condiciones, haz clic aquí para ver.
      </p>
    </section>
  );
}

export default Valoracion;