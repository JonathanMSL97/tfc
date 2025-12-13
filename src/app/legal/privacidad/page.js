export default function Privacidad() {
  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', color: '#eee' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', marginBottom: '2rem', color: '#b76cff' }}>Política de Privacidad</h1>
      <p>En Tarot María Rosa nos tomamos muy en serio tus datos. De acuerdo con el RGPD:</p>
      <br />
      <ul style={{ listStyle: 'disc', paddingLeft: '20px', lineHeight: '1.8' }}>
        <li><strong>Responsable:</strong> María Rosa.</li>
        <li><strong>Finalidad:</strong> Gestionar la reserva de tu cita y el pago de la misma.</li>
        <li><strong>Legitimación:</strong> Tu consentimiento al marcar la casilla en el formulario.</li>
        <li><strong>Destinatarios:</strong> No cedemos datos a terceros salvo obligación legal o proveedores tecnológicos necesarios (Stripe para pagos, Google Calendar para agenda).</li>
        <li><strong>Derechos:</strong> Puedes acceder, rectificar o suprimir tus datos escribiendo a nuestro email.</li>
      </ul>
    </div>
  );
}