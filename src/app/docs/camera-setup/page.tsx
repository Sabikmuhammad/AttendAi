import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsCallout } from '@/components/docs/DocsCallout';

export default function CameraSetupPage() {
  return (
    <DocsArticle
      title="Camera Setup"
      subtitle="How classrooms connect camera sources so attendance starts automatically with class schedules."
    >
      <h2 id="camera-linking-model">Camera Linking Model</h2>
      <p>
        Each classroom camera is linked to a class schedule. When the scheduled session starts,
        AttendAI activates that classroom camera and begins attendance detection automatically.
      </p>

      <h2 id="camera-mapping-flow">Camera Mapping Flow</h2>
      <pre>
        <code>{`Create class schedule
-> Assign classroom
-> Select camera source
-> Validate camera availability
-> Start automated attendance`}</code>
      </pre>

      <DocsCallout>
        AttendAI supports both laptop webcams for development and classroom CCTV cameras for
        production environments.
      </DocsCallout>
    </DocsArticle>
  );
}
