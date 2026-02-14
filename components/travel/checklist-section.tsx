'use client'

import { useChecklistStore } from '@/lib/stores/checklist-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, RotateCcw, FileText, Stethoscope, Plane, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ============================================
// Category icon map
// ============================================

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  documents: FileText,
  medical: Stethoscope,
  travel: Plane,
  'post-op': Heart,
}

// ============================================
// Checklist Item Component
// ============================================

function ChecklistItemRow({
  categoryId,
  item,
}: {
  categoryId: string
  item: { id: string; label: string; checked: boolean }
}) {
  const toggleItem = useChecklistStore((state) => state.toggleItem)

  return (
    <button
      type="button"
      onClick={() => toggleItem(categoryId, item.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50',
        item.checked && 'bg-green-50/50 hover:bg-green-50/70'
      )}
    >
      {item.checked ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
      ) : (
        <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300" />
      )}
      <span
        className={cn(
          'text-sm leading-relaxed',
          item.checked ? 'text-gray-500 line-through' : 'text-gray-700'
        )}
      >
        {item.label}
      </span>
    </button>
  )
}

// ============================================
// Checklist Category Section
// ============================================

function ChecklistCategorySection({
  category,
}: {
  category: { id: string; title: string; description: string; items: { id: string; label: string; checked: boolean }[] }
}) {
  const Icon = categoryIcons[category.id] ?? FileText
  const completedCount = category.items.filter((i) => i.checked).length
  const totalCount = category.items.length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <Icon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">{category.title}</CardTitle>
              <CardDescription className="text-xs">
                {category.description}
              </CardDescription>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0.5">
          {category.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              categoryId={category.id}
              item={item}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Main Checklist Component
// ============================================

export function ChecklistSection() {
  const categories = useChecklistStore((state) => state.categories)
  const getProgress = useChecklistStore((state) => state.getProgress)
  const resetChecklist = useChecklistStore((state) => state.resetChecklist)

  const { completed, total, percentage } = getProgress()

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Progress
              </h3>
              <p className="text-sm text-gray-500">
                {completed} of {total} items completed
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-amber-600">
                {percentage}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetChecklist}
                className="text-gray-400 hover:text-gray-600"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
          <Progress value={percentage} className="mt-4" />
          {percentage === 100 && (
            <div className="mt-4 rounded-lg bg-green-50 p-3">
              <p className="text-sm font-medium text-green-800">
                You are all set for your visit. Our team looks forward to
                welcoming you to Foundation Health.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist categories */}
      <div className="space-y-5">
        {categories.map((category) => (
          <ChecklistCategorySection key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
