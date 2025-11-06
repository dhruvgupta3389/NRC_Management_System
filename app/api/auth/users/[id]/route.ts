import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { csvManager } from '@/lib/csvManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    console.log(`📝 Updating user ${id} in CSV:`, JSON.stringify(body, null, 2));

    const updates: Record<string, any> = { ...body };

    if (updates.contactNumber) {
      updates.contact_number = updates.contactNumber;
      delete updates.contactNumber;
    }
    if (updates.isActive !== undefined) {
      updates.is_active = updates.isActive.toString();
      delete updates.isActive;
    }
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 12);
      delete updates.password;
    }

    const success = csvManager.updateCSV('users.csv', id, updates);

    if (success) {
      console.log('✅ User successfully updated in CSV database');
      return NextResponse.json({ message: 'User updated successfully' });
    } else {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error('❌ Error updating user in CSV:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update user' },
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

    console.log(`🗑️ Soft deleting user ${id} in CSV...`);

    const success = csvManager.updateCSV('users.csv', id, {
      is_active: 'false',
      updated_at: new Date().toISOString()
    });

    if (success) {
      console.log('✅ User successfully deactivated in CSV database');
      return NextResponse.json({ message: 'User deactivated successfully' });
    } else {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error('❌ Error deactivating user in CSV:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}
