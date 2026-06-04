import { useState, useEffect } from "react";
import "../styles/slider.css";

const slides = [
  {
    title: "Tu sonrisa merece un cuidado completo",
    text: "Accede a nuestros servicios odontológicos de manera fácil, rápida y segura.",
    img: "https://www.dentisalud.com.co/hs-fs/hubfs/endodoncia-evita-extraccion-dental-sonrisa-natural-1-1.jpg?",
    btn: "Conocer más",
  },
  {
    title: "Agenda tu cita en línea",
    text: "Reserva tu consulta odontológica sin salir de casa",
    img: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1600",
    btn: "Agendar cita",
  },
  {
    title: "Servicios digitales",
    text: "Consulta citas, tratamientos y más.",
    img: "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1600",
    btn: "Ir a servicios",
  },
];

function SliderPro() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const auto = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(auto);
  }, []);

  return (
    <section className="slider-pro">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`slide-pro ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.img})` }}
        >
          <div className="overlay-pro">
            <div className="content">
              <h1>{slide.title}</h1>
              <p>{slide.text}</p>
              <button>{slide.btn}</button>
            </div>
          </div>
        </div>
      ))}

      {/* Flechas */}
      <button
        className="arrow left"
        onClick={() =>
          setCurrent(current === 0 ? slides.length - 1 : current - 1)
        }
      >
        ❮
      </button>

      <button
        className="arrow right"
        onClick={() => setCurrent((current + 1) % slides.length)}
      >
        ❯
      </button>

      {/* Indicadores */}
      <div className="indicators">
        {slides.map((_, i) => (
          <span
            key={i}
            className={i === current ? "dot active" : "dot"}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </section>
  );
}

export default SliderPro;