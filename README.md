# 🔮 Tarot María Rosa - Plataforma de Reservas Full-Stack

Este proyecto es la modernización digital del servicio de Tarot de María Rosa. Es una aplicación web **Full-Stack** diseñada para gestionar reservas de citas, pagos y calendario de forma automatizada, migrada desde una web estática a una arquitectura moderna basada en componentes y servicios en la nube.

## 🚀 Tecnologías y Stack (TFC)

Este proyecto utiliza una arquitectura **Serverless** y orientada a eventos, priorizando la escalabilidad y el bajo coste de mantenimiento.

### Frontend (Cliente)
* **Framework:** [Next.js 14](https://nextjs.org/) (App Router).
* **Librería UI:** React.js (Hooks personalizados para la lógica de negocio).
* **Lenguaje:** JavaScript (ES6+).
* **Estilos:** CSS Global con variables nativas (CSS Variables) y diseño Responsive.
* **Despliegue:** Vercel.

### Backend & Datos (Serverless)
* **API Layer:** [Hasura Cloud](https://hasura.io/) (GraphQL instantáneo sobre la base de datos).
* **Base de Datos:** [Neon Tech](https://neon.tech/) (PostgreSQL Serverless).
* **Infraestructura:** Todo el backend está gestionado en la nube, sin servidores físicos que mantener.

---

## ✨ Funcionalidades Clave

### 1. Landing Page Informativa
* Diseño limpio y místico acorde a la marca.
* Secciones modulares: Hero, Sobre Mí, Servicios y Testimonios.
* Navegación fluida (SPA) usando el componente `<Link>` de Next.js.

### 2. Sistema de Reservas (Wizard Interactivo)
El núcleo de la aplicación es un **proceso de reserva en 3 pasos** con gestión de estado compleja (`useState`):

* **Paso 1: Selección de Servicio.** Tarjetas interactivas que actualizan el precio en tiempo real.
* **Paso 2: Calendario Inteligente.**
    * Desarrollado desde cero (sin librerías pesadas) usando lógica nativa de `Date`.
    * Cálculo automático de días, semanas y años bisiestos.
    * Bloqueo de fechas pasadas y gestión de horarios disponibles.
* **Paso 3: Captura de Datos.** Formulario controlado en React para recopilar información del cliente.

### 3. Gestión de Datos (En Progreso)
* Modelado de base de datos relacional en **PostgreSQL**.
* Tabla `reservas` configurada con UUIDs y Timestamps automáticos.
* Conexión establecida mediante **Hasura** para operaciones CRUD vía GraphQL.

---

## 🛠️ Instalación y Configuración Local

Si quieres ejecutar este proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/JonathanMSL97/tfc.git](https://github.com/JonathanMSL97/tfc.git)
    cd tfc
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    *(Próximamente)* Se necesitará configurar un archivo `.env.local` con las claves de conexión a Hasura/Neon.

4.  **Arrancar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

5.  Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗺️ Hoja de Ruta (Roadmap)

El desarrollo se encuentra actualmente en la **Fase 3**.

- [x] **Fase 1: Migración Frontend.** Portar HTML/CSS estático a componentes React y Next.js.
- [x] **Fase 2: Lógica de Negocio.** Crear el motor del calendario y el flujo de estados del wizard de reservas.
- [x] **Fase 3: Infraestructura Backend.** Configurar Neon (Postgres) y Hasura (GraphQL).
- [ ] **Fase 4: Integración API.** Conectar el formulario de React con Hasura (Mutation `insert_reservas`).
- [ ] **Fase 5: Pagos y Agendamiento.** Integración con Stripe y Google Calendar API.

---

## ✒️ Autor

**Jonathan M.** - Desarrollador Full Stack en formación.
*Proyecto realizado como Trabajo de Fin de Ciclo (TFC).*
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
