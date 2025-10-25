"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo/logo.png";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function VerifyEmailChangeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token");
      return;
    }

    verifyEmailChange();
  }, [token]);

  const verifyEmailChange = async () => {
    try {
      const response = await fetch("/api/user/verify-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(`Your email has been successfully changed to ${data.newEmail}`);
        
        // Redirect to sign-in after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to verify email change");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while verifying your email change");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
            <Image src={logo} alt="GrowSphere Logo" width={40} height={40} className="object-contain" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">GrowSphere</h1>
          </div>

          {/* Status */}
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Verifying Email Change
                </h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your new email address...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Email Changed Successfully!
                </h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to sign in page...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Verification Failed
                </h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailChangeForm />
    </Suspense>
  );
}
