import { DocsArticle } from '@/components/docs/DocsArticle';

export default function SecurityPage() {
  return (
    <DocsArticle
      title="Security & Privacy"
      subtitle="How AttendAI protects user identity, institution boundaries, and attendance integrity."
    >
      <h2 id="security-pillars">Security Pillars</h2>
      <ul>
        <li>Secure authentication and session handling</li>
        <li>Encrypted connections for platform traffic</li>
        <li>Role-based access control across product areas</li>
        <li>Institution-level data isolation for multi-tenant safety</li>
      </ul>

      <h2 id="access-control">Access Control</h2>
      <p>
        AttendAI enforces role-aware route and data access so admin, faculty, and student users only
        see workflows and records relevant to their permissions.
      </p>

      <h2 id="data-isolation">Data Isolation</h2>
      <p>
        Institutional tenancy boundaries are applied in core data queries, reducing risk of
        cross-organization data exposure.
      </p>

      <h2 id="privacy-operations">Privacy Operations</h2>
      <p>
        Institutions should define policies for attendance review, correction handling, and retention
        governance aligned with local compliance requirements.
      </p>

      <h2 id="recommended-practices">Recommended Practices</h2>
      <ul>
        <li>Use strong credential policies for privileged roles</li>
        <li>Audit attendance exceptions weekly</li>
        <li>Rotate secrets and environment keys periodically</li>
        <li>Restrict camera infrastructure to trusted networks</li>
      </ul>
    </DocsArticle>
  );
}
