# Stripe Live Setup Guide (CosmoCocktails)

Este documento es una guia ultra detallada para configurar Stripe desde cero
en este proyecto. El objetivo es dejar pagos en vivo listos y estables.

---
## 0) Requisitos previos
Antes de empezar, prepara:
- Dominio final: https://www.cosmococktails.nl
- Datos legales del negocio (razon social, direccion, pais, tipo de negocio)
- Identificacion fiscal y datos bancarios reales
- Email de soporte (ej: support@cosmococktails.nl)
- Acceso a Vercel (para variables de entorno)

---
## 1) Crear la cuenta de Stripe
1) Entra en https://dashboard.stripe.com/register
2) Crea la cuenta con un email del proyecto.
3) Verifica el email (Stripe envia un link).
4) Inicia sesion en el Dashboard.

---
## 2) Completar perfil del negocio (obligatorio para Live)
Ruta: **Settings (icono de engranaje) -> Business -> Account details**

Completa:
- Business type (Individual / Company)
- Legal business name
- Business address
- Tax ID / VAT (si aplica)
- Website: https://www.cosmococktails.nl
- Product description: "Ecommerce de cocktails embotellados"

Tambien revisa:
**Settings -> Business -> Public details**
- Public business name
- Support email / phone
- Statement descriptor (ej: COSMOCOCKTAILS)

---
## 3) Activar pagos en vivo (Activate account)
Ruta: **Dashboard -> Activate account**
1) Completa verificacion de identidad.
2) Agrega cuenta bancaria (IBAN).
3) Revisa el estado: debe quedar "Live payments enabled".

---
## 4) Activar metodos de pago
Ruta: **Settings -> Payment methods**

Activar:
- Card
- iDEAL (para NL)

Opcional:
- Apple Pay / Google Pay (requiere verificacion de dominio)

Recomendado:
- Dejar "Automatic payment methods" activado si Stripe lo permite.

---
## 5) Crear webhook (Live y Test)
Ruta: **Developers -> Webhooks -> Add endpoint**

Endpoint URL (produccion):
```
https://www.cosmococktails.nl/api/stripe-webhook
```

Eventos minimos recomendados:
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded (opcional)

Importante:
- Debes crear un webhook en **Test mode** y otro en **Live mode**.
- Cada modo genera un **Signing secret** distinto.

Guarda el **Signing secret** (whsec_...) porque va en Vercel.

---
## 6) Obtener API keys (Live)
Ruta: **Developers -> API keys**

En modo **Live** copia:
- Publishable key (pk_live_...)
- Secret key (sk_live_...)

No mezclar Test/Live en produccion.

---
## 7) Variables de entorno en Vercel
Ruta: **Vercel -> Project -> Settings -> Environment Variables**

Agregar en **Production**:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_live_...
- `STRIPE_SECRET_KEY` = sk_live_...
- `STRIPE_WEBHOOK_SECRET` = whsec_... (del webhook live)
- `NEXT_PUBLIC_APP_URL` = https://www.cosmococktails.nl

Si quieres permitir pagos de test en produccion (solo temporal):
- `NEXT_PUBLIC_STRIPE_ALLOW_TEST_PAYMENTS` = true

Despues de guardar, hacer **Redeploy**.

---
## 8) Validacion final en produccion
1) Entra en la web y completa un checkout real.
2) En Stripe -> Payments, debe aparecer el PaymentIntent en Live.
3) En Vercel -> Functions logs, no debe haber errores 500.

---
## 9) Diagnostico rapido de errores comunes
**Error 400 en webhook (firma invalida)**
- Usa el Signing secret correcto (Test vs Live).
- Asegura que el endpoint es exactamente `/api/stripe-webhook`.
- En este proyecto el webhook ya usa raw body; el error suele ser clave incorrecta.

**Error 404 en /api/stripe-webhook**
- La ruta no existe en ese deploy o hay un proxy incorrecto.
- Verifica que el deploy apunta a `main` y que la ruta existe en `src/app/api/stripe-webhook/route.ts`.

**Error 500 en /api/create-payment-intent**
- Falta `STRIPE_SECRET_KEY` o es incorrecta.
- Los items del carrito no son validos (stock o precio).
- Revisar logs de Vercel -> Functions -> create-payment-intent.

---
## 10) Checklist final (live ready)
- [ ] Cuenta Stripe activada (Live enabled)
- [ ] Metodos de pago activos (Card + iDEAL)
- [ ] Webhook live creado y secret en Vercel
- [ ] Variables de entorno live correctas
- [ ] Checkout completo en produccion sin errores
