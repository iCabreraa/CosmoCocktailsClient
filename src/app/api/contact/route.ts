/**
 * API Endpoint para Formulario de Contacto
 *
 * Maneja el envío de formularios de contacto con validación y anti-spam
 *
 * @fileoverview API endpoint para formularios de contacto
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import {
  contactFormSchema,
  validateRequestBody,
  createValidationErrorResponse,
} from "@/lib/validation";

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Validar datos de entrada
    const validation = await validateRequestBody(contactFormSchema, request);

    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { name, email, subject, message, phone } = validation.data!;

    // 2. Validaciones adicionales de seguridad
    const securityChecks = await performSecurityChecks({
      name,
      email,
      subject,
      message,
      phone,
    });

    if (!securityChecks.passed) {
      return NextResponse.json(
        {
          error: "Mensaje bloqueado por seguridad",
          message: securityChecks.reason,
        },
        { status: 400 }
      );
    }

    // 3. Procesar y enviar el mensaje
    const sendResult = await sendContactMessage({
      name,
      email,
      subject,
      message,
      phone,
      ip: getClientIP(request),
      userAgent: request.headers.get("user-agent") || "Unknown",
    });

    if (!sendResult.success) {
      console.error("Error sending contact message:", sendResult.error);
      return NextResponse.json(
        {
          error: "Error al enviar el mensaje",
          message:
            "No pudimos enviar tu mensaje. Inténtalo de nuevo más tarde.",
        },
        { status: 500 }
      );
    }

    // 4. Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Mensaje enviado correctamente",
        messageId: sendResult.messageId,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message:
          "Ha ocurrido un error inesperado. Inténtalo de nuevo más tarde.",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Realiza verificaciones de seguridad en el mensaje
 */
async function performSecurityChecks(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}): Promise<{ passed: boolean; reason?: string }> {
  const { name, email, subject, message, phone } = data;

  // 1. Verificar longitud mínima del mensaje
  if (message.length < 10) {
    return {
      passed: false,
      reason: "El mensaje debe tener al menos 10 caracteres",
    };
  }

  // 2. Verificar contenido sospechoso
  const suspiciousPatterns = [
    /https?:\/\/[^\s]+/gi, // URLs
    /[A-Z]{5,}/g, // Texto en mayúsculas excesivo
    /(.)\1{4,}/g, // Caracteres repetidos
    /spam|viagra|casino|lottery|winner/gi, // Palabras spam comunes
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message) || pattern.test(subject)) {
      return {
        passed: false,
        reason: "El mensaje contiene contenido no permitido",
      };
    }
  }

  // 3. Verificar email válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      passed: false,
      reason: "Dirección de email inválida",
    };
  }

  // 4. Verificar nombre válido
  if (name.length < 2 || name.length > 50) {
    return {
      passed: false,
      reason: "El nombre debe tener entre 2 y 50 caracteres",
    };
  }

  return { passed: true };
}

/**
 * Envía el mensaje de contacto
 */
const maskIp = (ip: string) => {
  if (!ip) return "***";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts.slice(0, 2).join(":")}:*:*`;
  }
  return "***";
};

async function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  ip: string;
  userAgent: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const resendApiKey = process.env.RESEND_API_KEY;
    const receiverEmail =
      process.env.CONTACT_RECEIVER_EMAIL || "support@cosmococktails.nl";
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL || "no-reply@cosmococktails.nl";

    if (!resendApiKey) {
      console.warn(
        "Contact form email not sent: RESEND_API_KEY not configured."
      );
      console.log("📧 Contact message received:", {
        messageId,
        subjectLength: data.subject.length,
        messageLength: data.message.length,
        ip: maskIp(data.ip),
        timestamp: new Date().toISOString(),
      });
      return { success: true, messageId };
    }

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <h2>New contact message</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br />")}</p>
        <hr />
        <p style="font-size:12px;color:#64748b;">
          IP: ${maskIp(data.ip)} · UA: ${data.userAgent}
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `CosmoCocktails <${fromEmail}>`,
        to: [receiverEmail],
        subject: `Contact form: ${data.subject}`,
        html,
        reply_to: data.email,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: errorBody };
    }

    const payload = await response.json().catch(() => null);
    const resendId = payload?.id ?? messageId;

    return { success: true, messageId: resendId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Obtiene la IP del cliente
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "unknown";
}

/**
 * Genera HTML para el email de contacto (para uso futuro)
 */
function generateContactEmailHTML(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  ip: string;
  userAgent: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">Nuevo mensaje de contacto</h2>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Información del contacto</h3>
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.phone ? `<p><strong>Teléfono:</strong> ${data.phone}</p>` : ""}
        <p><strong>Asunto:</strong> ${data.subject}</p>
      </div>
      
      <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">Mensaje</h3>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #6b7280;">
        <p><strong>Información técnica:</strong></p>
        <p>IP: ${data.ip}</p>
        <p>User Agent: ${data.userAgent}</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      </div>
    </div>
  `;
}
