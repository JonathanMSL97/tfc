import Link from 'next/link';

export default function PaginaExito() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'green', fontSize: '3rem' }}>¡Pago Recibido!</h1>
      <p>Tu reserva se está confirmando. En breve recibirás un email con el enlace a Google Meet.</p>
      <Link href="/" style={{ textDecoration: 'underline', color: 'blue' }}>
        Volver al inicio
      </Link>
    </div>
  );
}