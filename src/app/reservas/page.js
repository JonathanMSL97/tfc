"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Para redirigir al usuario después de pagar

export default function PageReservas() {
  const router = useRouter();

  // --- ESTADOS ---
  const [pasoActual, setPasoActual] = useState(1);
  
  // Datos de la Reserva
  const [sesionElegida, setSesionElegida] = useState(null);
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  
  // 🆕 Datos del Usuario (Formulario)
  const [datosForm, setDatosForm] = useState({
    nombre: "",
    email: "",
    notas: ""
  });

  // --- DATOS FIJOS ---
  const opciones = [
    { id: 1, titulo: "Pregunta si o no", precio: 30, desc: "Respuesta concreta." },
    { id: 2, titulo: "Lectura General", precio: 50, desc: "Visión completa." },
    { id: 3, titulo: "Sesión Profunda", precio: 70, desc: "Análisis detallado." },
  ];

  const horasDisponibles = ["09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];

  // --- LÓGICA AUXILIAR ---
  const mesAnio = fechaCalendario.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const cambiarMes = (offset) => {
    const nuevaFecha = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + offset, 1);
    setFechaCalendario(nuevaFecha);
  };

  const generarDias = () => {
    const year = fechaCalendario.getFullYear();
    const month = fechaCalendario.getMonth();
    const diasEnMes = new Date(year, month + 1, 0).getDate();
    let primerDiaSemana = new Date(year, month, 1).getDay();
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

    const dias = [];
    for (let i = 0; i < primerDiaSemana; i++) dias.push(<div key={`empty-${i}`}></div>);
    
    for (let d = 1; d <= diasEnMes; d++) {
      const fechaActual = new Date(year, month, d);
      const hoy = new Date();
      hoy.setHours(0,0,0,0);
      const esPasado = fechaActual < hoy;
      const esSeleccionado = diaSeleccionado && diaSeleccionado.getDate() === d && diaSeleccionado.getMonth() === month;

      dias.push(
        <button
          key={d}
          className={`dia-btn ${esSeleccionado ? "seleccionado" : ""}`}
          disabled={esPasado}
          onClick={() => { setDiaSeleccionado(fechaActual); setHoraSeleccionada(null); }}
        >
          {d}
        </button>
      );
    }
    return dias;
  };

  // 🆕 LÓGICA DEL FORMULARIO
  const handleInputChange = (e) => {
    // Actualizamos solo el campo que ha cambiado (nombre, email o notas)
    setDatosForm({
      ...datosForm, // Mantenemos lo que ya había
      [e.target.name]: e.target.value // Sobrescribimos el campo nuevo
    });
  };

  const procesarPagoSimulado = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    
    // Aquí es donde en el futuro conectaremos con Stripe y Backend
    alert(`
      ¡Simulación de Reserva Exitosa! 🎉
      
      Sesión: ${sesionElegida.titulo}
      Fecha: ${diaSeleccionado.toLocaleDateString()} a las ${horaSeleccionada}
      Cliente: ${datosForm.nombre}
      
      (En el futuro, esto te llevará a la pasarela de pago real)
    `);

    // Redirigir a inicio después de aceptar
    router.push("/");
  };

  const porcentajeProgreso = (pasoActual / 3) * 100;

  return (
    <div>
      <header className="header-reserva">
        <h1>Reserva tu Lectura</h1>
        <div className="pasos">
          <span className={pasoActual >= 1 ? "paso-activo" : ""}>1. Sesión</span>
          <span className={pasoActual >= 2 ? "paso-activo" : ""}>2. Fecha</span>
          <span className={pasoActual >= 3 ? "paso-activo" : ""}>3. Datos</span>
        </div>
        <div className="barra-contenedor">
          <div className="barra-relleno" style={{ width: `${porcentajeProgreso}%` }}></div>
        </div>
      </header>

      <main className="contenedor-reserva">
        <div className="contenido-pasos">
          
          {/* PASO 1 */}
          {pasoActual === 1 && (
            <div className="paso-animado">
              <h2>Elige el tipo de sesión</h2>
              <div className="opciones-sesion">
                {opciones.map((opcion) => (
                  <div
                    key={opcion.id}
                    className={`tarjeta-sesion ${sesionElegida?.id === opcion.id ? "seleccionada" : ""}`}
                    onClick={() => setSesionElegida(opcion)}
                  >
                    <h3>{opcion.titulo}</h3>
                    <p>{opcion.desc}</p>
                    <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{opcion.precio}€</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {pasoActual === 2 && (
             <div className="paso-animado">
                <h2>Elige fecha y hora</h2>
                <div className="calendario-container">
                  <div className="cal-header">
                    <button onClick={() => cambiarMes(-1)}>&lt;</button>
                    <span style={{ textTransform: 'capitalize' }}>{mesAnio}</span>
                    <button onClick={() => cambiarMes(1)}>&gt;</button>
                  </div>
                  <div className="dias-semana"><div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div></div>
                  <div className="grid-dias">{generarDias()}</div>
                </div>
                {diaSeleccionado && (
                  <div className="horas-container">
                    <h3>Horarios para el {diaSeleccionado.toLocaleDateString()}</h3>
                    <div className="grid-horas">
                      {horasDisponibles.map((hora) => (
                        <button key={hora} className={`hora-btn ${horaSeleccionada === hora ? "seleccionado" : ""}`} onClick={() => setHoraSeleccionada(hora)}>
                          {hora}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button style={{ marginTop: '2rem', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setPasoActual(1)}>
                  &larr; Volver a sesiones
                </button>
             </div>
          )}

          {/* 🆕 PASO 3: FORMULARIO REAL */}
          {pasoActual === 3 && (
            <div className="paso-animado">
              <h2>Tus Datos</h2>
              <form className="formulario" onSubmit={procesarPagoSimulado}>
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  name="nombre"
                  placeholder="Tu nombre" 
                  required 
                  value={datosForm.nombre}
                  onChange={handleInputChange}
                />

                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="tucorreo@email.com" 
                  required 
                  value={datosForm.email}
                  onChange={handleInputChange}
                />

                <label>Notas (opcional)</label>
                <textarea 
                  name="notas"
                  placeholder="¿Tienes alguna pregunta específica o tema en mente?"
                  value={datosForm.notas}
                  onChange={handleInputChange}
                ></textarea>

                {/* Botón de envío dentro del form para que funcione el 'Enter' */}
                <button 
                   type="submit" 
                   className="boton-cta" 
                   style={{ marginTop: '1rem', width: '100%' }}
                >
                  Confirmar y Pagar {sesionElegida?.precio}€
                </button>
              </form>
              
              <button 
                style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }} 
                onClick={() => setPasoActual(2)}
              >
                &larr; Volver al calendario
              </button>
            </div>
          )}

        </div>

        {/* RESUMEN */}
        <aside className="resumen">
          <h3>Resumen</h3>
          {sesionElegida ? (
            <>
              <p><strong>Sesión:</strong> {sesionElegida.titulo}</p>
              {diaSeleccionado && <p><strong>Fecha:</strong> {diaSeleccionado.toLocaleDateString()}</p>}
              {horaSeleccionada && <p><strong>Hora:</strong> {horaSeleccionada}</p>}
              <div className="total">Total: {sesionElegida.precio}€</div>
              
              {pasoActual === 1 && (
                <button className="boton-cta" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setPasoActual(2)}>
                  Continuar &rarr;
                </button>
              )}
              {pasoActual === 2 && (
                <button 
                  className="boton-cta" 
                  style={{ width: '100%', marginTop: '1rem' }} 
                  disabled={!diaSeleccionado || !horaSeleccionada}
                  onClick={() => setPasoActual(3)}
                >
                  Ir a Mis Datos &rarr;
                </button>
              )}
              {/* En el paso 3 el botón está dentro del formulario */}
            </>
          ) : (
            <p style={{ color: '#888' }}>Selecciona una sesión.</p>
          )}
        </aside>
      </main>
    </div>
  );
}