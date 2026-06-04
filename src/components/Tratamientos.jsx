import "../styles/tratamientos.css";

function Tratamientos() {
  const tratamientos = [
    {
      icon: "https://www.dentisalud.com.co/hs-fs/hubfs/implantes-dentales.png?width=172&height=172&name=implantes-dentales.png",
      title: "Implantes dentales",
      description:
        "Una solución práctica y estética para reemplazar piezas dentales.",
    },
    {
      icon: "https://www.dentisalud.com.co/hs-fs/hubfs/ortodoncia.png?width=172&height=172&name=ortodoncia.png",
      title: "Ortodoncia",
      description: "Contamos con variadas opciones para alinear tu sonrisa.",
    },
    {
      icon: "https://www.dentisalud.com.co/hs-fs/hubfs/periodoncia.png?width=172&height=172&name=periodoncia.png",
      title: "Periodoncia",
      description: "Porque la prioridad es también la salud de tus encías.",
    },
    {
      icon: "https://www.dentisalud.com.co/hs-fs/hubfs/rehabilitacion-oral.png?width=172&height=172&name=rehabilitacion-oral.png",
      title: "Rehabilitación oral",
      description:
        "Contamos con excelentes especialistas para asegurarte funcionalidad y estética dental.",
    },
    {
      icon: "https://www.dentisalud.com.co/hs-fs/hubfs/endodoncia.png?width=172&height=172&name=endodoncia.png",
      title: "Endodoncia",
      description:
        "Pon en manos expertas la preservación y restauración de tus dientes.",
    },
  ];

  return (
    <section className="tratamientos">
      <div className="tratamientos-header">
        <h2>
          Tratamientos <span>Integrales</span>
        </h2>

        <p>
          Proponemos una solución completa para todos los problemas de tu boca
          más allá del caso puntual.
        </p>
      </div>

      <div className="tratamientos-grid">
        {tratamientos.map((item, index) => (
          <div className="tratamiento-card" key={index}>
            <div className="icon-circle">
              <img src={item.icon} alt={item.title} />
            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <a href="/">SABER MÁS</a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Tratamientos;
