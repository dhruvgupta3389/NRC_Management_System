import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

async function updatePatientInSupabase(id: string, data: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: result, error } = await supabase
      .from('patients')
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
      bed_id: body.bedId
    };

    // Try Supabase first
    let result = await updatePatientInSupabase(id, updateData);

    // Fallback to CSV
    if (!result) {
      const csvUpdateData = {
        ...updateData,
        medical_history: updateData.medical_history ? JSON.stringify(updateData.medical_history) : undefined,
        symptoms: updateData.symptoms ? JSON.stringify(updateData.symptoms) : undefined,
        nutritional_deficiency: updateData.nutritional_deficiency ? JSON.stringify(updateData.nutritional_deficiency) : undefined
      };

      const success = csvManager.updateCSV('patients.csv', id, csvUpdateData);
      if (success) {
        result = csvManager.findOne('patients.csv', { id });
      }
    }

    if (result) {
      console.log('✅ Patient updated successfully:', id);
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Patient not found' },
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
