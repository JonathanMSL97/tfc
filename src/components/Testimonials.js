export default function Testimonials() {
  // 1. LOS DATOS 
  const testimonios = [
    {
      texto: "María Rosa me ayudó a encontrar claridad en un momento difícil de mi vida. Sus lecturas son asombrosamente precisas.",
      autor: "Ana G."
    },
    {
      texto: "Gracias a las sesiones con María Rosa, he podido tomar decisiones importantes con confianza y tranquilidad.",
      autor: "Luis M."
    }
  ];

  // 2. Código
  return (
    <section className="testimonios" id="testimonios">
      <h2>Testimonios</h2>
      {testimonios.map((testimonio, index) => (
        <article key={index} className="testimonio-card">
          <p className="texto">"{testimonio.texto}"</p>
          <p className="autor">- {testimonio.autor}</p>
        </article>
      ))}
    </section>
  );
}