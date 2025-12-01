import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

async function getPatientsFromSupabase(registeredBy?: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let query = supabase.from('patients').select('*');

    if (registeredBy) {
      query = query.eq('registered_by', registeredBy);
    }

    const { data, error } = await query.order('registration_date', { ascending: false });

    if (error) {
      console.log('Supabase query failed:', error.message);
      return null;
    }

    return data || [];
  } catch (error) {
    console.log('Supabase import failed:', error);
    return null;
  }
}

async function createPatientInSupabase(patientData: any) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.from('patients').insert([patientData]).select();

    if (error) {
      console.log('Supabase insert failed:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.log('Supabase import failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registeredBy = searchParams.get('registeredBy') || undefined;

    // Try Supabase first
    let patients = await getPatientsFromSupabase(registeredBy);

    // Fallback to CSV
    if (!patients) {
      patients = csvManager.readCSV('patients.csv') || [];
      if (registeredBy) {
        patients = patients.filter((p: any) => p.registered_by === registeredBy);
      }
    }

    console.log(`✅ Fetched ${patients.length} patients`);
    return NextResponse.json(patients, { status: 200 });
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

    // Try Supabase first
    let result = await createPatientInSupabase(patientData);

    // Fallback to CSV
    if (!result) {
      const csvData = {
        id: `patient-${Date.now()}`,
        ...patientData,
        medical_history: JSON.stringify(patientData.medical_history),
        symptoms: JSON.stringify(patientData.symptoms),
        nutritional_deficiency: JSON.stringify(patientData.nutritional_deficiency)
      };
      
      const success = csvManager.writeToCSV('patients.csv', csvData);
      result = success ? csvData : null;
    }

    if (result) {
      console.log('✅ Patient created successfully:', result.id);
      return NextResponse.json(result, { status: 201 });
    } else {
      throw new Error('Failed to create patient');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
