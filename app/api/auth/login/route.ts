import { NextRequest, NextResponse } from 'next/server';
import { sign, type Secret } from 'jsonwebtoken';
import { csvManager } from '@/lib/csvManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, employee_id } = body;

    console.log('🔐 Login attempt for:', { username, employee_id });

    const searchCriteria: any = {
      username: username,
      is_active: 'true'
    };

    if (employee_id) {
      searchCriteria.employee_id = employee_id;
    }

    const user = csvManager.findOne('users.csv', searchCriteria);

    if (!user) {
      console.log('❌ User not found in CSV database');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('✅ User found in CSV database:', user.name);

    const validPassword = 
      password === 'worker123' || 
      password === 'super123' || 
      password === 'hosp123' || 
      password === 'admin123';

    if (!validPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const secret: Secret = process.env.JWT_SECRET ?? 'default-secret';
    const token = sign(
      {
        userId: user.id,
        employeeId: user.employee_id,
        role: user.role
      },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '24h') as string }
    );

    console.log('✅ Login successful for:', user.name);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        name: user.name,
        role: user.role,
        contact_number: user.contact_number,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Login failed' },
      { status: 500 }
    );
  }
}
