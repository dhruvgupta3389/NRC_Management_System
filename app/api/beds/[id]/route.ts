import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

async function updateBedInSupabase(id: string, data: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: result, error } = await supabase
      .from('beds')
      .update(data)
      .eq('id', id)
      .select();

    if (error) return null;
    return result?.[0] || null;
  } catch (error) {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateData = {
      status: body.status,
      patient_id: body.patientId || null,
      admission_date: body.admissionDate || null,
      patient_name: body.patientName || null,
      patient_type: body.patientType || null,
      nutrition_status: body.nutritionStatus || null,
      hospital_name: body.hospitalName || null
    };

    // Try Supabase first
    let result = await updateBedInSupabase(id, updateData);

    // Fallback to CSV
    if (!result) {
      const success = csvManager.updateCSV('beds.csv', id, updateData);
      if (success) {
        result = csvManager.findOne('beds.csv', { id });
      }
    }

    if (result) {
      console.log('✅ Bed updated successfully:', id);
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Bed not found' },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
