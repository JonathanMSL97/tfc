import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, email, fecha, hora, precio, sesion, notas } = body;

    // Creamos la sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Sesión de Tarot: ${sesion}`,
              description: `Reserva para el día ${fecha} a las ${hora}`,
            },
            unit_amount: precio * 100, // Stripe funciona en céntimos (50€ = 5000)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // IMPORTANTE: Aquí guardamos los datos para recuperarlos tras el pago
      metadata: {
        nombre,
        email,
        fecha,
        hora,
        sesion,
        notas: notas || "", // Stripe no acepta nulls en metadata
      },
      // A dónde redirigir si paga o si cancela
      success_url: `${request.headers.get('origin')}/exito`,
      cancel_url: `${request.headers.get('origin')}/`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Error Stripe:", error);
    return NextResponse.json({ error: "Error creando sesión de pago" }, { status: 500 });
  }
}