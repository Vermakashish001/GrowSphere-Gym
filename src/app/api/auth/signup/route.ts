import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * POST /api/auth/signup
 * Creates a new gym and gym owner account
 * This is separate from NextAuth - it's for initial user registration
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, password, firstName, lastName, gymName } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !gymName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the gym and user in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient): Promise<{ user: any; gym: any }> => {
      // Create the gym first
      const gym = await tx.gym.create({
        data: {
          name: gymName,
        },
      });

      // Create the user (gym owner) linked to the gym
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          gymId: gym.id,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          gymId: true,
          createdAt: true,
          gym: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { user, gym };
    });

    // Return success response
    return NextResponse.json(
      {
        message: 'Account created successfully. You can now sign in.',
        user: result.user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred during signup. Please try again.' },
      { status: 500 }
    );
  }
}
