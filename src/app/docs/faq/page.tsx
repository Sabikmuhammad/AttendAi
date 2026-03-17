import { DocsArticle } from '@/components/docs/DocsArticle';

export default function FAQPage() {
  return (
    <DocsArticle
      title="FAQ"
      subtitle="Common institution-level questions about operations, reliability, and privacy in AttendAI."
    >
      <h2 id="how-is-attendance-detected">How is attendance detected?</h2>
      <p>
        AttendAI activates camera workflows for scheduled classes, detects faces, recognizes enrolled
        students, and records attendance automatically.
      </p>

      <h2 id="what-happens-if-faculty-is-absent">What happens if faculty is absent?</h2>
      <p>
        Admin teams can review class outcomes, pause or adjust sessions, and apply institutional
        policy for final attendance handling.
      </p>

      <h2 id="can-multiple-institutions-use-the-platform">Can multiple institutions use the platform?</h2>
      <p>
        Yes. AttendAI supports multi-institution architecture with institution-scoped access and data
        boundaries.
      </p>

      <h2 id="is-student-data-secure">Is student data secure?</h2>
      <p>
        The platform applies secure authentication, encrypted connections, role-based controls, and
        institution data isolation.
      </p>

      <h2 id="can-we-start-without-cctv">Can we start without CCTV?</h2>
      <p>
        Yes. Institutions can pilot with browser camera mode and move to classroom CCTV in
        production.
      </p>

      <h2 id="how-do-we-handle-camera-failures">How do we handle camera failures?</h2>
      <p>
        Admin and faculty teams should keep fallback procedures, monitor live status, and review
        exceptions in operational dashboards.
      </p>
    </DocsArticle>
  );
}
