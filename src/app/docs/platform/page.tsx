import { DocsArticle } from '@/components/docs/DocsArticle';

export default function PlatformPage() {
  return (
    <DocsArticle
      title="Platform Overview"
      subtitle="A product-level view of how AttendAI handles institutions, roles, classes, and attendance outcomes."
    >
      <h2 id="core-modules">Core Modules</h2>
      <ul>
        <li>Institution and tenant-aware data management</li>
        <li>Admin, faculty, and student role experiences</li>
        <li>Class lifecycle management with status synchronization</li>
        <li>AI-assisted recognition and attendance marking workflows</li>
        <li>Live monitoring and operational dashboards</li>
      </ul>

      <h2 id="role-model">Role Model</h2>
      <h3 id="admin-role">Admin</h3>
      <p>
        Admins control institution setup, user registration, class creation, room assignments, and
        attendance performance monitoring.
      </p>

      <h3 id="faculty-role">Faculty</h3>
      <p>
        Faculty users track assigned classes, observe live attendance progress, and review class
        outcomes after sessions.
      </p>

      <h3 id="student-role">Student</h3>
      <p>
        Students monitor their attendance records, class history, and consistency percentage through
        a focused dashboard.
      </p>

      <h2 id="class-lifecycle">Class Lifecycle</h2>
      <pre>
        <code>{`Scheduled -> Active -> Completed`}</code>
      </pre>
      <p>
        AttendAI keeps class state aligned with class timing windows so the dashboard and class views
        stay consistent for operations teams.
      </p>

      <h2 id="attendance-output">Attendance Output</h2>
      <p>
        Attendance records include class context, student context, timestamped detection, and status
        for audit-ready reporting.
      </p>
    </DocsArticle>
  );
}
