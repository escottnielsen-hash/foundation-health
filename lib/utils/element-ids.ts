/**
 * Generate consistent element IDs following the pattern:
 * {page}-{component}-{element}-{identifier}
 *
 * @example
 * elementId('dashboard', 'header', 'title') => 'dashboard-header-title'
 * elementId('settings', 'module', 'card', 'health') => 'settings-module-card-health'
 */
export function elementId(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map(part => part.toLowerCase().replace(/\s+/g, '-'))
    .join('-')
}

/**
 * Button ID helper
 * @example btnId('connect', 'google') => 'btn-connect-google'
 */
export function btnId(action: string, target?: string): string {
  return target ? `btn-${action}-${target}` : `btn-${action}`
}

/**
 * Input ID helper
 * @example inputId('email') => 'input-email'
 */
export function inputId(field: string): string {
  return `input-${field}`
}

/**
 * Modal ID helper
 * @example modalId('confirm-delete') => 'modal-confirm-delete'
 */
export function modalId(name: string): string {
  return `modal-${name}`
}

/**
 * Form ID helper
 * @example formId('login') => 'form-login'
 */
export function formId(name: string): string {
  return `form-${name}`
}
