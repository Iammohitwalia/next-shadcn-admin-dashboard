"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Globe } from "lucide-react";
import { CheckCircle2, Mail, Loader2 } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase/client";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const verified = searchParams.get("verified");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkVerification = async () => {
      // If verified param is present, user just came from callback
      if (verified === "true") {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        return;
      }

      try {
        const {
          data: { user },
          error,
        } = await supabaseClient.auth.getUser();

        if (error) {
          setStatus("error");
          setMessage("Unable to verify email. Please check your email for the verification link.");
          return;
        }

        if (user?.email_confirmed_at) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage("Email verification pending. Please check your email for the verification link.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email.");
      }
    };

    checkVerification();
  }, [verified]);

  return (
    <>
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]">
        <div className="space-y-6 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto size-12 animate-spin text-primary" />
              <div className="space-y-2">
                <h1 className="text-3xl font-medium">Verifying your email</h1>
                <p className="text-muted-foreground text-sm">Please wait while we verify your email address.</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto size-12 text-green-500" />
              <div className="space-y-2">
                <h1 className="text-3xl font-medium">Email Verified!</h1>
                <p className="text-muted-foreground text-sm">{message}</p>
              </div>
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Continue to Login</Link>
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <Mail className="mx-auto size-12 text-muted-foreground" />
              <div className="space-y-2">
                <h1 className="text-3xl font-medium">Verify Your Email</h1>
                <p className="text-muted-foreground text-sm">{message}</p>
                {email && (
                  <p className="text-muted-foreground text-xs">
                    We sent a verification link to <strong>{email}</strong>
                  </p>
                )}
              </div>
              <div className="pt-4 space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
                <p className="text-muted-foreground text-xs">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <Link href="/auth/register" className="text-primary underline">
                    try registering again
                  </Link>
                  .
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="absolute top-5 flex w-full justify-end px-10">
        <div className="text-muted-foreground text-sm">
          Already verified?{" "}
          <Link className="text-foreground" href="login">
            Login
          </Link>
        </div>
      </div>

      <div className="absolute bottom-5 flex w-full justify-between px-10">
        <div className="text-sm">{APP_CONFIG.copyright}</div>
        <div className="flex items-center gap-1 text-sm">
          <Globe className="text-muted-foreground size-4" />
          ENG
        </div>
      </div>
    </>
  );
}

