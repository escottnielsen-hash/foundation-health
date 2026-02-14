'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import {
  QPA_REFERENCE_DATA,
  QPA_CATEGORIES,
  getFoundationChargeCents,
} from '@/lib/data/qpa-reference'
import type { QpaReference } from '@/lib/data/qpa-reference'
import {
  useCalculatorStore,
  type SelectedProcedure,
} from '@/lib/stores/calculator-store'
import { elementId, inputId, btnId } from '@/lib/utils/element-ids'
import {
  Search,
  Plus,
  X,
  ChevronRight,
  Stethoscope,
  Filter,
} from 'lucide-react'

// ============================================
// Category badge color mapping
// ============================================

const CATEGORY_COLORS: Record<QpaReference['category'], string> = {
  surgical: 'bg-red-100 text-red-700',
  diagnostic: 'bg-blue-100 text-blue-700',
  therapeutic: 'bg-emerald-100 text-emerald-700',
  evaluation: 'bg-purple-100 text-purple-700',
  injection: 'bg-amber-100 text-amber-700',
}

// ============================================
// ProcedureSelector Component
// ============================================

export function ProcedureSelector() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<
    QpaReference['category'] | 'all'
  >('all')

  const {
    selectedProcedures,
    addProcedure,
    removeProcedure,
    nextStep,
  } = useCalculatorStore()

  // Filter and search procedures
  const filteredProcedures = useMemo(() => {
    let results = QPA_REFERENCE_DATA

    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter((ref) => ref.category === selectedCategory)
    }

    // Apply search filter
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim()
      results = results.filter(
        (ref) =>
          ref.cptCode.toLowerCase().includes(query) ||
          ref.description.toLowerCase().includes(query)
      )
    }

    return results
  }, [searchQuery, selectedCategory])

  const isSelected = (cptCode: string) =>
    selectedProcedures.some((p) => p.cptCode === cptCode)

  const handleAddProcedure = (ref: QpaReference) => {
    const proc: SelectedProcedure = {
      cptCode: ref.cptCode,
      description: ref.description,
      chargeAmountCents: getFoundationChargeCents(ref),
      qpaAmountCents: ref.qpaAmountCents,
    }
    addProcedure(proc)
  }

  const totalCharge = selectedProcedures.reduce(
    (sum, p) => sum + p.chargeAmountCents,
    0
  )

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id={inputId('procedure-search')}
            type="text"
            placeholder="Search by CPT code or procedure name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-3 w-3" />
            All Categories
          </button>
          {QPA_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-gray-900 text-white'
                  : `${CATEGORY_COLORS[cat.value]} hover:opacity-80`
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Procedures Summary */}
      {selectedProcedures.length > 0 && (
        <Card className="border-primary-200 bg-primary-50/50">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Selected Procedures ({selectedProcedures.length})
              </h3>
              <span className="text-sm font-bold text-gray-900">
                Total: {formatCurrency(totalCharge)}
              </span>
            </div>
            <div className="space-y-2">
              {selectedProcedures.map((proc) => (
                <div
                  key={proc.cptCode}
                  id={elementId('calculator', 'selected', proc.cptCode)}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {proc.cptCode}
                    </Badge>
                    <span className="text-gray-700">{proc.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(proc.chargeAmountCents)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProcedure(proc.cptCode)}
                      className="rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${proc.description}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Procedure List */}
      <div className="space-y-2">
        {filteredProcedures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Stethoscope className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              No procedures found matching your search.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        ) : (
          filteredProcedures.map((ref) => {
            const chargeCents = getFoundationChargeCents(ref)
            const selected = isSelected(ref.cptCode)

            return (
              <div
                key={ref.cptCode}
                id={elementId('calculator', 'procedure', ref.cptCode)}
                className={`group flex items-center justify-between rounded-lg border p-4 transition-all ${
                  selected
                    ? 'border-primary-300 bg-primary-50/50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono shrink-0"
                    >
                      {ref.cptCode}
                    </Badge>
                    <span
                      className={`text-xs font-medium rounded-full px-2 py-0.5 ${CATEGORY_COLORS[ref.category]}`}
                    >
                      {ref.category}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-gray-900">
                    {ref.description}
                  </p>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                    <span>QPA: {formatCurrency(ref.qpaAmountCents)}</span>
                    <span className="text-gray-300">|</span>
                    <span>
                      Our Charge: {formatCurrency(chargeCents)}{' '}
                      <span className="text-gray-400">
                        ({ref.foundationMultiplier}x QPA)
                      </span>
                    </span>
                  </div>
                </div>
                <div className="ml-4 shrink-0">
                  {selected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProcedure(ref.cptCode)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddProcedure(ref)}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Next Step Button */}
      <div className="flex justify-end pt-4">
        <Button
          id={btnId('next', 'insurance-details')}
          onClick={nextStep}
          disabled={selectedProcedures.length === 0}
        >
          Enter Insurance Details
          <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
