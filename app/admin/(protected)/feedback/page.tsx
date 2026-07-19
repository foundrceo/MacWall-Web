import { AdminShell } from "@/components/admin/admin-shell"
import { FeedbackPanel } from "@/components/admin/feedback-panel"

export default function AdminFeedbackPage() {
  return (
    <AdminShell
      title="Feedback"
      description="In-app messages from MacWall users — what they love, what's off, and ideas. Captured in real time."
    >
      <FeedbackPanel />
    </AdminShell>
  )
}
