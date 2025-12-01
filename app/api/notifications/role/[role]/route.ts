import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
  try {
    const { role } = params;

    let notifications = csvManager.readCSV('notifications.csv') || [];
    notifications = notifications.filter((n: any) => n.user_role === role);
    notifications = notifications.slice(0, 100);

    console.log(`✅ Fetched ${notifications.length} notifications for role ${role}`);
    return NextResponse.json(notifications, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
