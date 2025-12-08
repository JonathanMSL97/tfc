import { Playfair_Display, Open_Sans } from "next/font/google";
import "./globals.css";
// 1. IMPORTAMOS LOS COMPONENTES
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
  display: "swap",
});

export const metadata = {
  title: "Tarot María Rosa",
  description: "Lecturas de Tarot personalizadas y guía espiritual",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${playfair.variable} ${openSans.variable}`}>
        {/* 2. PONEMOS EL NAVBAR ARRIBA */}
        <Navbar />
        
        {/* Aquí se renderizará el contenido de cada página */}
        <main style={{ minHeight: '80vh' }}> 
          {children}
        </main>

        {/* 3. PONEMOS EL FOOTER ABAJO */}
        <Footer />
      </body>
    </html>
  );
}
