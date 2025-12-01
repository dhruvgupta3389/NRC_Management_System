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
    const hospitalId = searchParams.get('hospitalId');
    const status = searchParams.get('status');

    let query = supabase
      .from('beds')
      .select('*');

    if (hospitalId) {
      query = query.eq('hospital_id', hospitalId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('bed_number', { ascending: true });

    if (error) {
      console.error('❌ Error fetching beds:', error);
      return NextResponse.json(
        { error: 'Failed to fetch beds' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${data?.length || 0} beds`);
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

    const bedData = {
      hospital_id: body.hospitalId,
      bed_number: body.bedNumber,
      ward: body.ward,
      status: body.status || 'available',
      patient_id: body.patientId || null,
      admission_date: body.admissionDate || null,
      patient_name: body.patientName || null,
      patient_type: body.patientType || null,
      nutrition_status: body.nutritionStatus || null,
      hospital_name: body.hospitalName || null
    };

    const { data, error } = await supabase
      .from('beds')
      .insert([bedData])
      .select();

    if (error) {
      console.error('❌ Error creating bed:', error);
      return NextResponse.json(
        { error: 'Failed to create bed' },
        { status: 500 }
      );
    }

    console.log('✅ Bed created successfully:', data?.[0]?.id);
    return NextResponse.json(data?.[0], { status: 201 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
