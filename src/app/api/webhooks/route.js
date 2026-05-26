import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { google } from "googleapis";
import { Resend } from 'resend'; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY); 
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function crearEventoGoogleCalendar(datos) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), 
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const fechaInicio = `${datos.fecha}T${datos.hora}:00`;
    const [horaStr, minStr] = datos.hora.split(':');
    let horaFinNum = parseInt(horaStr) + 1;
    const horaFinStr = horaFinNum.toString().padStart(2, '0');
    const fechaFin = `${datos.fecha}T${horaFinStr}:${minStr}:00`;

    const meetLink = process.env.MEET_LINK_FIJO || "https://meet.google.com/tu-link-aqui";

    const evento = {
      summary: ` Tarot: ${datos.sesion} con ${datos.nombre}`,
      description: `Sala de Videollamada: ${meetLink}\n\nNotas: ${datos.notas || "-"}\nStripe ID: ${datos.email}`,
      location: meetLink,
      start: { dateTime: fechaInicio, timeZone: 'Europe/Madrid' },
      end: { dateTime: fechaFin, timeZone: 'Europe/Madrid' },
    };

    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      resource: evento,
    });

    console.log(" Evento creado en Calendar.");
    return meetLink; 

  } catch (error) {
    console.error("❌ Error Calendar:", error.message);
    return process.env.MEET_LINK_FIJO; 
  }
}

async function guardarReservaEnHasura(datos) {
  const query = `
    mutation InsertarReservaWebhook($nombre: String!, $email: String!, $fecha: String!, $hora: String!, $precio: Int!, $sesion: String!, $notas: String) {
      insert_reservas_one(object: {
        nombre: $nombre, email: $email, fecha: $fecha, hora: $hora, precio: $precio, sesion: $sesion, notas: $notas
      }) { id }
    }
  `;
  const variables = {
    nombre: datos.nombre, email: datos.email, fecha: datos.fecha, 
    hora: datos.hora, precio: parseInt(datos.precio), sesion: datos.sesion, notas: datos.notas
  };

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_HASURA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET },
      body: JSON.stringify({ query, variables })
    });
    const json = await response.json();
    if (json.errors) return console.error("Error Hasura:", json.errors);
    console.log(" Reserva guardada en Hasura.");
  } catch (error) { console.error("Error Hasura:", error); }
}

async function enviarEmailConfirmacion(datos, meetLink) {
  try {
    const data = await resend.emails.send({
      from: 'Tarot Reservas <onboarding@resend.dev>', 
      to: [datos.email], 
      subject: '✨ Confirmación de tu Lectura de Tarot',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">¡Reserva Confirmada!</h1>
          <p>Hola <strong>${datos.nombre}</strong>,</p>
          <p>Gracias por tu reserva. Aquí tienes los detalles de tu sesión:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <p><strong>🔮 Sesión:</strong> ${datos.sesion}</p>
            <p><strong>📅 Fecha:</strong> ${datos.fecha}</p>
            <p><strong>⏰ Hora:</strong> ${datos.hora}</p>
            <p><strong>💰 Precio pagado:</strong> ${datos.precio}€</p>
          </div>

          <p style="margin-top: 20px;">Para unirte a la videollamada a la hora acordada, haz clic aquí:</p>
          
          <a href="${meetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Unirse a la Videollamada
          </a>

          <p style="font-size: 12px; color: #888; margin-top: 30px;">Si tienes dudas, responde a este correo.</p>
        </div>
      `
    });
    console.log(" Email enviado:", data.id);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
  }
}

export async function POST(req) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    console.log(" Pago recibido de:", metadata.nombre);

    const datosReserva = { ...metadata, precio: session.amount_total / 100 };

    const meetLink = await crearEventoGoogleCalendar(datosReserva);

    await guardarReservaEnHasura(datosReserva);

    await enviarEmailConfirmacion(datosReserva, meetLink);
  }

  return NextResponse.json({ received: true });
}