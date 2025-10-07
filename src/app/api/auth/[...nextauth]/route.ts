import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate that credentials were provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            gym: true
          }
        });

        // Check if user exists
        if (!user) {
          throw new Error("No user found with this email");
        }

        // Check if user has a password (they might be using OAuth)
        if (!user.password) {
          throw new Error("Please use a different sign-in method");
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Return user object (password excluded for security)
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          gymId: user.gymId,
          gymName: user.gym.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt", // Use JWT for sessions
  },
  pages: {
    signIn: "/auth/signin", // Custom sign-in page (we'll create this later)
    error: "/auth/error",   // Custom error page
  },
  callbacks: {
    // Include additional user data in the JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.gymId = user.gymId;
        token.gymName = user.gymName;
      }
      return token;
    },
    // Include additional user data in the session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.gymId = token.gymId as string;
        session.user.gymName = token.gymName as string;
      }
      return session;
    },
    // Handle sign in - create gym for new OAuth users
    async signIn({ user, account, profile }) {
      // For OAuth providers (like Google)
      if (account?.provider === "google") {
        // Check if user already exists with a gym
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { gym: true },
        });

        // If user exists but has no gym, we need to handle this
        // For now, we'll just allow sign in
        // In production, you might want to prompt for gym creation
        return true;
      }
      return true;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
