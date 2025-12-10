import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Función auxiliar para guardar en Hasura
async function guardarReservaEnHasura(datos) {
  // CORRECCIÓN AQUÍ: Cambiado Date! por String!
  const query = `
    mutation InsertarReservaWebhook($nombre: String!, $email: String!, $fecha: String!, $hora: String!, $precio: Int!, $sesion: String!, $notas: String) {
      insert_reservas_one(object: {
        nombre: $nombre, 
        email: $email, 
        fecha: $fecha, 
        hora: $hora, 
        precio: $precio, 
        sesion: $sesion, 
        notas: $notas
      }) {
        id
      }
    }
  `;

  const variables = {
    nombre: datos.nombre,
    email: datos.email,
    fecha: datos.fecha, 
    hora: datos.hora,
    precio: parseInt(datos.precio),
    sesion: datos.sesion,
    notas: datos.notas
  };

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_HASURA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET
      },
      body: JSON.stringify({ query, variables })
    });

    const json = await response.json();
    if (json.errors) {
      console.error("Error Hasura:", json.errors);
      return false;
    }
    console.log("✅ Reserva guardada en Hasura via Webhook. ID:", json.data.insert_reservas_one.id);
    return true;
  } catch (error) {
    console.error("Error conectando a Hasura:", error);
    return false;
  }
}

export async function POST(req) {
  const body = await req.text();
  
  // Recuerda: en Next.js nuevo headers() es asíncrono
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event;

  try {
    if (!webhookSecret) {
        console.warn("⚠️ Falta STRIPE_WEBHOOK_SECRET en .env.local");
    }
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`⚠️ Webhook Error de firma: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    console.log("💰 Pago recibido de:", metadata.nombre);

    const datosReserva = {
        ...metadata,
        precio: session.amount_total / 100 
    };

    await guardarReservaEnHasura(datosReserva);
  }

  return NextResponse.json({ received: true });
}