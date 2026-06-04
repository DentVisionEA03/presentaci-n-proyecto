
import "../styles/WhyChoose.css";

const WhyChoose = () => {
  return (
    <section className="why-container">
      <div className="why-grid">
        
        {/* Imagen */}
        <div className="why-image">
          <img
            src="https://www.dentisalud.com.co/hs-fs/hubfs/dentisalud-elegir.jpg?width=540&height=455&name=dentisalud-elegir.jpg"// 👈 reemplaza por tu imagen
            alt="Persona señalando"
          />
        </div>

        {/* Contenido */}
        <div className="why-content">
          <h2>
            ¿Por qué elegir <span>DentVision</span>?
          </h2>

          <p>
            <strong>Contamos con más de 30 años de experiencia</strong> atendiendo a más <br />
            colombianos para mantener su salud oral y su estética dental. <strong>Brindamos <br />
            acceso a un modelo de odontología de calidad</strong> con especialistas en cada <br />
             rama de la odontología, materiales dentales de reconocimiento  mundial y <br />
             tecnología adecuada para mejorar la experiencia durante el tratamiento.
          </p>

          <ul>
            <li><img src="https://www.dentisalud.com.co/hs-fs/hubfs/ul-1.png?width=36&name=ul-1.png" alt="icino-agenda" />Agenda tu primera cita <strong>SIN COSTO</strong></li>
            <li><img src="https://www.dentisalud.com.co/hs-fs/hubfs/ul-2.png?width=36&name=ul-2.png" alt="icono-pagar" />Opciones de pago flexibles</li>
            <li><img src="https://www.dentisalud.com.co/hs-fs/hubfs/ul-3.png?width=36&name=ul-3.png" alt="incono-financiar" />Financiación con tasas preferenciales</li>
            <li><img src="https://www.dentisalud.com.co/hs-fs/hubfs/ul-4.png?width=36&name=ul-4.png" alt="icono-garantía" />Garantía de calidad en tratamientos</li>
            <li><img src="https://www.dentisalud.com.co/hs-fs/hubfs/ul-5.png?width=36&name=ul-5.png" alt="icono-diganostico" />Diagnóstico integral personalizado</li>
          </ul>

          <button>AGENDA YA VALORACIÓN SIN COSTO</button>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;