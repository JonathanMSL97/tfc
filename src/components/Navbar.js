import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="barra-inicio">
      <p>María Rosa</p>
      
      {/* En Next.js usamos Link para navegar */}
      <Link href="/">Inicio</Link>
      <Link href="/#sobre-mi">Sobre Mí</Link>
      <Link href="/#servicios">Servicios</Link>
      <Link href="/#testimonios">Testimonios</Link>
    </nav>
  );
}