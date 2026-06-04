function InfoCards() {
  const cards = [
    {
      title: "Agenda tu cita",
      image:
        "https://www.dentisalud.com.co/hubfs/agenda-tu-cita.svg",
    },
    {
      title: "Clínica dental más cercana",
      image:
        "https://www.dentisalud.com.co/hubfs/clinica-dental.svg",
    },
    {
      title: "Medios de pago",
      image:
        "https://www.dentisalud.com.co/hubfs/medios-de-pago.svg",
    },
    {
      title: "DentiCard",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    },
    {
      title: "Agenda tu cita",
      image:
        "https://www.dentisalud.com.co/hubfs/agenda-tu-cita.svg",
        
    },
    {
      title: "Clínica dental más cercana",
      image:
        "https://www.dentisalud.com.co/hubfs/clinica-dental.svg",
        
    }
  ];

  return (
    <section className="info-cards">
      {cards.map((card, index) => (
        <div className="info-card" key={index}>
          <h2>{card.title}</h2>

          <img src={card.image} alt={card.title} />

          <button>Más información</button>
        </div>
      ))}
    </section>
  );
}

export default InfoCards;