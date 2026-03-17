import { DocsArticle } from '@/components/docs/DocsArticle';

export default function FacultyGuidePage() {
  return (
    <DocsArticle
      title="Faculty Guide"
      subtitle="How faculty members use AttendAI to monitor classes and confirm attendance outcomes."
    >
      <h2 id="viewing-assigned-classes">Viewing Assigned Classes</h2>
      <p>
        Faculty dashboards surface all assigned classes with schedule context, room details, and
        expected enrollment so instructors can prepare before each session.
      </p>

      <h2 id="monitoring-attendance">Monitoring Attendance</h2>
      <p>
        During class, faculty can monitor attendance progression in real time, identify missing
        students, and confirm that capture is running correctly.
      </p>

      <h2 id="reviewing-attendance-reports">Reviewing Attendance Reports</h2>
      <p>
        After class, faculty review class-level attendance summaries, verify anomalies, and
        coordinate with administration where policy-driven adjustments are required.
      </p>
    </DocsArticle>
  );
}
