import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log(`📝 Marking notification ${id} as read...`);

    const success = csvManager.updateCSV('notifications.csv', id, {
      read_status: 'true',
      updated_at: new Date().toISOString()
    });

    if (success) {
      console.log('✅ Notification successfully marked as read in CSV');
      return NextResponse.json({ message: 'Notification marked as read' });
    } else {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error('❌ Error updating notification:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update notification' },
      { status: 500 }
    );
  }
}
