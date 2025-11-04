import { NextRequest, NextResponse } from 'next/server';
import { csvManager } from '@/lib/csvManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    const { status, patientId, admissionDate } = body;

    console.log(`📝 Updating bed ${id} with data:`, JSON.stringify(body, null, 2));

    console.log('🔄 Starting CSV update...');

    const bedUpdates = {
      status,
      patient_id: patientId || '',
      admission_date: admissionDate || '',
      updated_at: new Date().toISOString()
    };

    const bedSuccess = csvManager.updateCSV('beds.csv', id, bedUpdates);

    if (!bedSuccess) {
      return NextResponse.json(
        { error: 'Bed not found' },
        { status: 404 }
      );
    }

    if (patientId) {
      console.log('💾 Updating patient bed assignment...');
      csvManager.updateCSV('patients.csv', patientId, {
        bed_id: id,
        updated_at: new Date().toISOString()
      });
    } else if (status === 'available') {
      console.log('💾 Clearing patient bed assignment...');
      const patients = csvManager.readCSV('patients.csv');
      const patientWithBed = patients.find((p: Record<string, any>) => p.bed_id === id);
      if (patientWithBed) {
        csvManager.updateCSV('patients.csv', patientWithBed.id, {
          bed_id: '',
          updated_at: new Date().toISOString()
        });
      }
    }

    console.log('✅ Bed successfully updated in CSV');
    return NextResponse.json({ message: 'Bed updated successfully' });
  } catch (err) {
    console.error('❌ Error updating bed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update bed' },
      { status: 500 }
    );
  }
}
