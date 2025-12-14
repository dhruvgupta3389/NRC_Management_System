import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Map camelCase properties to snake_case
    if (body.status !== undefined) updateData.status = body.status;
    if (body.reviewedBy !== undefined) updateData.reviewed_by = body.reviewedBy;
    if (body.reviewDate !== undefined) updateData.review_date = body.reviewDate;
    if (body.reviewComments !== undefined) updateData.review_comments = body.reviewComments;
    if (body.hospitalReferral !== undefined) updateData.hospital_referral = body.hospitalReferral;

    const { data: result, error } = await supabase
      .from('bed_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating bed request:', error);
      return NextResponse.json(
        { error: 'Bed request not found or update failed' },
        { status: 404 }
      );
    }

    console.log(`✅ Bed request updated: ${id}`);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
