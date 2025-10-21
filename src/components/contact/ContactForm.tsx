/**
 * Formulario de Contacto Profesional
 *
 * Formulario de contacto con validación, anti-spam y envío real
 *
 * @fileoverview Formulario de contacto profesional con todas las características
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

"use client";

import React, { useState } from "react";
import { useContactFormValidation } from "@/hooks/useValidation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Form,
  FormField,
  TextAreaField,
  EmailField,
  PhoneField,
  SubmitButton,
  ResetButton,
} from "@/components/ui/Form";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ContactForm() {
  const { t } = useLanguage();
  const {
    data,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    reset,
    submit,
  } = useContactFormValidation();

  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submit(async formData => {
      try {
        setSubmitStatus({ type: null, message: "" });

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error al enviar el mensaje");
        }

        setSubmitStatus({
          type: "success",
          message: "¡Mensaje enviado correctamente! Te responderemos pronto.",
        });

        reset();
      } catch (error) {
        console.error("Error sending contact form:", error);
        setSubmitStatus({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Error al enviar el mensaje. Inténtalo de nuevo.",
        });
      }
    });
  };

  // Manejar reset
  const handleReset = () => {
    reset();
    setSubmitStatus({ type: null, message: "" });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-md rounded-lg border border-slate-700/40 shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-4">
          {t("contact.form_title")}
        </h2>
        <p className="text-slate-300">{t("contact.form_description")}</p>
      </div>

      {/* Estado del envío */}
      {submitStatus.type && (
        <div
          className={`mb-6 p-4 rounded-md ${
            submitStatus.type === "success"
              ? "bg-green-900/20 border border-green-500/30"
              : "bg-red-900/20 border border-red-500/30"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {submitStatus.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  submitStatus.type === "success"
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {submitStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <FormField
            label={t("contact.form.name")}
            name="name"
            value={data?.name || ""}
            onChange={value => setValue("name", value)}
            errors={errors}
            required
            placeholder={t("contact.form.name_placeholder")}
            helpText={t("contact.form.name_help")}
          />

          {/* Email */}
          <EmailField
            label={t("contact.form.email")}
            name="email"
            value={data?.email || ""}
            onChange={value => setValue("email", value)}
            errors={errors}
            required
            placeholder={t("contact.form.email_placeholder")}
          />

          {/* Teléfono */}
          <PhoneField
            label={t("contact.form.phone")}
            name="phone"
            value={data?.phone || ""}
            onChange={value => setValue("phone", value)}
            errors={errors}
            placeholder={t("contact.form.phone_placeholder")}
            helpText={t("contact.form.phone_help")}
          />

          {/* Asunto */}
          <FormField
            label={t("contact.form.subject")}
            name="subject"
            value={data?.subject || ""}
            onChange={value => setValue("subject", value)}
            errors={errors}
            required
            placeholder={t("contact.form.subject_placeholder")}
            helpText={t("contact.form.subject_help")}
          />
        </div>

        {/* Mensaje */}
        <TextAreaField
          label={t("contact.form.message")}
          name="message"
          value={data?.message || ""}
          onChange={value => setValue("message", value)}
          errors={errors}
          required
          placeholder={t("contact.form.message_placeholder")}
          helpText={t("contact.form.message_help")}
        />

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <SubmitButton
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="flex-1 sm:flex-none sm:w-auto"
          >
            {isSubmitting ? t("contact.form.sending") : t("contact.form.send")}
          </SubmitButton>

          <ResetButton
            onClick={handleReset}
            disabled={isSubmitting || !isDirty}
            className="flex-1 sm:flex-none sm:w-auto"
          >
            {t("contact.form.clear")}
          </ResetButton>
        </div>

        {/* Información adicional */}
        <div className="mt-8 pt-6 border-t border-slate-700/40">
          <div className="text-sm text-slate-300">
            <h3 className="font-medium text-slate-100 mb-2">
              {t("contact.form.additional_info")}:
            </h3>
            <ul className="space-y-1">
              <li>• {t("contact.form.response_time")}</li>
              <li>• {t("contact.form.attention_hours")}</li>
              <li>• {t("contact.form.urgent_orders")}</li>
              <li>• {t("contact.form.technical_support")}</li>
            </ul>
          </div>
        </div>
      </Form>
    </div>
  );
}
