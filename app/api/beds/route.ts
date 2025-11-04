import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching all beds from CSV...');

    const beds = csvManager.readCSV('beds.csv');
    const patients = csvManager.readCSV('patients.csv');
    const hospitals = csvManager.readCSV('hospitals.csv');

    const transformedBeds = beds.map(bed => {
      const patient = bed.patient_id ? patients.find((p: Record<string, any>) => p.id === bed.patient_id) : null;
      const hospital = hospitals.find((h: Record<string, any>) => h.id === bed.hospital_id);

      return {
        id: bed.id,
        hospitalId: bed.hospital_id,
        number: bed.number,
        ward: bed.ward,
        status: bed.status,
        patientId: bed.patient_id || undefined,
        admissionDate: bed.admission_date || undefined,
        patientName: patient?.name,
        patientType: patient?.type,
        nutritionStatus: patient?.nutrition_status,
        hospitalName: hospital?.name
      };
    });

    console.log(`✅ Successfully retrieved ${transformedBeds.length} beds from CSV`);
    return NextResponse.json(transformedBeds);
  } catch (err) {
    console.error('❌ Error fetching beds:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch beds' },
      { status: 500 }
    );
  }
}
