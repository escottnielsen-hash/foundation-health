import type { DiagnosisCodeEntry, ProcedureCodeEntry } from '@/types/database'

// ============================================
// Diagnosis Codes Section
// ============================================

interface DiagnosisCodesProps {
  codes: DiagnosisCodeEntry[]
}

export function DiagnosisCodes({ codes }: DiagnosisCodesProps) {
  if (codes.length === 0) {
    return (
      <div className="py-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Diagnosis Codes (ICD-10)
        </h3>
        <p className="text-sm text-gray-400 italic">No diagnosis codes recorded</p>
      </div>
    )
  }

  return (
    <div className="py-4">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
        Diagnosis Codes (ICD-10)
      </h3>
      <div className="space-y-2">
        {codes.map((entry, index) => (
          <div
            key={`dx-${index}`}
            className="flex items-start gap-3 py-2 px-3 rounded-lg bg-gray-50/80"
          >
            <span className="text-xs font-mono font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md shrink-0">
              {entry.code}
            </span>
            <span className="text-sm text-gray-700">
              {entry.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Procedure Codes Section
// ============================================

interface ProcedureCodesProps {
  codes: ProcedureCodeEntry[]
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function ProcedureCodes({ codes }: ProcedureCodesProps) {
  if (codes.length === 0) {
    return (
      <div className="py-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
          Procedure Codes (CPT)
        </h3>
        <p className="text-sm text-gray-400 italic">No procedure codes recorded</p>
      </div>
    )
  }

  return (
    <div className="py-4">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
        Procedure Codes (CPT)
      </h3>

      {/* Header row */}
      <div className="grid grid-cols-12 gap-2 px-3 pb-2 border-b border-gray-200">
        <div className="col-span-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Code
        </div>
        <div className="col-span-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Mod
        </div>
        <div className="col-span-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Description
        </div>
        <div className="col-span-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">
          Charge
        </div>
      </div>

      {/* Code rows */}
      <div className="divide-y divide-gray-100">
        {codes.map((entry, index) => (
          <div
            key={`cpt-${index}`}
            className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center"
          >
            <div className="col-span-2">
              <span className="text-xs font-mono font-semibold text-gray-900">
                {entry.code}
              </span>
            </div>
            <div className="col-span-1">
              {entry.modifier ? (
                <span className="text-xs font-mono text-gray-500">
                  {entry.modifier}
                </span>
              ) : (
                <span className="text-xs text-gray-300">&mdash;</span>
              )}
            </div>
            <div className="col-span-6">
              <span className="text-sm text-gray-700">
                {entry.description}
              </span>
            </div>
            <div className="col-span-3 text-right">
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(entry.charge_cents)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
