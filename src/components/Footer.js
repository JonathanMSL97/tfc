'use client'; // 👈 ¡ESTA LÍNEA ES LA CLAVE QUE FALTABA!
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Copyright */}
      <p>© {new Date().getFullYear()} Tarot María Rosa. Todos los derechos reservados.</p>
      
      {/* Enlaces Legales */}
      <div style={{ 
        marginTop: '20px', 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        flexWrap: 'wrap',
        fontSize: '0.85rem'
      }}>
        <Link href="/legal/avisolegal" className="hover-legal link-legal">
          Aviso Legal
        </Link>
        <span style={{ color: '#555' }}>|</span>
        <Link href="/legal/privacidad" className="hover-legal link-legal">
          Política de Privacidad
        </Link>
        <span style={{ color: '#555' }}>|</span>
        <Link href="/legal/terminos" className="hover-legal link-legal">
          Términos y Condiciones
        </Link>
      </div>
      
      {/* Estilos para el hover */}
      <style jsx>{`
        .link-legal {
          color: #aaa;
          text-decoration: none;
          transition: color 0.3s;
        }
        .hover-legal:hover {
          color: #fff !important;
          text-decoration: underline !important;
        }
      `}</style>
    </footer>
  );
}