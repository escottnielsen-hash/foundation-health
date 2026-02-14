import { z } from 'zod'

// ============================================
// Checkout request validation
// ============================================

export const checkoutSchema = z.object({
  invoice_id: z
    .string()
    .uuid('Invalid invoice ID format'),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

// ============================================
// Stripe session verification
// ============================================

export const sessionSchema = z.object({
  session_id: z
    .string()
    .min(1, 'Session ID is required')
    .refine(
      (val) => val.startsWith('cs_'),
      'Invalid session ID format'
    ),
})

export type SessionInput = z.infer<typeof sessionSchema>
