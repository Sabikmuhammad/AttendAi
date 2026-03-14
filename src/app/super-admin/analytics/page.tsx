import { Card } from '@/components/ui/card';

export default function SuperAdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-600">Cross-institution usage and health metrics</p>
      </div>
      <Card className="p-6">
        <p className="text-gray-600">Analytics dashboard scaffolded for multi-tenant insights.</p>
      </Card>
    </div>
  );
}
