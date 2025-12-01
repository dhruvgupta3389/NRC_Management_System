import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('notification_date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${data?.length || 0} notifications for user ${userId}`);
    return NextResponse.json(data || [], { status: 200 });
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

    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();

    if (error) {
      console.error('❌ Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    console.log('✅ Notification created successfully:', data?.[0]?.id);
    return NextResponse.json(data?.[0], { status: 201 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
