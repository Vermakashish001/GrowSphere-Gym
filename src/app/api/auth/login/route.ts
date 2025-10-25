import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/login
 * Custom login endpoint that returns JSON (better for API testing)
 * Alternative to NextAuth's credential flow for direct API access
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        gym: true,
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Please use a different sign-in method' },
        { status: 401 }
      );
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          gymId: user.gymId,
          gym: {
            id: user.gym.id,
            name: user.gym.name,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
