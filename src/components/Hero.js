import Link from 'next/link';

export default function Hero() {
  return (
    <header className="hero" id="inicio">
      <div className="hero-content">
        <h1>Descubre tu destino con las cartas del Tarot</h1>
        <h2>Consulta personalizada y guía espiritual</h2>
        
        {/* El botón llevará a la página de reservas (que haremos luego) */}
        <Link href="/reservas" className="boton-cta">
          Reserva tu lectura ahora
        </Link>
      </div>
    </header>
  );
}