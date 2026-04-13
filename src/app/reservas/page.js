"use client";

import { useState, useEffect } from "react";
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
  const [aceptaLegales, setAceptaLegales] = useState(false);

  // 🆕 Estado para guardar las horas que ya están cogidas en la BD
  const [horasOcupadas, setHorasOcupadas] = useState([]);

  // Datos del Usuario (Formulario)
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

  // Todas las horas posibles (antes de filtrar)
  const HORAS_TOTALES = ["09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];

  // --- LÓGICA DE CALENDARIO ---
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
      hoy.setHours(0, 0, 0, 0);
      const esPasado = fechaActual < hoy;
      const esSeleccionado = diaSeleccionado && diaSeleccionado.getDate() === d && diaSeleccionado.getMonth() === month;

      dias.push(
        <button
          key={d}
          className={`dia-btn ${esSeleccionado ? "seleccionado" : ""}`}
          disabled={esPasado}
          onClick={() => {
            setDiaSeleccionado(fechaActual);
            setHoraSeleccionada(null); // Reseteamos hora al cambiar de día
          }}
        >
          {d}
        </button>
      );
    }
    return dias;
  };

  // --- CARGAR HORAS OCUPADAS DESDE HASURA ---
  useEffect(() => {
    const cargarHorasOcupadas = async () => {
      // Si no hay día seleccionado, no hacemos nada
      if (!diaSeleccionado) return;

      // Reseteamos las ocupadas mientras cargamos
      setHorasOcupadas([]);

      // fecha local, no UTC
      const year = diaSeleccionado.getFullYear();
      const month = String(diaSeleccionado.getMonth() + 1).padStart(2, '0'); 
      const day = String(diaSeleccionado.getDate()).padStart(2, '0');
      const fechaString = `${year}-${month}-${day}`;

      const query = `
        query GetHorasOcupadas($fecha: String!) {
          reservas(where: {fecha: {_eq: $fecha}}) {
            hora
          }
        }
      `;

      try {
        const response = await fetch(process.env.NEXT_PUBLIC_HASURA_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            variables: { fecha: fechaString }
          })
        });

        const json = await response.json();

        if (json.data && json.data.reservas) {
          // Extraemos solo las horas en un array simple: ["10:00", "16:00"]
          const ocupadas = json.data.reservas.map(r => r.hora);
          setHorasOcupadas(ocupadas);
        }
      } catch (error) {
        console.error("Error cargando disponibilidad:", error);
      }
    };

    cargarHorasOcupadas();
  }, [diaSeleccionado]); // Se ejecuta cada vez que cambia el día


  // --- LÓGICA DE FILTRADO DE HORAS VISIBLES ---
  const getHorasVisibles = () => {
    if (!diaSeleccionado) return [];

    const ahora = new Date();
    // Comprobamos si el día seleccionado es HOY
    const esHoy = diaSeleccionado.getDate() === ahora.getDate() &&
      diaSeleccionado.getMonth() === ahora.getMonth() &&
      diaSeleccionado.getFullYear() === ahora.getFullYear();

    return HORAS_TOTALES.filter((horaString) => {
      // 1. Si está en la lista de ocupadas (de la BD), fuera.
      if (horasOcupadas.includes(horaString)) return false;

      // 2. Si es HOY, filtramos las horas que ya pasaron
      if (esHoy) {
        const [h, m] = horaString.split(':');
        const fechaSlot = new Date();
        fechaSlot.setHours(parseInt(h), parseInt(m), 0, 0);

        // Si la hora del slot es menor que ahora, fuera.
        if (fechaSlot < ahora) return false;
      }

      return true; // Si pasa los filtros, se muestra
    });
  };

  // Guardamos las horas limpias en una variable
  const horasParaMostrar = getHorasVisibles();


  // --- MANEJO DEL FORMULARIO ---
  const handleInputChange = (e) => {
    setDatosForm({
      ...datosForm,
      [e.target.name]: e.target.value
    });
  };

  // --- FUNCIÓN PRINCIPAL DE RESERVA ---
  const procesarReservaReal = async (e) => {
    e.preventDefault();

    if (!aceptaLegales) {
      alert("⚠️ Debes aceptar la Política de Privacidad y Condiciones para continuar.");
      return;
    }

    // 1. Validaciones básicas: Si falta algo, simplemente no hacemos nada (el botón suele estar deshabilitado)
    if (!sesionElegida || !diaSeleccionado || !horaSeleccionada) {
      return;
    }

    // --- FORMATEO DE FECHA (ZONA HORARIA LOCAL) ---
    // Usamos esto para evitar el bug de que se guarde el día anterior
    const year = diaSeleccionado.getFullYear();
    const month = String(diaSeleccionado.getMonth() + 1).padStart(2, '0');
    const day = String(diaSeleccionado.getDate()).padStart(2, '0');
    const fechaString = `${year}-${month}-${day}`;

    // --- GUARDIA DE SEGURIDAD (SILENCIOSA) ---
    // Aunque los botones están ocultos, comprobamos esto por si acaso (ej. hack o error de carga)

    // Check 1: Pasado
    const ahora = new Date();
    const fechaReserva = new Date(diaSeleccionado);
    const [horas, minutos] = horaSeleccionada.split(':');
    fechaReserva.setHours(parseInt(horas), parseInt(minutos), 0, 0);

    if (fechaReserva < ahora) {
      console.warn("Intento de reservar hora pasada bloqueado.");
      return; // Cortamos sin alerta visual
    }

    // Check 2: Ocupado (Doble check con lo que cargó React)
    if (horasOcupadas.includes(horaSeleccionada)) {
      alert("⚠️ Vaya, alguien acaba de reservar ese hueco hace un segundo."); // Esta SÍ la dejaría, es el único caso raro "en tiempo real"
      return;
    }

    // --- CONEXIÓN CON STRIPE ---
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: datosForm.nombre,
          email: datosForm.email,
          fecha: fechaString,
          hora: horaSeleccionada,
          precio: sesionElegida.precio,
          sesion: sesionElegida.titulo,
          notas: datosForm.notas
        }),
      });

      const data = await response.json();

      if (data.url) {
        // ¡Éxito! Nos vamos a Stripe
        window.location.href = data.url;
      } else {
        console.error("Stripe no devolvió URL:", data);
        alert("Hubo un problema iniciando el pago. Inténtalo de nuevo.");
      }

    } catch (error) {
      console.error("Error conectando con Stripe:", error);
      alert("Error de conexión. Comprueba tu internet.");
    }
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

                  {/* 🆕 AQUI USAMOS LA LISTA FILTRADA */}
                  <div className="grid-horas">
                    {horasParaMostrar.length > 0 ? (
                      horasParaMostrar.map((hora) => (
                        <button
                          key={hora}
                          className={`hora-btn ${horaSeleccionada === hora ? "seleccionado" : ""}`}
                          onClick={() => setHoraSeleccionada(hora)}
                        >
                          {hora}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-3 text-center text-gray-500" style={{ gridColumn: '1 / -1', color: '#888' }}>
                        No hay horas disponibles.
                      </p>
                    )}
                  </div>

                </div>
              )}
              <button style={{ marginTop: '2rem', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setPasoActual(1)}>
                &larr; Volver a sesiones
              </button>
            </div>
          )}

          {/* PASO 3: FORMULARIO */}
          {pasoActual === 3 && (
            <div className="paso-animado">
              <h2>Tus Datos</h2>
              <form className="formulario" onSubmit={procesarReservaReal}>
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

                {/* --- CHECKBOX LEGAL --- */}
                {/* --- CHECKBOX LEGAL --- */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    id="legal-check"
                    checked={aceptaLegales}
                    onChange={(e) => setAceptaLegales(e.target.checked)}
                    style={{
                      marginTop: '4px',
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px',
                      accentColor: '#a44cff' /* El tick saldrá morado a juego */
                    }}
                  />
                  <label htmlFor="legal-check" style={{ color: '#ddd', cursor: 'pointer', lineHeight: '1.4' }}>
                    He leído y acepto la{' '}
                    <a href="/legal/privacidad" target="_blank" style={{ textDecoration: 'underline', color: '#b76cff' }}>
                      Política de Privacidad
                    </a>{' '}
                    y los{' '}
                    <a href="/legal/terminos" target="_blank" style={{ textDecoration: 'underline', color: '#b76cff' }}>
                      Términos y Condiciones
                    </a>.
                  </label>
                </div>

                {/* --- BOTÓN DE PAGAR (Estilo .boton-cta recuperado) --- */}
                <button
                  className="boton-cta"
                  onClick={procesarReservaReal}
                  disabled={!aceptaLegales}
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    marginTop: '10px',
                    // Lógica visual: se apaga si no está marcado el check
                    opacity: aceptaLegales ? 1 : 0.5,
                    cursor: aceptaLegales ? 'pointer' : 'not-allowed',
                    boxShadow: aceptaLegales ? undefined : 'none',
                    transform: aceptaLegales ? undefined : 'none'
                  }}
                >
                  Confirmar y Pagar {sesionElegida ? `${sesionElegida.precio}€` : ''}
                </button>

                {/* Cierre del formulario (asegúrate de que encaja con tu código anterior) */}
              </form>

              <button
                style={{
                  marginTop: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem'
                }}
                onClick={() => setPasoActual(2)}
              >
                &larr; Volver al calendario
              </button>

              {/* Cierre del div contenedor */}
            </div>
          )}
        </div>

        {/* RESUMEN LATERAL */}
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
            </>
          ) : (
            <p style={{ color: '#888' }}>Selecciona una sesión.</p>
          )}
        </aside>
      </main>
    </div>
  );
}