import "../styles/testimonials.css";

function Testimonials() {
  const testimonials = [
    {
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
      name: "María Fernanda G.",
      role: "Paciente de Implantes",
      text: "El trato fue excepcional desde el primer día. Me explicaron todo el proceso y el resultado superó completamente mis expectativas.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
      name: "Andrés Morales",
      role: "Paciente de Ortodoncia",
      text: "Profesionales altamente calificados, tecnología moderna y un ambiente que transmite confianza y tranquilidad.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
      name: "Laura Isaza",
      role: "Paciente de Estética Dental",
      text: "Tenía miedo al tratamiento y aquí me hicieron sentir segura en todo momento. Recomiendo la clínica totalmente.",
    },
  ];

  return (
    <section className="testimonials">
      <div className="testimonials-header">
        <span>TESTIMONIOS</span>

        <h2>Lo que dicen nuestros pacientes</h2>

        <p>
          Experiencias reales de personas que confiaron en nosotros y
          transformaron su sonrisa.
        </p>
      </div>

      <div className="testimonials-container">
        {testimonials.map((item, index) => (
          <div className="testimonial-card" key={index}>
            <div className="glass-overlay"></div>

            <img src={item.image} alt={item.name} />

            <div className="stars">★★★★★</div>

            <p className="testimonial-text">“{item.text}”</p>

            <h3>{item.name}</h3>

            <span className="role">{item.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
