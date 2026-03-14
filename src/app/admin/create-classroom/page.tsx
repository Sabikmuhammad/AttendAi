'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, MapPin, Camera, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateClassroomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    roomNumber: '',
    building: '',
    floor: '',
    capacity: '',
    latitude: '',
    longitude: '',
    hasCamera: false,
    cameraType: 'none',
    rtspUrl: '',
    rtspUsername: '',
    rtspPassword: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.roomNumber) {
      setError('Name and room number are required');
      return;
    }

    if (formData.cameraType === 'cctv' && !formData.rtspUrl) {
      setError('RTSP URL is required for CCTV cameras');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          roomNumber: formData.roomNumber,
          building: formData.building || undefined,
          floor: formData.floor || undefined,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          location: (formData.latitude && formData.longitude) ? {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
          } : undefined,
          hasCamera: formData.hasCamera,
          cameraType: formData.cameraType,
          rtspUrl: formData.rtspUrl || undefined,
          rtspUsername: formData.rtspUsername || undefined,
          rtspPassword: formData.rtspPassword || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/classrooms');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create classroom');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCameraTypeChange = (type: string) => {
    setFormData({
      ...formData,
      cameraType: type,
      hasCamera: type !== 'none',
      // Clear RTSP fields if switching away from CCTV
      rtspUrl: type === 'cctv' ? formData.rtspUrl : '',
      rtspUsername: type === 'cctv' ? formData.rtspUsername : '',
      rtspPassword: type === 'cctv' ? formData.rtspPassword : '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Classroom</h1>
        <p className="text-gray-600 mt-2">
          Add a new classroom with camera configuration for attendance monitoring
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Classroom created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Classroom Name *</Label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Lecture Hall"
              />
            </div>

            <div>
              <Label>Room Number *</Label>
              <Input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g., A-101"
              />
            </div>

            <div>
              <Label>Building</Label>
              <Input
                type="text"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="e.g., Engineering Block"
              />
            </div>

            <div>
              <Label>Floor</Label>
              <Input
                type="text"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="e.g., Ground Floor, 2nd Floor"
              />
            </div>

            <div>
              <Label>Capacity (Students)</Label>
              <Input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 60"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional information"
              />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Location (Optional)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g., 37.7749"
              />
            </div>

            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g., -122.4194"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            GPS coordinates for classroom location tracking (optional)
          </p>
        </Card>

        {/* Camera Configuration */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Camera Configuration</h2>
          </div>

          <div className="space-y-6">
            {/* Camera Type Selection */}
            <div>
              <Label>Camera Type *</Label>
              <select
                required
                value={formData.cameraType}
                onChange={(e) => handleCameraTypeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="none">No Camera</option>
                <option value="webcam">Webcam (Manual Start)</option>
                <option value="cctv">CCTV Camera (Automatic)</option>
              </select>
              
              {formData.cameraType === 'none' && (
                <p className="text-sm text-gray-500 mt-2">
                  No camera monitoring for this classroom
                </p>
              )}
              {formData.cameraType === 'webcam' && (
                <p className="text-sm text-blue-600 mt-2">
                  📹 Webcam requires manual start from faculty dashboard
                </p>
              )}
              {formData.cameraType === 'cctv' && (
                <p className="text-sm text-green-600 mt-2">
                  📷 CCTV automatically starts monitoring when class begins
                </p>
              )}
            </div>

            {/* CCTV Configuration - Only show if CCTV selected */}
            {formData.cameraType === 'cctv' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 mb-3">
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-semibold">CCTV Camera Configuration</span>
                </div>

                <div>
                  <Label>RTSP URL *</Label>
                  <Input
                    type="text"
                    required={formData.cameraType === 'cctv'}
                    value={formData.rtspUrl}
                    onChange={(e) => setFormData({ ...formData, rtspUrl: e.target.value })}
                    placeholder="rtsp://username:password@192.168.1.100:554/stream"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Common formats:</strong>
                    <br />• Hikvision: rtsp://admin:pass@192.168.1.100:554/Streaming/Channels/101
                    <br />• Dahua: rtsp://admin:pass@192.168.1.100:554/cam/realmonitor?channel=1
                    <br />• Generic: rtsp://admin:pass@192.168.1.100:554/stream
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>RTSP Username (Optional)</Label>
                    <Input
                      type="text"
                      value={formData.rtspUsername}
                      onChange={(e) => setFormData({ ...formData, rtspUsername: e.target.value })}
                      placeholder="admin"
                    />
                  </div>

                  <div>
                    <Label>RTSP Password (Optional)</Label>
                    <Input
                      type="password"
                      value={formData.rtspPassword}
                      onChange={(e) => setFormData({ ...formData, rtspPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs">
                    <strong>💡 Testing Tips:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Test RTSP URL with VLC Media Player before saving</li>
                      <li>Ensure camera is on same network or port forwarding is configured</li>
                      <li>Default RTSP port is 554</li>
                      <li>Check camera documentation for correct stream path</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Creating...' : 'Create Classroom'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
