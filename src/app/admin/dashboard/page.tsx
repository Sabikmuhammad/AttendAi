import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import { Card } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Activity } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Authentication disabled - no auth checks

  // Connect to database and fetch stats
  await connectDB();

  const [totalStudents, totalClasses, todayClasses, attendanceRecords] = await Promise.all([
    Student.countDocuments(),
    Class.countDocuments(),
    Class.countDocuments({
      startTime: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
    Attendance.countDocuments(),
  ]);

  // Calculate attendance percentage properly
  // Get total expected attendance (sum of enrolled students per class)
  const allClasses = await Class.find().select('studentIds').lean();
  const totalExpectedAttendance = allClasses.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0);
  
  const attendancePercentage = totalExpectedAttendance > 0
    ? ((attendanceRecords / totalExpectedAttendance) * 100).toFixed(1)
    : '0.0';

  // Get recent classes
  const recentClasses = await Class.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('studentIds', 'name registerNumber')
    .lean();

  // Get active classes today
  const activeClasses = await Class.find({
    startTime: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
    status: 'active',
  }).lean();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Classes Today"
          value={todayClasses}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Attendance Records"
          value={attendanceRecords}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Active Classes */}
      {activeClasses.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Classes</h2>
          <div className="space-y-3">
            {activeClasses.map((cls: any) => (
              <div
                key={cls._id.toString()}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 hover:border-green-300 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{cls.courseName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {cls.classroomNumber} • {cls.facultyName}
                  </p>
                </div>
                <span className="px-4 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Classes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Classes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Course
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Classroom
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Faculty
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Start Time
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentClasses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No classes found
                  </td>
                </tr>
              ) : (
                recentClasses.map((cls: any) => (
                  <tr key={cls._id.toString()} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {cls.courseName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {cls.classroomNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {cls.facultyName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(cls.startTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={cls.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    green: 'bg-green-500/10 text-green-600',
    orange: 'bg-orange-500/10 text-orange-600',
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-4 rounded-xl`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || styles.scheduled}`}>
      {status.toUpperCase()}
    </span>
  );
}
