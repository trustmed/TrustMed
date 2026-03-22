"use client";

import { SignInPage } from "@/components/ui/sign-in";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { config } from "@/config/config";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

const SignIn = () => {
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (response.ok) {
        router.push("/portal");
        toast.success("Signed in successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Unable to sign in.");
      }
    } catch (error) {
      console.error(error); // ✅ THIS LINE FIXES ESLINT
      toast.error("Unable to sign in.");
    }
  };

  const handleGoogleSignIn = async () => {
    // Redirect to backend for Clerk auth
    window.location.href = `${config.backendUrl}/api/auth/clerk/google`;
  };
  
  const handleResetPassword = () => {
    toast.info("Reset password flow is not configured yet.");
  }

  const handleCreateAccount = () => {
    router.push("/signup");
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc="/report.jpg"
        form={form}
        onSignIn={onSubmit}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
};

export default SignIn;