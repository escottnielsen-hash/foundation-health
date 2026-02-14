'use client'

import { useState, useCallback } from 'react'
import type { z } from 'zod'

type FieldErrors<T> = Partial<Record<keyof T, string>>

interface UseFormValidationReturn<T> {
  /** Per-field error messages after the last validation attempt */
  errors: FieldErrors<T>
  /** Validate data against the schema. Returns the parsed data on success, or null on failure. */
  validate: (data: unknown) => T | null
  /** Clear all errors */
  clearErrors: () => void
  /** Clear a single field error (useful on field change) */
  clearFieldError: (field: keyof T) => void
  /** Set a specific field error programmatically */
  setFieldError: (field: keyof T, message: string) => void
}

/**
 * Generic form validation hook powered by a Zod schema.
 *
 * @example
 * ```tsx
 * const { errors, validate, clearFieldError } = useFormValidation(loginSchema)
 *
 * const handleSubmit = () => {
 *   const result = validate({ email, password })
 *   if (!result) return // errors are populated
 *   // proceed with result
 * }
 * ```
 */
export function useFormValidation<T>(
  schema: z.ZodType<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<FieldErrors<T>>({})

  const validate = useCallback(
    (data: unknown): T | null => {
      const result = schema.safeParse(data)

      if (result.success) {
        setErrors({})
        return result.data
      }

      const fieldErrors: FieldErrors<T> = {}
      for (const issue of result.error.issues) {
        // Use the first path segment as the field key.
        // For refinements that target a specific path (e.g. confirmPassword),
        // the path array will contain the field name at index 0.
        const field = issue.path[0] as keyof T | undefined
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }

      setErrors(fieldErrors)
      return null
    },
    [schema]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  return { errors, validate, clearErrors, clearFieldError, setFieldError }
}
