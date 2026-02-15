"use client";

import { SignUpPage } from "@/components/ui/sign-up";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
  const { isLoaded, setActive, signUp } = useSignUp();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const getClerkErrorMessage = (error: unknown) => {
    if (error && typeof error === "object" && "errors" in error) {
      const typedError = error as { errors?: Array<{ message?: string }> };
      return typedError.errors?.[0]?.message ?? "Unable to sign up.";
    }

    return "Unable to sign up.";
  };

  const onSubmit = async (data: SignUpFormValues) => {
    if (!isLoaded) {
      return;
    }

    const [firstName, ...rest] = data.name.trim().split(" ");
    const lastName = rest.join(" ") || undefined;

    try {
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName,
        lastName,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/portal");
        return;
      }

      toast.success("Sign-up created. If verification is required, complete it in Clerk and then sign in.");
      router.push("/signin");
    } catch (error) {
      toast.error(getClerkErrorMessage(error));
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) {
      return;
    }

    await signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/signup",
      redirectUrlComplete: "/portal",
    });
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
