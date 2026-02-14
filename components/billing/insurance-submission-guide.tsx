import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function InsuranceSubmissionGuide() {
  return (
    <Card className="border-primary-100 bg-gradient-to-br from-primary-50/40 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-lg">How to Submit Your Superbill</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          As an out-of-network practice, Foundation Health provides superbills
          so you can submit claims to your insurance for reimbursement. Most
          patients recover 60-80% of their costs through this process.
        </p>

        {/* Steps */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Download Your Superbill
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Download the superbill PDF from the detail page. This document
                contains all necessary codes and charges for your insurance claim.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Contact Your Insurance
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Call the member services number on the back of your insurance card
                or log into your insurance portal. Ask about the out-of-network
                claim submission process for your plan.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Submit the Claim
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Complete your insurance company&apos;s out-of-network claim form
                (often a CMS-1500 or equivalent). Attach the superbill and any
                required supporting documents, then submit via mail, fax, or
                your insurer&apos;s online portal.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
              4
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Track Your Reimbursement
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Processing typically takes 2-6 weeks. You can track the status
                through your insurance portal or by calling member services.
                You will receive an Explanation of Benefits (EOB) once processed.
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-lg bg-amber-50/80 border border-amber-200/60 p-4 mt-4">
          <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Tips for Maximizing Reimbursement
          </h4>
          <ul className="space-y-1.5 text-xs text-amber-800">
            <li className="flex items-start gap-1.5">
              <span className="text-amber-500 mt-0.5 shrink-0">--</span>
              Submit claims promptly; most insurers have a filing deadline
              (typically 90-180 days from the date of service).
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-500 mt-0.5 shrink-0">--</span>
              Check if your plan has already met the out-of-network deductible
              for the year.
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-500 mt-0.5 shrink-0">--</span>
              Keep copies of everything you submit and note the confirmation
              number or tracking information.
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-500 mt-0.5 shrink-0">--</span>
              If denied, you have the right to appeal. Contact our billing team
              for assistance with appeals.
            </li>
          </ul>
        </div>

        {/* Common Contact Methods */}
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Common Insurance Contact Methods
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <div>
                <p className="text-xs font-medium text-gray-700">Phone</p>
                <p className="text-[10px] text-gray-400">Back of insurance card</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <div>
                <p className="text-xs font-medium text-gray-700">Online Portal</p>
                <p className="text-[10px] text-gray-400">Insurer website</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-xs font-medium text-gray-700">Mail</p>
                <p className="text-[10px] text-gray-400">Claims address on EOB</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
