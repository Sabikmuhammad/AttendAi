'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Camera, Users, Plus, Edit, Trash2, Video } from 'lucide-react';
import Link from 'next/link';

interface Classroom {
  _id: string;
  name: string;
  roomNumber: string;
  building?: string;
  floor?: string;
  capacity?: number;
  hasCamera: boolean;
  cameraType: string;
  rtspUrl?: string;
  isActive: boolean;
  notes?: string;
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'camera' | 'no-camera'>('all');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/classrooms');
      const data = await response.json();
      
      if (data.success) {
        setClassrooms(data.classrooms);
      }
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete classroom "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/classrooms?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClassrooms();
      } else {
        alert('Failed to delete classroom');
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
      alert('Error deleting classroom');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getCameraIcon = (type: string) => {
    switch (type) {
      case 'cctv':
        return <Camera className="w-4 h-4" />;
      case 'webcam':
        return <Video className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCameraBadge = (type: string) => {
    switch (type) {
      case 'cctv':
        return <Badge className="bg-green-100 text-green-800">CCTV Auto</Badge>;
      case 'webcam':
        return <Badge className="bg-blue-100 text-blue-800">Webcam Manual</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">No Camera</Badge>;
    }
  };

  const filteredClassrooms = classrooms.filter(classroom => {
    if (filter === 'camera') return classroom.hasCamera;
    if (filter === 'no-camera') return !classroom.hasCamera;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classrooms</h1>
          <p className="text-gray-600 mt-2">
            Manage classroom locations and camera configurations
          </p>
        </div>
        <Link href="/admin/create-classroom">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Classroom
          </Button>
        </Link>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Classrooms</p>
                <p className="text-3xl font-bold text-purple-600">{classrooms.length}</p>
              </div>
              <Building className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With CCTV</p>
                <p className="text-3xl font-bold text-green-600">
                  {classrooms.filter(c => c.cameraType === 'cctv').length}
                </p>
              </div>
              <Camera className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Webcam</p>
                <p className="text-3xl font-bold text-blue-600">
                  {classrooms.filter(c => c.cameraType === 'webcam').length}
                </p>
              </div>
              <Video className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">No Camera</p>
                <p className="text-3xl font-bold text-gray-600">
                  {classrooms.filter(c => c.cameraType === 'none').length}
                </p>
              </div>
              <Building className="w-10 h-10 text-gray-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({classrooms.length})
        </Button>
        <Button
          variant={filter === 'camera' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('camera')}
        >
          <Camera className="w-4 h-4 mr-1" />
          With Camera ({classrooms.filter(c => c.hasCamera).length})
        </Button>
        <Button
          variant={filter === 'no-camera' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('no-camera')}
        >
          No Camera ({classrooms.filter(c => !c.hasCamera).length})
        </Button>
      </div>

      {/* Classrooms Grid */}
      {filteredClassrooms.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No classrooms found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Create your first classroom to get started'
                  : `No classrooms match the selected filter`
                }
              </p>
              {filter === 'all' && (
                <Link href="/admin/create-classroom">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Classroom
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <Card key={classroom._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{classroom.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Room {classroom.roomNumber}
                      {classroom.building && ` · ${classroom.building}`}
                    </p>
                  </div>
                  {getCameraBadge(classroom.cameraType)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Details */}
                <div className="space-y-2 text-sm">
                  {classroom.floor && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{classroom.floor}</span>
                    </div>
                  )}
                  {classroom.capacity && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {classroom.capacity} students</span>
                    </div>
                  )}
                  {classroom.cameraType === 'cctv' && classroom.rtspUrl && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Camera className="w-4 h-4" />
                      <span className="text-xs font-mono truncate">
                        {classroom.rtspUrl.substring(0, 30)}...
                      </span>
                    </div>
                  )}
                  {classroom.notes && (
                    <p className="text-xs text-gray-500 italic">
                      {classroom.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      alert('Edit functionality coming soon!');
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(classroom._id, classroom.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
