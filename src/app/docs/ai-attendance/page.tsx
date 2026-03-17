import { DocsArticle } from '@/components/docs/DocsArticle';
import { Card } from '@/components/ui/card';
import { DocsCallout } from '@/components/docs/DocsCallout';

export default function AIAttendancePage() {
  return (
    <DocsArticle
      title="AI Attendance System"
      subtitle="A simple explanation of how AttendAI converts classroom activity into automatic attendance records."
    >
      <h2 id="ai-workflow">AI Workflow</h2>
      <div className="not-prose">
        <Card className="rounded-2xl border-zinc-200 bg-white/95 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <ol className="space-y-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <li>Class Start Time</li>
            <li className="pl-1 text-zinc-500 dark:text-zinc-400">↓</li>
            <li>Camera Activation</li>
            <li className="pl-1 text-zinc-500 dark:text-zinc-400">↓</li>
            <li>Face Detection</li>
            <li className="pl-1 text-zinc-500 dark:text-zinc-400">↓</li>
            <li>Face Recognition</li>
            <li className="pl-1 text-zinc-500 dark:text-zinc-400">↓</li>
            <li>Attendance Recorded</li>
          </ol>
        </Card>
      </div>

      <h2 id="what-happens-in-practice">What Happens In Practice</h2>
      <p>
        AttendAI uses class context, enrolled students, and camera input to detect and identify
        students while preventing duplicate attendance records for the same class session.
      </p>

      <DocsCallout>
        Webcams are used in development environments, while classroom CCTV cameras are used in
        production deployments.
      </DocsCallout>
    </DocsArticle>
  );
}
