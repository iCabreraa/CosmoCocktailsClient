# Supabase Auth Setup Guide (CosmoCocktails)

Guia ultra detallada para configurar Auth en Supabase
con las URLs y flujos correctos para este proyecto.

---
## 0) Requisitos previos
- Proyecto Supabase activo.
- Dominio final: https://www.cosmococktails.nl
- Acceso a Vercel (variables de entorno).

---
## 1) Ajustar URLs principales
Ruta: **Supabase Dashboard -> Authentication -> Settings**

Configurar:
- **Site URL**:
  - `https://www.cosmococktails.nl`
- **Additional Redirect URLs**:
  - `https://www.cosmococktails.nl/auth/reset`
  - `https://www.cosmococktails.nl/account`

Esto evita que los emails apunten a localhost.

---
## 2) Proveedor Email (confirmacion y seguridad)
Ruta: **Authentication -> Providers -> Email**

Revisar y activar:
- Enable email confirmations: **ON**
- Enable secure email change: **ON**
- Allow signups: **ON** (si quieres registros abiertos)
- Password recovery: **ON**

Recomendado:
- No habilitar "Anonymous sign-ins" si no es necesario.

---
## 3) Email Templates (confirmacion, reset, change)
Ruta: **Authentication -> Templates**

Si no lo ves en el menu lateral:
- Entra en Authentication y arriba veras pestañas (Users / Policies / Templates).
- Abre **Templates**.

Personaliza estas plantillas:
- Confirm signup
- Reset password
- Email change

Campos clave:
- `{{ .SiteURL }}` (usa Site URL)
- `{{ .ConfirmationURL }}` o `{{ .RecoveryURL }}` (link de accion)

Recomendacion:
Incluye un texto claro indicando que el usuario debe confirmar el email
antes de iniciar sesion.

---
## 4) SMTP (emails profesionales)
Ruta: **Authentication -> Settings -> SMTP**

Si usas SMTP propio (recomendado):
- Enable custom SMTP: **ON**
- Host: (tu proveedor, ej: smtp.resend.com)
- Port: 587
- Username / Password: del proveedor
- From name: "CosmoCocktails"
- From email: no-reply@cosmococktails.nl

Si no configuras SMTP, Supabase usa email basico (menos confianza).

---
## 5) Otras opciones de Auth (opcional)
Ruta: **Authentication -> Settings**

Revisar:
- JWT expiry (deja default si no tienes motivo)
- Session settings (default OK)

---
## 6) Variables en Vercel (front + server)
Ruta: **Vercel -> Project -> Settings -> Environment Variables**

Debe estar:
- `NEXT_PUBLIC_APP_URL` = https://www.cosmococktails.nl
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Si tienes un panel separado (management), debe usar su propio dominio
y no compartir `NEXT_PUBLIC_APP_URL` con la tienda.

---
## 7) Validacion final (flujo correcto)
1) Crear cuenta nueva en produccion.
2) Recibir email de confirmacion con link correcto (cosmococktails.nl).
3) Confirmar email y entrar a /account.
4) Reset password:
   - Hacerlo SIN estar logeado.
   - Link debe abrir /auth/reset en produccion.
   - Crear nueva password sin error.

---
## 8) Diagnostico de errores comunes
**Link de confirmacion apunta a localhost**
- Site URL o Redirect URLs siguen con localhost.
- Plantilla de email tiene URL hardcodeada.

**Reset password falla**
- Se intento reset estando logeado.
- `NEXT_PUBLIC_APP_URL` incorrecto.

**Emails poco esteticos**
- Configura SMTP propio y edita Templates.

---
## 9) Checklist final
- [ ] Site URL y Redirect URLs correctas
- [ ] Email confirmations ON
- [ ] Reset password operativo en produccion
- [ ] SMTP configurado o decidido
- [ ] Templates personalizados
