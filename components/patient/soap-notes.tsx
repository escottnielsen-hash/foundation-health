import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface SoapNotesProps {
  chiefComplaint: string | null
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  visitNotes: string | null
}

interface SoapSectionProps {
  letter: string
  title: string
  content: string | null
  accentColor: string
}

function SoapSection({ letter, title, content, accentColor }: SoapSectionProps) {
  if (!content) return null

  return (
    <div className="flex gap-4">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white ${accentColor}`}
      >
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">{title}</h4>
        <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  )
}

export function SoapNotes({
  chiefComplaint,
  subjective,
  objective,
  assessment,
  plan,
  visitNotes,
}: SoapNotesProps) {
  const hasSoapContent = subjective || objective || assessment || plan
  const hasAnyContent = hasSoapContent || chiefComplaint || visitNotes

  if (!hasAnyContent) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 text-sm">
            No clinical notes have been recorded for this encounter.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Chief Complaint */}
      {chiefComplaint && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Chief Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{chiefComplaint}</p>
          </CardContent>
        </Card>
      )}

      {/* SOAP Notes */}
      {hasSoapContent && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SOAP Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <SoapSection
              letter="S"
              title="Subjective"
              content={subjective}
              accentColor="bg-blue-500"
            />
            {subjective && objective && <Separator />}
            <SoapSection
              letter="O"
              title="Objective"
              content={objective}
              accentColor="bg-emerald-500"
            />
            {(subjective || objective) && assessment && <Separator />}
            <SoapSection
              letter="A"
              title="Assessment"
              content={assessment}
              accentColor="bg-amber-500"
            />
            {(subjective || objective || assessment) && plan && <Separator />}
            <SoapSection
              letter="P"
              title="Plan"
              content={plan}
              accentColor="bg-purple-500"
            />
          </CardContent>
        </Card>
      )}

      {/* General Visit Notes */}
      {visitNotes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {visitNotes}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
