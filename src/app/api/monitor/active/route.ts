import { NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/monitor/active`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Monitor active proxy error:', error);
    return NextResponse.json(
      { success: false, detail: 'AI monitoring service is unavailable' },
      { status: 503 }
    );
  }
}
