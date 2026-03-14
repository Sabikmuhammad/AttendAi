/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * Admin Live Feed Page
 * 
 * Route: /admin/live-feed
 * 
 * Multi-class video monitoring dashboard for administrators.
 * View live feeds from multiple classrooms simultaneously.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Users, Eye, RefreshCw, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface ActiveMonitor {
  class_id: string;
  course_name: string;
  monitoring_active: boolean;
  students_present: number;
  total_students: number;
  attendance_rate: number;
  mode: string;
  class_status: string;
}

export default function AdminLiveFeedPage() {
  const [activeMonitors, setActiveMonitors] = useState<ActiveMonitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchActiveMonitors();
    const interval = setInterval(fetchActiveMonitors, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveMonitors = async () => {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/monitor/active`);
      if (response.ok) {
        const data = await response.json();
        setActiveMonitors(data.active_monitors || []);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch active monitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading active monitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Feed Monitor</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of all active classroom sessions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchActiveMonitors}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/admin/camera">
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Camera Control
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-purple-600">
                  {activeMonitors.length}
                </p>
              </div>
              <Camera className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">
                  {activeMonitors.reduce((sum, m) => sum + m.total_students, 0)}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600">
                  {activeMonitors.reduce((sum, m) => sum + m.students_present, 0)}
                </p>
              </div>
              <Users className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Attendance</p>
                <p className="text-3xl font-bold text-orange-600">
                  {activeMonitors.length > 0
                    ? (activeMonitors.reduce((sum, m) => sum + m.attendance_rate, 0) / activeMonitors.length).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Monitors Grid */}
      {activeMonitors.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Active Monitoring Sessions
              </h3>
              <p className="text-gray-600 mb-6">
                Start monitoring a class from the Camera Control page
              </p>
              <Link href="/admin/camera">
                <Button>
                  <Camera className="w-4 h-4 mr-2" />
                  Go to Camera Control
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeMonitors.map((monitor) => (
            <Card key={monitor.class_id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{monitor.course_name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">ID: {monitor.class_id.slice(-8)}</p>
                  </div>
                  <Badge className={getStatusColor(monitor.class_status)}>
                    {monitor.class_status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-4">
                {/* Video Feed Preview */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <img
                    src={`${AI_SERVICE_URL}/stream/video/${monitor.class_id}`}
                    alt={`Live feed for ${monitor.course_name}`}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2">
                    <div className="flex items-center gap-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  {/* Attendance Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Attendance</span>
                      <span className="font-semibold text-purple-600">
                        {monitor.students_present}/{monitor.total_students}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${monitor.attendance_rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {monitor.attendance_rate.toFixed(1)}% present
                    </p>
                  </div>

                  {/* Mode Badge */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Mode</span>
                    <Badge variant="outline" className="text-xs">
                      {monitor.mode}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <Link href={`/admin/camera?class=${monitor.class_id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Feed
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Last Update Info */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
        <span className="mx-2">•</span>
        Auto-refreshing every 5 seconds
      </div>
    </div>
  );
}
