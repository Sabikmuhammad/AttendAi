import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import { Card } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-cookies';
import { verifyAccessToken } from '@/lib/jwt';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect('/login');
  }

  let institutionId: string;
  try {
    const payload = await verifyAccessToken(accessToken);
    institutionId = payload.institutionId;
  } catch {
    redirect('/login');
  }

  // Connect to database and fetch stats
  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalStudents, totalClasses, todayClasses, attendanceRecords] = await Promise.all([
    Student.countDocuments({ institutionId }),
    Class.countDocuments({ institutionId }),
    Class.countDocuments({
      institutionId,
      startTime: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
    Attendance.countDocuments({ institutionId }),
  ]);

  // Calculate attendance percentage properly
  // Get total expected attendance (sum of enrolled students per class)
  const allClasses = await Class.find({ institutionId }).select('studentIds').lean();
  const totalExpectedAttendance = allClasses.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0);
  
  const attendancePercentage = totalExpectedAttendance > 0
    ? ((attendanceRecords / totalExpectedAttendance) * 100).toFixed(1)
    : '0.0';

  // Get recent classes
  const recentClasses = await Class.find({ institutionId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('studentIds', 'name registerNumber')
    .lean();

  // Get active classes today
  const activeClasses = await Class.find({
    institutionId,
    startTime: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
    status: 'active',
  }).lean();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Active Classes</h2>
          <div className="space-y-2 sm:space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {activeClasses.map((cls: any) => (
              <div
                key={cls._id.toString()}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 hover:border-green-300 transition-colors gap-2 sm:gap-0"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{cls.courseName}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {cls.classroomNumber} • {cls.facultyName}
                  </p>
                </div>
                <span className="px-3 sm:px-4 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1.5 w-fit">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Classes */}
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Classes</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Course
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">
                  Classroom
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">
                  Faculty
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap hidden lg:table-cell">
                  Start Time
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentClasses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                    No classes found
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentClasses.map((cls: any) => (
                  <tr key={cls._id.toString()} className="hover:bg-gray-50">
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-900">
                      <div className="font-medium">{cls.courseName}</div>
                      <div className="sm:hidden text-gray-600 text-xs mt-1">
                        {cls.classroomNumber}
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                      {cls.classroomNumber}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                      {cls.facultyName}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                      {new Date(cls.startTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <StatusBadge status={cls.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          </div>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 sm:p-4 rounded-xl flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
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
