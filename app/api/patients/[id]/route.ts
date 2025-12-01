import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updateData = {
      name: body.name,
      age: body.age,
      type: body.type,
      pregnancy_week: body.pregnancyWeek,
      contact_number: body.contactNumber,
      emergency_contact: body.emergencyContact,
      address: body.address,
      weight: body.weight,
      height: body.height,
      blood_pressure: body.bloodPressure,
      temperature: body.temperature,
      hemoglobin: body.hemoglobin,
      nutrition_status: body.nutritionStatus,
      medical_history: body.medicalHistory,
      symptoms: body.symptoms,
      remarks: body.remarks,
      risk_score: body.riskScore,
      nutritional_deficiency: body.nutritionalDeficiency,
      last_visit_date: body.lastVisitDate,
      next_visit_date: body.nextVisitDate,
      bed_id: body.bedId,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error updating patient:', error);
      return NextResponse.json(
        { error: 'Failed to update patient' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    console.log('✅ Patient updated successfully:', id);
    return NextResponse.json(data[0], { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
