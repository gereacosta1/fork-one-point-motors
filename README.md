# ONE WAY MOTORS – E-Commerce con Affirm

Este es el repositorio de **ONE WAY MOTORS**, un sitio web de catálogo y compra de motocicletas con integración de pagos a través de **Affirm**.

## 🚀 Características principales
- Catálogo de motos con imágenes, detalles y precios.
- Integración de **Affirm** para financiamiento de compras.
- Backend serverless con **Netlify Functions** para manejar la autorización y captura de pagos.
- Diseño responsive con **React + TailwindCSS/Bootstrap**.
- Despliegue automático en **Netlify** conectado al branch `main`.

## 🛠️ Tecnologías utilizadas
- **Frontend:**  
  - React  
  - JavaScript / TypeScript  
  - TailwindCSS y/o Bootstrap  

- **Backend (serverless):**  
  - Netlify Functions  
  - Node.js (fetch, API calls)

- **Integraciones:**  
  - Affirm API (sandbox y producción)  
  - Stripe (opcional, futuro)

- **Hosting & Deploy:**  
  - Netlify (CI/CD conectado a GitHub)

## ⚙️ Flujo de pago con Affirm
1. El usuario selecciona una moto y elige pagar con Affirm.  
2. El frontend genera un `checkout_token` y lo envía a la Function `/affirm-authorize`.  
3. La Function llama a la API de Affirm para **autorizar** la transacción.  
4. (Opcional) La Function puede **capturar** el pago automáticamente, o dejarlo en “authorize only” para QA.  
5. El resultado se devuelve al frontend y se refleja en la UI.

## 🌐 Entornos
- **Sandbox:** para pruebas con datos ficticios.  
- **Production:** activado con la variable `AFFIRM_ENV=prod` y las llaves reales.  

## 🔑 Variables de entorno necesarias (en Netlify)
- `AFFIRM_ENV` → `sandbox` o `prod`  
- `AFFIRM_PUBLIC_KEY` → clave pública de Affirm  
- `AFFIRM_PRIVATE_KEY` → clave privada de Affirm  
- (Opcional) `VITE_AFFIRM_FORCE_REDIRECT=true` → fallback para problemas de cookies  


## 📦 Deploy
Cada `git push` al branch `main` dispara un build automático en Netlify.  
Las funciones serverless se publican en `/.netlify/functions/`.

## 👨‍💻 Autor
Proyecto desarrollado a medida para **ONE WAY MOTORS**.  
Integración de pagos, frontend y deploy realizados con tecnologías modernas para un flujo de compra seguro y eficiente.

