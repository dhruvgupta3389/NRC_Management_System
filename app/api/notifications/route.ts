import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

async function getNotificationsFromSupabase(userId: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('notification_date', { ascending: false })
      .limit(100);

    if (error) return null;
    return data || [];
  } catch (error) {
    return null;
  }
}

async function createNotificationInSupabase(data: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: result, error } = await supabase.from('notifications').insert([data]).select();

    if (error) return null;
    return result?.[0] || null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Try Supabase first
    let notifications = await getNotificationsFromSupabase(userId);

    // Fallback to CSV
    if (!notifications) {
      notifications = csvManager.readCSV('notifications.csv') || [];
      notifications = notifications.filter((n: any) => n.user_id === userId);
      notifications = notifications.slice(0, 100);
    }

    console.log(`✅ Fetched ${notifications.length} notifications for user ${userId}`);
    return NextResponse.json(notifications, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const notificationData = {
      user_id: body.userId,
      user_role: body.userRole,
      notification_type: body.type,
      title: body.title,
      message: body.message,
      priority: body.priority || 'medium',
      action_required: body.actionRequired || false,
      is_read: false,
      notification_date: new Date().toISOString()
    };

    // Try Supabase first
    let result = await createNotificationInSupabase(notificationData);

    // Fallback to CSV
    if (!result) {
      const csvData = {
        id: `notif-${Date.now()}`,
        ...notificationData,
        action_required: notificationData.action_required ? 'true' : 'false',
        is_read: 'false'
      };
      
      const success = csvManager.writeToCSV('notifications.csv', csvData);
      result = success ? csvData : null;
    }

    if (result) {
      console.log('✅ Notification created successfully:', result.id);
      return NextResponse.json(result, { status: 201 });
    } else {
      throw new Error('Failed to create notification');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
