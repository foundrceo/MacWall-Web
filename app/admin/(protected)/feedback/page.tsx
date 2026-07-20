import { AdminShell } from "@/components/admin/admin-shell"
import { FeedbackPanel } from "@/components/admin/feedback-panel"

export default function AdminFeedbackPage() {
  return (
    <AdminShell
      title="Live Support"
      description="Support tickets and live chat from MacWall users — manage conversations, reply, and close requests."
    >
      <FeedbackPanel />
    </AdminShell>
  )
}
