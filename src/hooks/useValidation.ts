/**
 * Hook de Validación para React
 *
 * Proporciona validación en tiempo real para formularios usando Zod
 *
 * @fileoverview Hook de validación para componentes React
 * @version 1.0.0
 * @author CosmoCocktails Development Team
 */

import { useState, useCallback, useMemo } from "react";
import { z } from "zod";

// ============================================================================
// TIPOS
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationState<T> {
  data: T | null;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export interface ValidationActions<T> {
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  reset: () => void;
  submit: (onSubmit: (data: T) => Promise<void> | void) => Promise<void>;
}

export type UseValidationReturn<T> = ValidationState<T> & ValidationActions<T>;

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para validación de formularios con Zod
 */
export function useValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialValues: T
): UseValidationReturn<T> {
  const [data, setData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar datos con Zod
  const validateData = useCallback(
    (values: T): ValidationError[] => {
      try {
        schema.parse(values);
        return [];
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.issues.map(err => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          }));
        }
        return [
          {
            field: "unknown",
            message: "Error de validación desconocido",
            code: "unknown",
          },
        ];
      }
    },
    [schema]
  );

  // Validar campo específico
  const validateField = useCallback(
    (field: keyof T): boolean => {
      const fieldErrors = validateData(data);
      const fieldSpecificErrors = fieldErrors.filter(
        error => error.field === field
      );

      setErrors(prev => [
        ...prev.filter(error => error.field !== field),
        ...fieldSpecificErrors,
      ]);

      return fieldSpecificErrors.length === 0;
    },
    [data, validateData]
  );

  // Validar todos los campos
  const validate = useCallback((): boolean => {
    const newErrors = validateData(data);
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [data, validateData]);

  // Establecer valor de un campo
  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setData(prev => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Validar campo en tiempo real
      setTimeout(() => {
        validateField(field);
      }, 0);
    },
    [validateField]
  );

  // Establecer múltiples valores
  const setValues = useCallback(
    (values: Partial<T>) => {
      setData(prev => ({ ...prev, ...values }));
      setIsDirty(true);

      // Validar campos afectados
      setTimeout(() => {
        Object.keys(values).forEach(field => {
          validateField(field as keyof T);
        });
      }, 0);
    },
    [validateField]
  );

  // Resetear formulario
  const reset = useCallback(() => {
    setData(initialValues);
    setErrors([]);
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  // Enviar formulario
  const submit = useCallback(
    async (onSubmit: (data: T) => Promise<void> | void) => {
      setIsSubmitting(true);

      try {
        const isValid = validate();
        if (!isValid) {
          return;
        }

        await onSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [data, validate]
  );

  // Estado calculado
  const isValid = useMemo(() => {
    return errors.length === 0 && isDirty;
  }, [errors.length, isDirty]);

  return {
    data,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    setValues,
    validate,
    validateField,
    reset,
    submit,
  };
}

// ============================================================================
// HOOKS ESPECÍFICOS
// ============================================================================

/**
 * Hook para validación de login
 */
export function useLoginValidation() {
  const { userLoginSchema } = require("@/lib/validation");

  return useValidation(userLoginSchema, {
    email: "",
    password: "",
  });
}

/**
 * Hook para validación de registro
 */
export function useSignupValidation() {
  const { userSignupSchema } = require("@/lib/validation");

  return useValidation(userSignupSchema, {
    email: "",
    password: "",
    full_name: "",
    phone: "",
  });
}

/**
 * Hook para validación de dirección
 */
export function useAddressValidation() {
  const { addressSchema } = require("@/lib/validation");

  return useValidation(addressSchema, {
    street: "",
    city: "",
    postal_code: "",
    country: "",
    is_default: false,
  });
}

/**
 * Hook para validación de formulario de contacto
 */
export function useContactFormValidation() {
  const { contactFormSchema } = require("@/lib/validation");

  return useValidation(contactFormSchema, {
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: "",
    privacy_consent: false,
  });
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene el error de un campo específico
 */
export function getFieldError(
  errors: ValidationError[],
  field: string
): string | null {
  const error = errors.find(err => err.field === field);
  return error ? error.message : null;
}

/**
 * Verifica si un campo tiene error
 */
export function hasFieldError(
  errors: ValidationError[],
  field: string
): boolean {
  return errors.some(err => err.field === field);
}

/**
 * Obtiene la clase CSS para un campo con error
 */
export function getFieldErrorClass(
  errors: ValidationError[],
  field: string
): string {
  return hasFieldError(errors, field)
    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
}

/**
 * Formatea errores para mostrar en UI
 */
export function formatErrorsForUI(
  errors: ValidationError[]
): Record<string, string> {
  return errors.reduce(
    (acc, error) => {
      acc[error.field] = error.message;
      return acc;
    },
    {} as Record<string, string>
  );
}
