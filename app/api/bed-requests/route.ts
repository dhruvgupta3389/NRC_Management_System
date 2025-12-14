import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || undefined;
    const status = searchParams.get('status') || undefined;
    const urgencyLevel = searchParams.get('urgencyLevel') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let query = supabase.from('bed_requests').select('*');

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (urgencyLevel) {
      query = query.eq('urgency_level', urgencyLevel);
    }

    const { data: bedRequests, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching bed requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bed requests' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${bedRequests?.length || 0} bed requests`);
    return NextResponse.json(
      {
        data: bedRequests || [],
        total: count || 0,
        count: bedRequests?.length || 0
      },
      { status: 200 }
    );
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Support both camelCase and snake_case property names
    const bedRequestData = {
      patient_id: body.patientId || body.patient_id,
      urgency_level: body.urgencyLevel || body.urgency_level,
      medical_justification: body.medicalJustification || body.medical_justification,
      current_condition: body.currentCondition || body.current_condition,
      estimated_stay_duration: body.estimatedStayDuration || body.estimated_stay_duration,
      special_requirements: body.specialRequirements || body.special_requirements || null,
      requested_by: body.requestedBy || body.requested_by,
      request_date: body.requestDate || body.request_date,
      status: body.status || 'pending',
      hospital_referral: body.hospitalReferral || body.hospital_referral || null
    };

    const { data, error } = await supabase
      .from('bed_requests')
      .insert([bedRequestData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating bed request:', error);
      return NextResponse.json(
        { error: 'Failed to create bed request' },
        { status: 500 }
      );
    }

    console.log(`✅ Bed request created: ${data.id}`);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
