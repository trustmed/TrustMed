"use client";

import { SignUpPage } from "@/components/ui/sign-up";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { config } from "@/config/config";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      if (response.ok) {
        toast.success("Account created successfully. Please sign in.");
        router.push("/signin");
      } else {
        const errorRes = await response.json();
        toast.error(errorRes.message || "Unable to sign up.");
      }
    } catch (error) {
      console.error(error); // ✅ THIS LINE FIXES ESLINT
      toast.error("Unable to sign up.");
    }
  };

  const handleGoogleSignUp = async () => {
    window.location.href = `${config.backendUrl}/api/auth/clerk/google`;
  };

  const handleSignInClick = () => {
    router.push("/signin");
  };

  return (
    <div className="bg-background text-foreground">
      <SignUpPage
        heroImageSrc="/report.jpg"
        form={form}
        onSignUp={onSubmit}
        onGoogleSignUp={handleGoogleSignUp}
        onSignInClick={handleSignInClick}
      />
    </div>
  );
};

export default SignUp;