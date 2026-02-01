"use client";

import { SignUpPage } from "@/components/ui/sign-up";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

  const onSubmit = (data: SignUpFormValues) => {
    console.log("Sign Up submitted:", data);
    alert(`Sign Up Submitted! Check the browser console for form data.`);
  };

  const handleGoogleSignUp = () => {
    console.log("Continue with Google clicked");
    alert("Continue with Google clicked");
  };
  
  const handleSignInClick = () => {
    router.push("/signin");
  }

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
