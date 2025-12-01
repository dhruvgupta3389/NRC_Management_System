import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const status = searchParams.get('status');

    let beds = csvManager.readCSV('beds.csv') || [];

    if (hospitalId) {
      beds = beds.filter((b: any) => b.hospital_id === hospitalId);
    }

    if (status) {
      beds = beds.filter((b: any) => b.status === status);
    }

    console.log(`✅ Fetched ${beds.length} beds`);
    return NextResponse.json(beds, { status: 200 });
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
      id: `bed-${Date.now()}`,
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

    const success = csvManager.writeToCSV('beds.csv', bedData);

    if (success) {
      console.log('✅ Bed created successfully:', bedData.id);
      return NextResponse.json(bedData, { status: 201 });
    } else {
      throw new Error('Failed to write bed data to CSV');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
