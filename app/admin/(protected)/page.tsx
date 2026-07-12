import { AdminShell } from "@/components/admin/admin-shell"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Analytics"
      description="First-party website events, download funnel, and catalog health."
    >
      <AnalyticsDashboard />
    </AdminShell>
  )
}
