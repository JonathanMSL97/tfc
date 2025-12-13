'use client';
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [aceptado, setAceptado] = useState(true); // Empezamos en true para evitar parpadeo

  useEffect(() => {
    // Al cargar, miramos si ya aceptó antes
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setAceptado(false); // Si no hay rastro, mostramos el banner
    }
  }, []);

  const aceptarCookies = () => {
    localStorage.setItem('cookie_consent', 'true');
    setAceptado(true);
  };

  if (aceptado) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)', color: 'white', padding: '15px',
      textAlign: 'center', zIndex: 9999, fontSize: '14px',
      borderTop: '1px solid #444'
    }}>
      <p style={{ display: 'inline-block', marginRight: '15px', margin: 0 }}>
        🍪 Usamos cookies esenciales para que la pasarela de pago funcione de forma segura.
      </p>
      <button 
        onClick={aceptarCookies}
        style={{
          backgroundColor: '#4F46E5', color: 'white', 
          border: 'none', padding: '8px 20px', borderRadius: '5px', 
          cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        Entendido
      </button>
    </div>
  );
}
