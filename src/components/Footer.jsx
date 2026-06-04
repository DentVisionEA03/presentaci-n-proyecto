import "../styles/footer.css";
import {
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <h2>DentiSalud</h2>

        <p>
          Tratamientos dentales y odontología hecha con responsabilidad. Obtén
          planes de ortodoncia, implantes, diseño de sonrisa, rehabilitación
          oral y más.
        </p>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-content">
        <div className="footer-column">
          <h3>Tratamientos</h3>

          <a href="/">Implantes dentales en Colombia</a>
          <a href="/">Ortodoncia en Colombia</a>
          <a href="/">Rehabilitación Oral</a>
          <a href="/">Endodoncia</a>
          <a href="/">Diseño de sonrisa</a>
          <a href="/">Periodoncia</a>
        </div>

        <div className="footer-column">
          <h3>Sobre DentiSalud</h3>

          <a href="/">Línea ética</a>
          <a href="/">Acerca de nosotros</a>
          <a href="/">Convenios</a>
          <a href="/">Financiación</a>
          <a href="/">Blog</a>
          <a href="/">Trabaja con nosotros</a>
          <a href="/">Derechos y deberes de los pacientes</a>
          <a href="/">Estados financieros</a>
        </div>

        <div className="footer-column">
          <h3>Políticas</h3>

          <a href="/">Política de privacidad de datos</a>
          <a href="/">Política ambiental</a>
          <a href="/">Política de calidad</a>
          <a href="/">Autorización tratamiento datos personales</a>
          <a href="/">Legales de promoción</a>

          <h3 className="service-title">Servicio al cliente</h3>

          <a href="/">Radicar PQRs</a>
        </div>

        <div className="footer-column">
          <h3>Síguenos en nuestras redes</h3>

          <div className="social-icons">
            <a href="/">
              <FaInstagram />
            </a>

            <a href="/">
              <FaTwitter />
            </a>

            <a href="/">
              <FaFacebookF />
            </a>

            <a href="/">
              <FaYoutube />
            </a>

            <a href="/">
              <FaTiktok />
            </a>
          </div>

          <div className="footer-contact">
            <p>
              <strong>Dirección:</strong> Av calle 100 n° 13-21 conjunto
              empresarial edificio Megatower.
            </p>

            <p>
              <strong>Teléfono:</strong> 7459010
            </p>

            <p>
              <strong>Correo:</strong> info@dentisalud.com.co
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Dentisalud 2026 - Todos los derechos reservados</p>
      </div>
    </footer>
  );
}

export default Footer;
