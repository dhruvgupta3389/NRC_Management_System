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
      status: body.status,
      patient_id: body.patientId || null,
      admission_date: body.admissionDate || null,
      patient_name: body.patientName || null,
      patient_type: body.patientType || null,
      nutrition_status: body.nutritionStatus || null,
      hospital_name: body.hospitalName || null
    };

    const success = csvManager.updateCSV('beds.csv', id, updateData);

    if (success) {
      console.log('✅ Bed updated successfully:', id);
      const updatedBed = csvManager.findOne('beds.csv', { id });
      return NextResponse.json(updatedBed, { status: 200 });
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
