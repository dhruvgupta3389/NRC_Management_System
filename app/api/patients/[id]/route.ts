import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

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
      medical_history: body.medicalHistory ? JSON.stringify(body.medicalHistory) : undefined,
      symptoms: body.symptoms ? JSON.stringify(body.symptoms) : undefined,
      remarks: body.remarks,
      risk_score: body.riskScore,
      nutritional_deficiency: body.nutritionalDeficiency ? JSON.stringify(body.nutritionalDeficiency) : undefined,
      last_visit_date: body.lastVisitDate,
      next_visit_date: body.nextVisitDate,
      bed_id: body.bedId
    };

    const success = csvManager.updateCSV('patients.csv', id, updateData);

    if (success) {
      console.log('✅ Patient updated successfully:', id);
      const updatedPatient = csvManager.findOne('patients.csv', { id });
      return NextResponse.json(updatedPatient, { status: 200 });
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
