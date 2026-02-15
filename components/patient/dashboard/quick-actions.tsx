import Link from 'next/link'
import {
  CalendarPlus,
  Video,
  Shield,
  Receipt,
  FolderOpen,
  Phone,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'

interface QuickActionItem {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  iconBgClass: string
  iconTextClass: string
}

const quickActions: QuickActionItem[] = [
  {
    href: '/patient/appointments/book',
    icon: <CalendarPlus className="h-5 w-5" />,
    label: 'Book Appointment',
    description: 'Schedule a visit',
    iconBgClass: 'bg-amber-100',
    iconTextClass: 'text-amber-600',
  },
  {
    href: '/patient/appointments/book',
    icon: <Video className="h-5 w-5" />,
    label: 'Telemedicine',
    description: 'Request virtual visit',
    iconBgClass: 'bg-violet-100',
    iconTextClass: 'text-violet-600',
  },
  {
    href: '/patient/insurance',
    icon: <Shield className="h-5 w-5" />,
    label: 'View Insurance',
    description: 'Coverage details',
    iconBgClass: 'bg-blue-100',
    iconTextClass: 'text-blue-600',
  },
  {
    href: '/patient/billing/payments',
    icon: <Receipt className="h-5 w-5" />,
    label: 'Submit Claim',
    description: 'Insurance claims',
    iconBgClass: 'bg-emerald-100',
    iconTextClass: 'text-emerald-600',
  },
  {
    href: '/patient/records',
    icon: <FolderOpen className="h-5 w-5" />,
    label: 'View Records',
    description: 'Health records',
    iconBgClass: 'bg-teal-100',
    iconTextClass: 'text-teal-600',
  },
  {
    href: '/patient/travel/concierge',
    icon: <Phone className="h-5 w-5" />,
    label: 'Contact Concierge',
    description: 'Get assistance',
    iconBgClass: 'bg-rose-100',
    iconTextClass: 'text-rose-600',
  },
]

export function QuickActions() {
  return (
    <Card
      id={elementId('dashboard', 'quick', 'actions')}
      className="border-0 shadow-md"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-900">
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-4 text-center transition-all hover:border-amber-200 hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.iconBgClass} ${action.iconTextClass} transition-transform group-hover:scale-110`}
              >
                {action.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {action.label}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
