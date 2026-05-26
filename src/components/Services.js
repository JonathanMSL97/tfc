import Link from 'next/link';
import Image from 'next/image';

export default function Services() {
  const listaServicios = [
    {
      titulo: "Pregunta si o no",
      imagen: "/imagen-si-o-no.jpg",
      descripcion: "Una respuesta clara y concisa sobre tu pregunta específica.",
      precio: "30€"
    },
    {
      titulo: "Lectura general",
      imagen: "/imagen-corta.jpg",
      descripcion: "Visión completa de tu situación actual, desafíos y oportunidades.",
      precio: "50€"
    },
    {
      titulo: "Lectura en profundidad",
      imagen: "/imagen-profunda.jpg",
      descripcion: "Exploración detallada con énfasis en aspectos emocionales y espirituales.",
      precio: "70€"
    }
  ];

  return (
    <section className="servicios" id="servicios">
      <h2>Mis Servicios</h2>
      
      <div className="servicios-grid">
        {listaServicios.map((servicio, index) => (
          <article key={index} className="tarjeta-servicio">
            <Image src={servicio.imagen} alt={servicio.titulo} width={400} height={300} style={{ width: '100%', height: 'auto' }} />
            <h3>{servicio.titulo}</h3>
            <p>{servicio.descripcion}</p>
            <span className="precio">{servicio.precio}</span>
            
            <div style={{ marginTop: '1.5rem' }}>
               <Link href="/reservas" className="boton-cta" style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}>
                 Reservar
               </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}