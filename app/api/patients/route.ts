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
    const registeredBy = searchParams.get('registeredBy');

    let query = supabase
      .from('patients')
      .select('*')
      .eq('is_active', true);

    if (registeredBy) {
      query = query.eq('registered_by', registeredBy);
    }

    const { data, error } = await query.order('registration_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching patients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch patients' },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${data?.length || 0} patients`);
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

    const registrationNumber = `REG-${Date.now()}`;

    const patientData = {
      registration_number: registrationNumber,
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
      medical_history: body.medicalHistory || [],
      symptoms: body.symptoms || [],
      remarks: body.remarks,
      risk_score: body.riskScore,
      nutritional_deficiency: body.nutritionalDeficiency || [],
      registered_by: body.registeredBy,
      registration_date: new Date().toISOString(),
      admission_date: body.admissionDate || new Date().toISOString().split('T')[0],
      aadhaar_number: body.aadhaarNumber,
      last_visit_date: body.lastVisitDate,
      next_visit_date: body.nextVisitDate
    };

    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select();

    if (error) {
      console.error('❌ Error creating patient:', error);
      return NextResponse.json(
        { error: 'Failed to create patient' },
        { status: 500 }
      );
    }

    console.log('✅ Patient created successfully:', data?.[0]?.id);
    return NextResponse.json(data?.[0], { status: 201 });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
