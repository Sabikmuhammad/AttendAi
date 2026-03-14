import { NextRequest, NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    const response = await fetch(`${AI_SERVICE_URL}/monitor/status/${classId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Monitor status proxy error:', error);
    return NextResponse.json(
      { success: false, detail: 'AI monitoring service is unavailable' },
      { status: 503 }
    );
  }
}
