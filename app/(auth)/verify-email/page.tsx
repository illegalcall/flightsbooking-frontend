"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center py-4">
            <Mail className="h-16 w-16 text-primary" />
          </div>
          
          <Alert className="border-blue-500 bg-blue-50">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Please check your email inbox and click on the verification link to complete your registration.
            </AlertDescription>
          </Alert>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Didn&apos;t receive an email? Check your spam folder or</p>
            <Button variant="link" className="p-0 h-auto">
              click here to resend
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Return to login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 