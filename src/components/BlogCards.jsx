import "../styles/blogCards.css";

function BlogCards() {
  const articles = [
    {
      image:
        "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop",
      date: "24 / 06 / 2025",
      title: "¿Qué es la endodoncia? Todo lo que necesitas saber",
      description:
        "Descubre todo sobre la endodoncia: qué es, cuándo es necesaria, procedimiento, tipos, beneficios y más.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop",
      date: "22 / 06 / 2025",
      title: "¿Qué es la Rehabilitación Oral y cuándo es necesaria?",
      description:
        "Descubre cómo la rehabilitación oral puede restaurar tu sonrisa y cuándo es necesaria.",
    },
    {
      image:
        "https://www.dentisalud.com.co/hs-fs/hubfs/senales-periodontitis-salud-bucal.png",
      date: "20 / 06 / 2025",
      title: "¿Qué es la periodontitis y cómo puedes prevenirla?",
      description:
        "Aprende qué es la periodontitis y cómo prevenirla para mantener una sonrisa saludable.",
    },
  ];

  return (
    <section className="blog-section">
      <div className="blog-header">
        <h2>
          Aquí encontrarás artículos que te <span>harán sonreír</span>
        </h2>
      </div>

      <div className="blog-container">
        {articles.map((article, index) => (
          <div className="blog-card" key={index}>
            <img src={article.image} alt={article.title} />

            <div className="blog-content">
              <span className="blog-date">{article.date}</span>

              <h3>{article.title}</h3>

              <p>{article.description}</p>

              <a href="/">Leer más &gt;</a>
            </div>
          </div>
        ))}
      </div>

      <div className="blog-button-container">
        <button>VER MÁS ARTÍCULOS</button>
      </div>
    </section>
  );
}

export default BlogCards;
