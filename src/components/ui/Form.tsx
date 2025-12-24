/**
 * Componente de Formulario con Validación
 *
 * Componente base para formularios con validación automática usando Zod
 *
 * @fileoverview Componente de formulario con validación integrada
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import React, { ReactNode } from "react";
import { ValidationError } from "@/hooks/useValidation";

// ============================================================================
// TIPOS
// ============================================================================

export interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "tel" | "number" | "textarea";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errors: ValidationError[];
  value: any;
  onChange: (value: any) => void;
  className?: string;
  helpText?: string;
  children?: ReactNode;
}

export interface FormButtonProps {
  type?: "submit" | "button" | "reset";
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  className?: string;
  noValidate?: boolean;
}

// ============================================================================
// COMPONENTE DE CAMPO
// ============================================================================

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  errors,
  value,
  onChange,
  className = "",
  helpText,
  children,
}: FormFieldProps) {
  const hasError = errors.some(err => err.field === name);
  const errorMessage = errors.find(err => err.field === name)?.message;

  const baseInputClass = `
    w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    }
    ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
    ${className}
  `.trim();

  const renderInput = () => {
    if (children) {
      return children;
    }

    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className={baseInputClass}
            rows={4}
          />
        );

      case "number":
        return (
          <input
            id={name}
            name={name}
            type="number"
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            value={value || ""}
            onChange={e => onChange(Number(e.target.value))}
            className={baseInputClass}
          />
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {renderInput()}

      {helpText && !hasError && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}

      {hasError && errorMessage && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE DE BOTÓN
// ============================================================================

export function FormButton({
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  children,
  onClick,
  className = "",
}: FormButtonProps) {
  const baseClass = `
    inline-flex items-center justify-center
    font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim();

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const buttonClass = `
    ${baseClass}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClass}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// ============================================================================
// COMPONENTE DE FORMULARIO
// ============================================================================

export function Form({
  onSubmit,
  children,
  className = "",
  noValidate = true,
}: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate={noValidate}
      className={`space-y-6 ${className}`}
    >
      {children}
    </form>
  );
}

// ============================================================================
// COMPONENTES ESPECÍFICOS
// ============================================================================

/**
 * Campo de email con validación específica
 */
export function EmailField(props: Omit<FormFieldProps, "type">) {
  return (
    <FormField
      {...props}
      type="email"
      helpText={props.helpText || "Introduce tu dirección de email"}
    />
  );
}

/**
 * Campo de contraseña con validación específica
 */
export function PasswordField(props: Omit<FormFieldProps, "type">) {
  return (
    <FormField
      {...props}
      type="password"
      helpText={props.helpText || "Mínimo 6 caracteres"}
    />
  );
}

/**
 * Campo de teléfono con validación específica
 */
export function PhoneField(props: Omit<FormFieldProps, "type">) {
  return (
    <FormField
      {...props}
      type="tel"
      helpText={props.helpText || "Introduce tu teléfono"}
    />
  );
}

/**
 * Campo de texto largo
 */
export function TextAreaField(props: Omit<FormFieldProps, "type">) {
  return <FormField {...props} type="textarea" />;
}

/**
 * Botón de envío con estado de carga
 */
export function SubmitButton({
  children = "Enviar",
  loading = false,
  ...props
}: Omit<FormButtonProps, "type">) {
  return (
    <FormButton {...props} type="submit" loading={loading}>
      {children}
    </FormButton>
  );
}

/**
 * Botón de reset
 */
export function ResetButton({
  children = "Limpiar",
  ...props
}: Omit<FormButtonProps, "type">) {
  return (
    <FormButton {...props} type="reset" variant="secondary">
      {children}
    </FormButton>
  );
}
