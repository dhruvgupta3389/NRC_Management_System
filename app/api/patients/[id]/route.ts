import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Build update object dynamically to only update provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Standard patient fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.age !== undefined) updateData.age = body.age;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.pregnancyWeek !== undefined) updateData.pregnancy_week = body.pregnancyWeek;
    if (body.contactNumber !== undefined) updateData.contact_number = body.contactNumber;
    if (body.emergencyContact !== undefined) updateData.emergency_contact = body.emergencyContact;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.height !== undefined) updateData.height = body.height;
    if (body.bloodPressure !== undefined) updateData.blood_pressure = body.bloodPressure;
    if (body.temperature !== undefined) updateData.temperature = body.temperature;
    if (body.hemoglobin !== undefined) updateData.hemoglobin = body.hemoglobin;
    if (body.nutritionStatus !== undefined) updateData.nutrition_status = body.nutritionStatus;
    if (body.medicalHistory !== undefined) updateData.medical_history = body.medicalHistory;
    if (body.symptoms !== undefined) updateData.symptoms = body.symptoms;
    if (body.remarks !== undefined) updateData.remarks = body.remarks;
    if (body.riskScore !== undefined) updateData.risk_score = body.riskScore;
    if (body.nutritionalDeficiency !== undefined) updateData.nutritional_deficiency = body.nutritionalDeficiency;
    if (body.lastVisitDate !== undefined) updateData.last_visit_date = body.lastVisitDate;
    if (body.nextVisitDate !== undefined) updateData.next_visit_date = body.nextVisitDate;

    // UUID fields - convert empty strings to null to avoid PostgreSQL uuid validation errors
    const toNullIfEmpty = (val: any) => (val === '' || val === null) ? null : val;
    if (body.bedId !== undefined) updateData.bed_id = toNullIfEmpty(body.bedId);

    // Discharge-related fields (for discharge workflow)
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    if (body.dischargeDate !== undefined) updateData.discharge_date = body.dischargeDate;
    if (body.dischargeReason !== undefined) updateData.discharge_reason = body.dischargeReason;
    if (body.lastBedId !== undefined) updateData.last_bed_id = toNullIfEmpty(body.lastBedId);
    if (body.lastAdmissionDate !== undefined) updateData.last_admission_date = body.lastAdmissionDate;

    const { data: result, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating patient:', error);
      return NextResponse.json(
        { error: 'Patient not found or update failed' },
        { status: 404 }
      );
    }

    console.log(`✅ Patient updated: ${id}`);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('patients')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting patient:', error);
      return NextResponse.json(
        { error: 'Patient not found or delete failed' },
        { status: 404 }
      );
    }

    console.log(`✅ Patient deleted (soft): ${id}`);
    return NextResponse.json(
      { message: 'Patient deleted successfully' },
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
