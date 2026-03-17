import { DocsArticle } from '@/components/docs/DocsArticle';

export default function AdminGuidePage() {
  return (
    <DocsArticle
      title="Admin Guide"
      subtitle="How administrators run AttendAI at institution scale: setup, operations, and analytics."
    >
      <h2 id="admin-capabilities">Admin Capabilities</h2>
      <ul>
        <li>Create and manage institution-wide academic structure</li>
        <li>Register and govern faculty and student user accounts</li>
        <li>Create classes, schedules, and classroom mappings</li>
        <li>Configure camera workflows for AI attendance capture</li>
        <li>Monitor analytics and operational attendance health</li>
      </ul>

      <h2 id="daily-admin-workflow">Daily Admin Workflow</h2>
      <ul>
        <li>Review active classes and expected attendance windows</li>
        <li>Check camera and monitoring health at session start</li>
        <li>Resolve exceptions for unmatched or missing records</li>
        <li>Export reports and share updates with stakeholders</li>
      </ul>

      <h2 id="operations-best-practices">Operations Best Practices</h2>
      <ul>
        <li>Keep rosters current before class start to avoid misalignment</li>
        <li>Validate classroom camera availability each day</li>
        <li>Audit attendance exceptions as a weekly governance ritual</li>
      </ul>
    </DocsArticle>
  );
}
