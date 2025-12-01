import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

async function getNotificationsByRoleFromSupabase(role: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_role', role)
      .order('notification_date', { ascending: false })
      .limit(100);

    if (error) return null;
    return data || [];
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
  try {
    const { role } = params;

    // Try Supabase first
    let notifications = await getNotificationsByRoleFromSupabase(role);

    // Fallback to CSV
    if (!notifications) {
      notifications = csvManager.readCSV('notifications.csv') || [];
      notifications = notifications.filter((n: any) => n.user_role === role);
      notifications = notifications.slice(0, 100);
    }

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
