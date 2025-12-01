import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registeredBy = searchParams.get('registeredBy');

    let patients = csvManager.readCSV('patients.csv') || [];

    if (registeredBy) {
      patients = patients.filter((p: any) => p.registered_by === registeredBy);
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
      id: `patient-${Date.now()}`,
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
      medical_history: body.medicalHistory ? JSON.stringify(body.medicalHistory) : '[]',
      symptoms: body.symptoms ? JSON.stringify(body.symptoms) : '[]',
      remarks: body.remarks,
      risk_score: body.riskScore,
      nutritional_deficiency: body.nutritionalDeficiency ? JSON.stringify(body.nutritionalDeficiency) : '[]',
      registered_by: body.registeredBy,
      registration_date: new Date().toISOString(),
      admission_date: body.admissionDate || new Date().toISOString().split('T')[0],
      aadhaar_number: body.aadhaarNumber,
      last_visit_date: body.lastVisitDate,
      next_visit_date: body.nextVisitDate
    };

    const success = csvManager.writeToCSV('patients.csv', patientData);

    if (success) {
      console.log('✅ Patient created successfully:', patientData.id);
      return NextResponse.json(patientData, { status: 201 });
    } else {
      throw new Error('Failed to write patient data to CSV');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
