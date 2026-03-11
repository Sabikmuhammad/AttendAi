'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  daily: { date: string; attendance: number }[];
  weekly: { week: string; attendance: number }[];
  departmentWise: { department: string; rate: number }[];
  classWise: { className: string; rate: number }[];
}

export default function SystemAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  // Mock data - in production, fetch from API
  const mockData: AnalyticsData = {
    daily: [
      { date: 'Mon', attendance: 85 },
      { date: 'Tue', attendance: 92 },
      { date: 'Wed', attendance: 78 },
      { date: 'Thu', attendance: 88 },
      { date: 'Fri', attendance: 95 },
      { date: 'Sat', attendance: 82 },
      { date: 'Sun', attendance: 70 },
    ],
    weekly: [
      { week: 'Week 1', attendance: 85 },
      { week: 'Week 2', attendance: 88 },
      { week: 'Week 3', attendance: 82 },
      { week: 'Week 4', attendance: 90 },
    ],
    departmentWise: [
      { department: 'Computer Science', rate: 92 },
      { department: 'Electronics', rate: 88 },
      { department: 'Mechanical', rate: 85 },
      { department: 'Civil', rate: 80 },
      { department: 'Electrical', rate: 86 },
    ],
    classWise: [
      { className: 'Machine Learning', rate: 95 },
      { className: 'Data Structures', rate: 88 },
      { className: 'Operating Systems', rate: 82 },
      { className: 'Computer Networks', rate: 90 },
      { className: 'Database Systems', rate: 87 },
    ],
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 500);
  }, []);

  const currentData = timeRange === 'week' ? mockData.daily : mockData.weekly;
  const avgAttendance = currentData.reduce((sum, d) => sum + d.attendance, 0) / currentData.length;
  const trend = currentData[currentData.length - 1].attendance > currentData[0].attendance ? 'up' : 'down';
  const trendPercent = Math.abs(
    ((currentData[currentData.length - 1].attendance - currentData[0].attendance) /
      currentData[0].attendance) *
      100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600 mt-1">Attendance trends and insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            className={timeRange === 'week' ? 'bg-purple-600' : ''}
          >
            This Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            onClick={() => setTimeRange('month')}
            className={timeRange === 'month' ? 'bg-purple-600' : ''}
          >
            This Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            onClick={() => setTimeRange('year')}
            className={timeRange === 'year' ? 'bg-purple-600' : ''}
          >
            This Year
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Attendance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {avgAttendance.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trend</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">{trendPercent}%</p>
                {trend === 'up' ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                trend === 'up' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {currentData.length * 10}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Daily/Weekly Attendance Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {timeRange === 'week' ? 'Daily' : 'Weekly'} Attendance Trend
        </h2>
        <div className="space-y-4">
          {currentData.map((item, index) => {
            const key = 'date' in item ? item.date : item.week;
            const value = item.attendance;
            const maxValue = Math.max(...currentData.map((d) => d.attendance));
            const widthPercent = (value / maxValue) * 100;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700">{key}</div>
                <div className="flex-1 relative">
                  <div className="w-full h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg transition-all duration-500 flex items-center justify-end px-3"
                      style={{ width: `${widthPercent}%` }}
                    >
                      <span className="text-white font-semibold text-sm">
                        {value}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Department-wise Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Department-wise Attendance
          </h2>
          <div className="space-y-4">
            {mockData.departmentWise.map((dept, index) => {
              const maxRate = Math.max(...mockData.departmentWise.map((d) => d.rate));
              const widthPercent = (dept.rate / maxRate) * 100;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{dept.department}</span>
                    <span className="text-gray-600">{dept.rate}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.rate >= 90
                          ? 'bg-green-500'
                          : dept.rate >= 80
                          ? 'bg-blue-500'
                          : dept.rate >= 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Class-wise Analysis */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Top Classes by Attendance
          </h2>
          <div className="space-y-4">
            {mockData.classWise
              .sort((a, b) => b.rate - a.rate)
              .map((cls, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{cls.className}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{cls.rate}%</span>
                    <div
                      className={`w-20 h-2 rounded-full ${
                        cls.rate >= 90
                          ? 'bg-green-500'
                          : cls.rate >= 80
                          ? 'bg-blue-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${(cls.rate / 100) * 80}px` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Attendance Performance Distribution
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">45%</div>
            <div className="text-sm text-gray-600 mt-1">Excellent (≥90%)</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">30%</div>
            <div className="text-sm text-gray-600 mt-1">Good (80-89%)</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">20%</div>
            <div className="text-sm text-gray-600 mt-1">Average (70-79%)</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">5%</div>
            <div className="text-sm text-gray-600 mt-1">Poor (&lt;70%)</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
