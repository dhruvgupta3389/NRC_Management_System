import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { csvManager } from '@/lib/csvManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📝 Received notification data from frontend:', JSON.stringify(body, null, 2));

    const notificationData = {
      id: uuidv4(),
      user_role: body.userRole,
      type: body.type,
      title: body.title,
      message: body.message,
      priority: body.priority || 'medium',
      action_required: (body.actionRequired || false).toString(),
      read_status: 'false',
      date: body.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    console.log('🔄 Processing notification data for CSV storage:', JSON.stringify(notificationData, null, 2));

    const success = csvManager.writeToCSV('notifications.csv', notificationData);

    if (success) {
      console.log('✅ Notification successfully saved to CSV with ID:', notificationData.id);
      return NextResponse.json(
        {
          message: 'Notification created successfully',
          id: notificationData.id
        },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to save notification to CSV');
    }
  } catch (err) {
    console.error('❌ Error creating notification:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create notification' },
      { status: 500 }
    );
  }
}
