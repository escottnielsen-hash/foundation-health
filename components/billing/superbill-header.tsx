import { Separator } from '@/components/ui/separator'

interface SuperbillHeaderProps {
  practiceName: string
  practiceNpi: string | null
  practiceTaxId: string | null
  practiceAddressLine1: string | null
  practiceAddressLine2: string | null
  practiceCity: string | null
  practiceState: string | null
  practiceZipCode: string | null
  practicePhone: string | null
}

export function SuperbillHeader({
  practiceName,
  practiceNpi,
  practiceTaxId,
  practiceAddressLine1,
  practiceAddressLine2,
  practiceCity,
  practiceState,
  practiceZipCode,
  practicePhone,
}: SuperbillHeaderProps) {
  const addressParts = [practiceCity, practiceState].filter(Boolean)
  const cityStateLine = addressParts.length > 0
    ? `${addressParts.join(', ')}${practiceZipCode ? ` ${practiceZipCode}` : ''}`
    : null

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {practiceName}
          </h2>
          {practiceAddressLine1 && (
            <p className="text-sm text-gray-500 mt-1">{practiceAddressLine1}</p>
          )}
          {practiceAddressLine2 && (
            <p className="text-sm text-gray-500">{practiceAddressLine2}</p>
          )}
          {cityStateLine && (
            <p className="text-sm text-gray-500">{cityStateLine}</p>
          )}
          {practicePhone && (
            <p className="text-sm text-gray-500 mt-0.5">{practicePhone}</p>
          )}
        </div>

        <div className="text-right text-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1 font-medium">
            Superbill
          </p>
          {practiceNpi && (
            <p className="text-gray-600">
              <span className="text-gray-400">NPI:</span>{' '}
              <span className="font-mono">{practiceNpi}</span>
            </p>
          )}
          {practiceTaxId && (
            <p className="text-gray-600">
              <span className="text-gray-400">Tax ID:</span>{' '}
              <span className="font-mono">{practiceTaxId}</span>
            </p>
          )}
        </div>
      </div>

      <Separator className="mt-4" />
    </div>
  )
}
