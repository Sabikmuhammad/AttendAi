import { DocsArticle } from '@/components/docs/DocsArticle';

export default function StudentGuidePage() {
  return (
    <DocsArticle
      title="Student Guide"
      subtitle="How students track attendance records, percentages, and class history in AttendAI."
    >
      <h2 id="viewing-attendance-records">Viewing Attendance Records</h2>
      <p>
        Students can view attendance records by subject and session, including present/absent
        outcomes tied to each class event.
      </p>

      <h2 id="tracking-attendance-percentage">Tracking Attendance Percentage</h2>
      <p>
        The dashboard continuously updates attendance percentage so students can monitor
        consistency and improve before threshold risks appear.
      </p>

      <h2 id="reviewing-class-history">Reviewing Class History</h2>
      <p>
        Students can inspect class history for trends, verify attendance continuity over time, and
        raise corrections with faculty when records appear incorrect.
      </p>
    </DocsArticle>
  );
}
