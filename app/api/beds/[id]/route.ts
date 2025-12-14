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
    const { data: bed, error } = await supabase
      .from('beds')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !bed) {
      return NextResponse.json(
        { error: 'Bed not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bed, { status: 200 });
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

    // Support both camelCase and snake_case property names
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Map request body to database columns (accept both formats)
    if (body.status !== undefined) updateData.status = body.status;
    if (body.patient_id !== undefined || body.patientId !== undefined) {
      updateData.patient_id = body.patient_id ?? body.patientId ?? null;
    }
    if (body.admission_date !== undefined || body.admissionDate !== undefined) {
      updateData.admission_date = body.admission_date ?? body.admissionDate ?? null;
    }
    if (body.patient_name !== undefined || body.patientName !== undefined) {
      updateData.patient_name = body.patient_name ?? body.patientName ?? null;
    }
    if (body.patient_type !== undefined || body.patientType !== undefined) {
      updateData.patient_type = body.patient_type ?? body.patientType ?? null;
    }
    if (body.nutrition_status !== undefined || body.nutritionStatus !== undefined) {
      updateData.nutrition_status = body.nutrition_status ?? body.nutritionStatus ?? null;
    }
    if (body.hospital_name !== undefined || body.hospitalName !== undefined) {
      updateData.hospital_name = body.hospital_name ?? body.hospitalName ?? null;
    }

    const { data: result, error } = await supabase
      .from('beds')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating bed:', error);
      return NextResponse.json(
        { error: 'Bed not found or update failed' },
        { status: 404 }
      );
    }

    console.log(`✅ Bed updated: ${id}`);
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
      .from('beds')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting bed:', error);
      return NextResponse.json(
        { error: 'Bed not found or delete failed' },
        { status: 404 }
      );
    }

    console.log(`✅ Bed deleted: ${id}`);
    return NextResponse.json(
      { message: 'Bed deleted successfully' },
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
